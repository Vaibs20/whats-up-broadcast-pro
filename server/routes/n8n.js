
import express from 'express';
import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import { scheduleCampaign } from '../services/scheduler.js';

const router = express.Router();

// Webhook endpoint for n8n workflows
router.post('/webhook/campaign', async (req, res) => {
  try {
    const {
      name,
      templateId,
      contactIds,
      contactTags,
      variables,
      scheduledAt,
      rateLimitPerMinute,
      provider,
      n8nWorkflowId,
      googleCalendarEventId
    } = req.body;

    console.log('Received n8n campaign webhook:', req.body);

    // Validate template exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(400).json({ error: 'Template not found' });
    }

    // Get contacts - either by IDs or by tags
    let contacts = [];
    
    if (contactIds && contactIds.length > 0) {
      contacts = await Contact.find({
        _id: { $in: contactIds },
        status: 'active',
        optedOut: false
      });
    } else if (contactTags && contactTags.length > 0) {
      contacts = await Contact.find({
        tags: { $in: contactTags },
        status: 'active',
        optedOut: false
      });
    }

    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No valid contacts found' });
    }

    // Create campaign
    const campaign = new Campaign({
      name: name || `Automated Campaign - ${new Date().toISOString()}`,
      templateId,
      contacts: contacts.map(c => c._id),
      variables: new Map(Object.entries(variables || {})),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      rateLimitPerMinute: rateLimitPerMinute || (provider === 'twilio' ? 10 : 60),
      provider: provider || 'auto',
      createdBy: 'n8n-automation',
      automatedTrigger: true,
      triggerSource: 'n8n',
      n8nWorkflowId,
      googleCalendarEventId,
      progress: {
        total: contacts.length,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0
      }
    });

    await campaign.save();

    // Schedule the campaign
    await scheduleCampaign(campaign);

    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('templateId', 'name body')
      .populate('contacts', 'name phone');

    res.status(201).json({
      success: true,
      campaign: populatedCampaign,
      message: 'Campaign created and scheduled successfully'
    });

  } catch (error) {
    console.error('Error processing n8n webhook:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Webhook for Google Calendar events
router.post('/webhook/calendar', async (req, res) => {
  try {
    const {
      eventId,
      summary,
      description,
      startTime,
      endTime,
      attendees
    } = req.body;

    console.log('Received calendar webhook:', req.body);

    // Parse campaign details from event description or summary
    // This is where you'd implement your calendar event parsing logic
    const campaignData = parseCalendarEvent({
      summary,
      description,
      startTime,
      attendees
    });

    if (!campaignData) {
      return res.status(400).json({ 
        error: 'Unable to parse campaign data from calendar event' 
      });
    }

    // Create campaign from calendar event
    const campaign = new Campaign({
      ...campaignData,
      scheduledAt: new Date(startTime),
      automatedTrigger: true,
      triggerSource: 'calendar',
      googleCalendarEventId: eventId,
      createdBy: 'calendar-automation'
    });

    await campaign.save();
    await scheduleCampaign(campaign);

    res.status(201).json({
      success: true,
      campaign,
      message: 'Campaign created from calendar event'
    });

  } catch (error) {
    console.error('Error processing calendar webhook:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Helper function to parse calendar events
const parseCalendarEvent = (eventData) => {
  // This is a simple example - you'd implement more sophisticated parsing
  const { summary, description } = eventData;
  
  try {
    // Look for JSON in description or parse structured format
    if (description) {
      // Try to parse JSON from description
      const jsonMatch = description.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    // Fallback: create basic campaign data
    return {
      name: summary || 'Calendar Campaign',
      // You'd implement logic to determine templateId, contacts, etc.
      // based on your specific requirements
    };
  } catch (error) {
    console.error('Error parsing calendar event:', error);
    return null;
  }
};

// Get campaign status (for n8n to check)
router.get('/campaign/:id/status', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({
      id: campaign._id,
      status: campaign.status,
      progress: campaign.progress,
      scheduledAt: campaign.scheduledAt,
      createdAt: campaign.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
