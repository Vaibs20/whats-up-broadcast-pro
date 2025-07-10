import axios from 'axios';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const sendCampaignMessages = async (campaign, io) => {
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
    const rateLimitPerMinute = campaign.rateLimitPerMinute || 60;
    const delayBetweenMessages = (60 * 1000) / rateLimitPerMinute; // milliseconds

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
          status: 'pending'
        });
        
        await message.save();

        // Send WhatsApp message
        const whatsappResponse = await sendWhatsAppMessage(contact.phone, messageContent);
        
        if (whatsappResponse.success) {
          message.status = 'sent';
          message.whatsappMessageId = whatsappResponse.messageId;
          message.sentAt = new Date();
          campaign.progress.sent++;
        } else {
          message.status = 'failed';
          message.errorMessage = whatsappResponse.error;
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
        
        // Update message status
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

    console.log(`Campaign ${campaign._id} completed. Sent: ${campaign.progress.sent}, Failed: ${campaign.progress.failed}`);

  } catch (error) {
    console.error('Error in sendCampaignMessages:', error);
    
    // Update campaign status to failed
    campaign.status = 'failed';
    await campaign.save();
    
    throw error;
  }
};

const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Format phone number (remove + and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace(/\+/g, '');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0].id
    };

  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
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

// Webhook handler for message status updates
export const handleWhatsAppWebhook = async (webhookData) => {
  try {
    const { entry } = webhookData;
    
    for (const entryItem of entry) {
      const { changes } = entryItem;
      
      for (const change of changes) {
        if (change.field === 'messages') {
          const { statuses } = change.value;
          
          if (statuses) {
            for (const status of statuses) {
              await updateMessageStatus(status);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
  }
};

const updateMessageStatus = async (statusUpdate) => {
  try {
    const { id: whatsappMessageId, status, timestamp } = statusUpdate;
    
    const message = await Message.findOne({ whatsappMessageId });
    if (!message) {
      console.log(`Message not found for WhatsApp ID: ${whatsappMessageId}`);
      return;
    }

    const campaign = await Campaign.findById(message.campaignId);
    if (!campaign) {
      console.log(`Campaign not found for message: ${message._id}`);
      return;
    }

    // Update message status
    const oldStatus = message.status;
    message.status = status;
    
    if (status === 'delivered' && !message.deliveredAt) {
      message.deliveredAt = new Date(timestamp * 1000);
    } else if (status === 'read' && !message.readAt) {
      message.readAt = new Date(timestamp * 1000);
    }
    
    await message.save();

    // Update campaign progress
    if (oldStatus !== status) {
      // Decrement old status count
      if (campaign.progress[oldStatus] > 0) {
        campaign.progress[oldStatus]--;
      }
      
      // Increment new status count
      campaign.progress[status]++;
      
      await campaign.save();
    }

    console.log(`Updated message ${message._id} status from ${oldStatus} to ${status}`);
    
  } catch (error) {
    console.error('Error updating message status:', error);
  }
};