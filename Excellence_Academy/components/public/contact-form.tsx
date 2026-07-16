'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { SendIcon } from 'lucide-react'

import { sendContactEmail } from '@/serverdata/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

// ── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().min(3, 'Subject is required'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

interface ContactFormProps {
  /** Pre-fill name/email for logged-in users */
  defaultName?: string
  defaultEmail?: string
}

export function ContactForm({ defaultName = '', defaultEmail = '' }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      subject: '',
      message: '',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await sendContactEmail({
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
      })
      toast.success('Message sent! We will get back to you soon.')
      reset({ name: defaultName, email: defaultEmail, subject: '', message: '' })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.',
      )
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="cf-name">Full Name</FieldLabel>
                <Input id="cf-name" placeholder="Your name" {...register('name')} />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="cf-email">Email</FieldLabel>
                <Input
                  id="cf-email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="cf-subject">Subject</FieldLabel>
              <Input id="cf-subject" placeholder="How can we help?" {...register('subject')} />
              {errors.subject && (
                <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="cf-message">Message</FieldLabel>
              <Textarea
                id="cf-message"
                placeholder="Write your message..."
                rows={5}
                {...register('message')}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
              )}
            </Field>

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
              {!isSubmitting && <SendIcon data-icon="inline-end" />}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
