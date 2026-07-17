import { sendEmail } from '../../app/shared/sendEmail';

export const sendAppEmail = async (
  to: string,
  html: string,
  subject: string,
  userEmail: string,
  userName: string
) => {
  return sendEmail(to, html, subject, userEmail, userName);
};


