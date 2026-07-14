'use client'

import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { SendIcon } from 'lucide-react'
import { sendContactEmail } from '@/serverdata/contact'

export function ContactForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    try {
      await sendContactEmail({
        name:    data.get('name')    as string,
        email:   data.get('email')   as string,
        subject: data.get('subject') as string,
        message: data.get('message') as string,
      })
      toast.success('Message sent! We will get back to you soon.')
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" name="name" placeholder="Your name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input id="subject" name="subject" placeholder="How can we help?" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <Textarea id="message" name="message" placeholder="Write your message..." rows={5} required />
            </Field>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
              {!loading && <SendIcon data-icon="inline-end" />}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
