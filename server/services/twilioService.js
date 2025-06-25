import twilio from 'twilio';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

console.log('Initializing Twilio service...');
let twilioClient;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('Twilio client initialized');
} else {
  console.log('Twilio credentials not provided - Twilio service disabled');
}

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER);

export const sendTwilioWhatsAppMessage = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    // Format phone number for Twilio WhatsApp
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const twilioWhatsAppPhone = `whatsapp:${formattedPhone}`;

    const response = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: twilioWhatsAppPhone,
      body: message
    });

    return {
      success: true,
      messageId: response.sid,
      status: response.status
    };

  } catch (error) {
    console.error('Twilio WhatsApp API error:', error);

    return {
      success: false,
      error: error.message
    };
  }
};

export const sendCampaignMessagesTwilio = async (campaign, io) => {
  try {
    // Get template
    const template = await Template.findById(campaign.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Get contacts
    const contacts = await Contact.find({
      _id: { $in: campaign.contacts },
      status: 'active',
      optedOut: false
    });

    if (contacts.length === 0) {
      throw new Error('No active contacts found');
    }

    // Update campaign progress
    campaign.progress.total = contacts.length;
    await campaign.save();

    // Send messages with rate limiting
    const rateLimitPerMinute = campaign.rateLimitPerMinute || 10; // Lower for Twilio
    const delayBetweenMessages = (60 * 1000) / rateLimitPerMinute;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      try {
        // Create message record
        const messageContent = replaceVariables(template.body, campaign.variables, contact);

        const message = new Message({
          campaignId: campaign._id,
          contactId: contact._id,
          templateId: template._id,
          content: messageContent,
          status: 'pending',
          provider: 'twilio'
        });

        await message.save();

        // Send Twilio WhatsApp message
        const twilioResponse = await sendTwilioWhatsAppMessage(contact.phone, messageContent);

        if (twilioResponse.success) {
          message.status = 'sent';
          message.providerMessageId = twilioResponse.messageId;
          message.sentAt = new Date();
          campaign.progress.sent++;
        } else {
          message.status = 'failed';
          message.errorMessage = twilioResponse.error;
          campaign.progress.failed++;
        }

        await message.save();
        await campaign.save();

        // Emit progress update
        io.emit('campaign-progress-update', {
          campaignId: campaign._id,
          progress: campaign.progress,
          currentContact: i + 1,
          totalContacts: contacts.length
        });

        // Rate limiting delay
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
        }

      } catch (error) {
        console.error(`Error sending message to ${contact.phone}:`, error);

        const message = await Message.findOne({
          campaignId: campaign._id,
          contactId: contact._id
        });

        if (message) {
          message.status = 'failed';
          message.errorMessage = error.message;
          await message.save();
        }

        campaign.progress.failed++;
        await campaign.save();
      }
    }

    // Mark campaign as completed
    campaign.status = 'completed';
    await campaign.save();

    // Emit completion
    io.emit('campaign-completed', {
      campaignId: campaign._id,
      progress: campaign.progress
    });

    console.log(`Twilio Campaign ${campaign._id} completed. Sent: ${campaign.progress.sent}, Failed: ${campaign.progress.failed}`);

  } catch (error) {
    console.error('Error in sendCampaignMessagesTwilio:', error);

    campaign.status = 'failed';
    await campaign.save();

    throw error;
  }
};

const replaceVariables = (template, variables, contact) => {
  let message = template;

  // Replace campaign variables
  for (const [key, value] of variables) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    message = message.replace(regex, value);
  }

  // Replace contact-specific variables
  message = message.replace(/{{name}}/g, contact.name);
  message = message.replace(/{{phone}}/g, contact.phone);
  message = message.replace(/{{email}}/g, contact.email || '');

  // Replace metadata variables
  for (const [key, value] of contact.metadata) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    message = message.replace(regex, value);
  }

  return message;
};
