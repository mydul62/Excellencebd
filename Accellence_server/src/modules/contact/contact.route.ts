import express from 'express';
import { handleSendEmail } from './contact.controller';

const router = express.Router();

// POST request for sending mail
router.post('/', handleSendEmail);

export const MailRoutes = router;


