import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

// Microsoft Graph API configuration
const credentials = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

// Initialize Microsoft Graph client
const getGraphClient = async () => {
  try {
    console.log('🔄 Getting Microsoft Graph token...');
    // Request token with explicit Mail.Send scope
    const token = await credentials.getToken(['https://graph.microsoft.com/Mail.Send']);
    console.log('✅ Token obtained successfully');

    // Initialize the client with more detailed error handling
    const client = Client.init({
      authProvider: (done) => {
        done(null, token.token);
      },
      debugLogging: true
    });

    // Test the client's authentication
    try {
      await client.api('/users/' + process.env.SENDER_EMAIL)
        .select('id,userPrincipalName,mail')
        .get();
      console.log('✅ Successfully authenticated and accessed sender account');
    } catch (userError) {
      console.log('⚠️ Could not verify sender account:', userError.message);
      // Continue anyway as we might still be able to send
    }

    return client;
  } catch (error) {
    console.error('❌ Error getting Microsoft Graph token:', error);
    if (error.code === 'AuthenticationRequired') {
      console.error('💡 Authentication failed. Please verify:');
      console.error('1. AZURE_TENANT_ID is correct');
      console.error('2. AZURE_CLIENT_ID is correct');
      console.error('3. AZURE_CLIENT_SECRET is valid and not expired');
    }
    throw error;
  }
};

// Professional email templates
const getEmailTemplate = (type, data) => {
  switch (type) {
    case 'password-reset':
      return {
        subject: '🔐 Password Reset Request - Action Required',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">📱 WhatsApp Broadcast</div>
              <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
            </div>
            
            <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 24px;">Hello,</p>
              
              <p>We received a request to reset the password for your WhatsApp Broadcast Platform account.</p>
              
              <p>Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.resetUrl}" 
                   style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: 600;
                          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                  Reset My Password
                </a>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; color: #92400e;">
                <strong>🔒 Security Information:</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>Use this link only once to reset your password</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${data.resetUrl}" style="color: #16a34a; word-break: break-all;">${data.resetUrl}</a>
              </p>
            </div>
            
            <div style="padding: 30px 20px; text-align: center; color: #6b7280; font-size: 14px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p><strong>WhatsApp Broadcast Platform</strong></p>
              <p>This is an automated security email. Please do not reply to this message.</p>
              <p style="margin-top: 16px; font-size: 12px;">
                © ${new Date().getFullYear()} WhatsApp Broadcast Platform. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    default:
      return null;
  }
};

// Send email using Microsoft Graph
const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`🔄 Preparing to send email to ${to}`);
    console.log('📧 Using sender:', process.env.SENDER_EMAIL);

    const client = await getGraphClient();

    // Create the message object
    const message = {
      subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ],
      from: {
        emailAddress: {
          address: process.env.SENDER_EMAIL
        }
      },
      internetMessageHeaders: [
        {
          name: 'X-MS-Exchange-Organization-AuthAs',
          value: 'Internal'
        },
        {
          name: 'X-MS-Exchange-Organization-AuthMechanism',
          value: '04'
        },
        {
          name: 'X-MS-Exchange-Organization-AuthSource',
          value: process.env.SENDER_EMAIL.split('@')[1]
        }
      ]
    };

    // Try Method 1: Create draft and send
    try {
      console.log('📧 Attempting Method 1: Create draft and send...');
      const draft = await client.api(`/users/${process.env.SENDER_EMAIL}/messages`)
        .post(message);

      await client.api(`/users/${process.env.SENDER_EMAIL}/messages/${draft.id}/send`)
        .post({});

      console.log('✅ Email sent successfully via draft method');
      return true;
    } catch (method1Error) {
      console.log('⚠️ Draft method failed:', method1Error.message);

      // Try Method 2: Direct send
      try {
        console.log('📧 Attempting Method 2: Direct send...');
        await client.api(`/users/${process.env.SENDER_EMAIL}/sendMail`)
          .post({
            message,
            saveToSentItems: true
          });

        console.log('✅ Email sent successfully via direct send');
        return true;
      } catch (method2Error) {
        console.log('⚠️ Direct send failed:', method2Error.message);

        // Try Method 3: Beta API
        try {
          console.log('📧 Attempting Method 3: Beta API...');
          const betaClient = Client.init({
            authProvider: (done) => {
              done(null, client.config.authProvider);
            },
            defaultVersion: 'beta'
          });

          await betaClient.api(`/users/${process.env.SENDER_EMAIL}/sendMail`)
            .post({
              message,
              saveToSentItems: true
            });

          console.log('✅ Email sent successfully via beta API');
          return true;
        } catch (method3Error) {
          // If all methods fail, throw a combined error
          throw new Error(`All sending methods failed:
            Method 1 (Draft): ${method1Error.message}
            Method 2 (Direct): ${method2Error.message}
            Method 3 (Beta): ${method3Error.message}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in sendEmail:', error);

    // Enhanced error handling
    if (error.statusCode === 403) {
      console.error('❌ Permission denied. Please verify:');
      console.error('1. The service account has an Exchange Online license');
      console.error('2. Mail.Send Application permission is granted');
      console.error('3. Admin consent has been granted');
      console.error('4. The account is not blocked by conditional access policies');
    } else if (error.statusCode === 401) {
      console.error('❌ Authentication failed. Please verify:');
      console.error('1. Azure AD app credentials are correct');
      console.error('2. Azure AD app is not disabled');
    }

    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    console.log(`🔄 Starting password reset email process for ${email}`);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const template = getEmailTemplate('password-reset', { resetUrl });

    if (!template) {
      throw new Error('Email template not found');
    }

    return await sendEmail(email, template.subject, template.content);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    console.log('🔄 Testing email configuration...');
    const client = await getGraphClient();

    // Test sending a simple email to verify permissions
    console.log('🔄 Testing Mail.Send permission...');
    await sendEmail(
      process.env.SENDER_EMAIL,
      'Test Email Configuration',
      '<p>This is a test email to verify the email configuration.</p>'
    );

    console.log('✅ Email configuration test successful');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    console.log(`🔄 Sending welcome email to ${email}`);
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center;">
          <h1>Welcome, ${firstName}! 🎉</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <p>Thank you for joining WhatsApp Broadcast Platform!</p>
          <p>You can now start creating and managing your WhatsApp broadcast campaigns.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
      </div>
    `;

    await sendEmail(email, '🎉 Welcome to WhatsApp Broadcast Platform!', htmlContent);
    console.log(`✅ Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, firstName, token) => {
  try {
    console.log(`🔄 Sending verification email to ${email}`);
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center;">
          <h1>Welcome, ${firstName}!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you did not sign up, you can ignore this email.</p>
        </div>
      </div>
    `;

    await sendEmail(email, 'Verify your email address', htmlContent);
    console.log(`✅ Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};
