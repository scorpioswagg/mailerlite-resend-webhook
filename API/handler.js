// api/handler.js
import { Resend } from 'resend';

// Initialize Resend with your secret API key.
// WARNING: In production, use Vercel's Environment Variables! (We'll do this later)
const resend = new Resend('re_YOUR_RESEND_API_KEY_HERE');

export default async function handler(req, res) {
  // 1. Check if the request is a POST (MailerLite sends POST requests)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get the data MailerLite sent us
  const mailerLiteData = req.body;
  console.log('Received webhook from MailerLite:', mailerLiteData);

  // 3. Extract the subscriber's email from the data structure.
  // YOU MUST CHECK THE ACTUAL STRUCTURE. For a "Subscriber added" event, it's often:
  const subscriberEmail = mailerLiteData?.data?.email;
  const subscriberName = mailerLiteData?.data?.name || 'Friend';

  if (!subscriberEmail) {
    return res.status(400).json({ error: 'No email found in payload' });
  }

  try {
    // 4. Tell Resend to send an email
    await resend.emails.send({
      from: 'Your Name <welcome@yourdomain.com>', // MUST be a verified sender in Resend
      to: subscriberEmail,
      subject: 'Welcome to the list!',
      html: `<h1>Hello ${subscriberName}!</h1><p>Thanks for subscribing. Here's your special gift...</p>`,
      // text: `Hello ${subscriberName}!\n\nThanks for subscribing...` // plain text version
    });

    console.log(`Email sent successfully to ${subscriberEmail}`);
    // 5. Tell MailerLite we got the webhook and processed it successfully (status 200)
    return res.status(200).json({ success: true, message: 'Email sent' });

  } catch (error) {
    console.error('Error sending email with Resend:', error);
    // 6. Tell MailerLite we failed. It might retry.
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
