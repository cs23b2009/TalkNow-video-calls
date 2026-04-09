import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';
dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const FROM_EMAIL = process.env.MAILJET_FROM_EMAIL || 'no-reply@talknow.com';
const APP_NAME = 'TalkNow';

export const sendVerificationEmail = async (email, fullName, code) => {
  try {
    const request = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL,
            Name: APP_NAME,
          },
          To: [
            {
              Email: email,
              Name: fullName,
            },
          ],
          Subject: `Verify your email for ${APP_NAME}`,
          TextPart: `Hello ${fullName}, your verification code is ${code}. It will expire in 15 minutes.`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
              <h2 style="color: #3b82f6; text-align: center;">Welcome to ${APP_NAME}!</h2>
              <p>Hello <strong>${fullName}</strong>,</p>
              <p>Thank you for joining TalkNow. To complete your registration, please use the verification code below:</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1a1a;">${code}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="text-align: center; color: #9ca3af; font-size: 12px;">&copy; 2026 ${APP_NAME}. All rights reserved.</p>
            </div>
          `,
        },
      ],
    });
    console.log(`Verification email sent to ${email}`);
    return request;
  } catch (error) {
    console.error('Mailjet error:', error.message);
    throw error;
  }
};

export const sendFriendRequestEmail = async (recipientEmail, recipientName, senderName) => {
  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL,
            Name: APP_NAME,
          },
          To: [
            {
              Email: recipientEmail,
              Name: recipientName,
            },
          ],
          Subject: `${senderName} sent you a friend request on ${APP_NAME}`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0;">
              <h2 style="color: #3b82f6;">New Friend Request!</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p><strong>${senderName}</strong> wants to connect with you on TalkNow! Hop on to the app to accept the request and start chatting.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/friends" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Request</a>
              </div>
            </div>
          `,
        },
      ],
    });
  } catch (error) {
    console.error('Mailjet notification error:', error.message);
  }
};

export const sendNotificationEmail = async (recipientEmail, recipientName, title, message) => {
  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL,
            Name: APP_NAME,
          },
          To: [
            {
              Email: recipientEmail,
              Name: recipientName,
            },
          ],
          Subject: title,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0;">
              <h2 style="color: #3b82f6;">${title}</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>${message}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open TalkNow</a>
              </div>
            </div>
          `,
        },
      ],
    });
  } catch (error) {
    console.error('Mailjet general notification error:', error.message);
  }
};
