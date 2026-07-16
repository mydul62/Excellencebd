import { apiPost } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContactPayload {
  name: string
  email: string
  subject?: string
  message: string
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * POST /api/sendMail
 * Sends a contact form message to the site owner's email.
 * No auth required.
 */
export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  await apiPost<null>('/sendMail', payload)
}
