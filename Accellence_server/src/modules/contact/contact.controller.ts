import { Request, Response } from 'express';
import { sendAppEmail } from './contact.service';

export const handleSendEmail = async (req: Request, res: Response) => {
  try {
    const { email, name, message, subject } = req.body;

    // Validate required fields
    if (!email || !name || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate HTML body for email
    const html = `
      <h3>Contact Request</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send the email to the site owner
    await sendAppEmail(
      process.env.OWNER_EMAIL || 'your_email@gmail.com',
      html,
      subject || 'New Contact Message',
      email,
      name
    );

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error in handleSendEmail:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};


