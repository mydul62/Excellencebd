import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (
  to: string,
  html: string,
  subject: string = 'New Contact Message from Website',
  userEmail: string,
  userName: string
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.env === 'production',
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  await transporter.sendMail({
    from: `"${userName}" <${config.email_user}>`, // display user's name
    replyTo: userEmail, // reply will go to the user
    to,
    subject,
    html,
  });
};
