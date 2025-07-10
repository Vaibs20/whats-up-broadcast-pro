import './server/env.js';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

const debugEmail = async () => {
    try {
        // Step 1: Check environment variables
        console.log('\n📋 Step 1: Checking environment variables...');
        const requiredVars = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'SENDER_EMAIL'];
        requiredVars.forEach(varName => {
            const value = process.env[varName];
            console.log(`${varName}: ${value ? '✓ Present' : '✗ Missing'} ${varName === 'SENDER_EMAIL' ? `(${value})` : ''}`);
        });

        // Step 2: Get token
        console.log('\n📋 Step 2: Getting Microsoft Graph token...');
        const credentials = new ClientSecretCredential(
            process.env.AZURE_TENANT_ID,
            process.env.AZURE_CLIENT_ID,
            process.env.AZURE_CLIENT_SECRET
        );

        // Request all relevant permissions
        const scopes = ['https://graph.microsoft.com/.default'];

        const token = await credentials.getToken(scopes);
        console.log('Token obtained:', token.token.substring(0, 50) + '...');

        // Step 3: Initialize Graph client
        console.log('\n📋 Step 3: Initializing Microsoft Graph client...');
        const client = Client.init({
            authProvider: (done) => {
                done(null, token.token);
            },
        });
        console.log('Graph client initialized');

        // Step 4: Verify sender exists
        console.log('\n📋 Step 4: Verifying sender email...');
        try {
            const user = await client.api(`/users/${process.env.SENDER_EMAIL}`).get();
            console.log('Sender details:', {
                displayName: user.displayName,
                userPrincipalName: user.userPrincipalName,
                mail: user.mail,
                id: user.id
            });
        } catch (error) {
            console.error('Error verifying sender:', error.message);
            if (error.statusCode === 403) {
                console.log('💡 Tip: This error might be expected if User.Read.All permission is not granted');
            }
        }

        // Step 5: Send test email using direct send
        console.log('\n📋 Step 5: Sending test email using direct send...');
        const mailBody = {
            message: {
                subject: 'Test Email (Direct Send) ' + new Date().toISOString(),
                body: {
                    contentType: 'HTML',
                    content: `
            <h2>Test Email</h2>
            <p>This is a test email sent at ${new Date().toLocaleString()}</p>
            <p>If you receive this, the email service is working correctly.</p>
          `
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: process.env.SENDER_EMAIL
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
                        name: 'x-ms-exchange-organization-authas',
                        value: 'Internal'
                    },
                    {
                        name: 'x-ms-exchange-organization-authsource',
                        value: 'trizenventures.com'
                    }
                ]
            },
            saveToSentItems: true
        };

        console.log('Sending mail to:', process.env.SENDER_EMAIL);

        // Try sending using /sendMail endpoint
        try {
            console.log('\nAttempting to send via /sendMail endpoint...');
            await client.api(`/users/${process.env.SENDER_EMAIL}/sendMail`).post(mailBody);
            console.log('✅ Email sent successfully via /sendMail');
        } catch (sendMailError) {
            console.error('Failed to send via /sendMail:', sendMailError.message);

            // If /sendMail fails, try creating a draft and sending
            console.log('\nAttempting to create and send draft...');
            try {
                const draft = await client.api(`/users/${process.env.SENDER_EMAIL}/messages`)
                    .post(mailBody.message);

                console.log('Draft created, attempting to send...');
                await client.api(`/users/${process.env.SENDER_EMAIL}/messages/${draft.id}/send`)
                    .post({});

                console.log('✅ Email sent successfully via draft method');
            } catch (draftError) {
                throw new Error(`Both send methods failed. SendMail error: ${sendMailError.message}, Draft error: ${draftError.message}`);
            }
        }

        console.log('\n✅ Test completed successfully!');
        console.log('Important: Check the following locations for the email:');
        console.log('1. Main inbox');
        console.log('2. Spam/Junk folder');
        console.log('3. Sent Items folder');
        console.log('4. Check mail flow rules in Exchange admin center');

    } catch (error) {
        console.error('\n❌ Test failed with error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.statusCode
        });

        if (error.statusCode === 403) {
            console.log('\n💡 Troubleshooting tips for permission errors:');
            console.log('1. Verify Mail.Send permission is granted as Application permission');
            console.log('2. Verify admin consent has been granted');
            console.log('3. Check if the sender email has proper license (E3/E5)');
            console.log('4. Try removing and re-adding the Mail.Send permission');
        }

        if (error.body) {
            try {
                const errorBody = JSON.parse(error.body);
                console.log('\nDetailed error:', errorBody);
            } catch (e) {
                console.log('\nRaw error body:', error.body);
            }
        }

        console.log('\n💡 Additional troubleshooting tips for delivery failures:');
        console.log('1. Check Exchange Online Protection (EOP) settings');
        console.log('2. Verify SPF, DKIM, and DMARC records are properly configured');
        console.log('3. Check if there are any mail flow rules blocking internal emails');
        console.log('4. Verify the sender email is not in any blocked senders list');
        console.log('5. Check if there are any transport rules affecting internal mail flow');
    }
};

debugEmail(); 