'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

import { sendContactEmail } from '@/serverdata/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().min(3, 'Subject is required'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

interface SendEmailFormProps {
  defaultName?: string
  defaultEmail?: string
}

export function SendEmailForm({ defaultName = '', defaultEmail = '' }: SendEmailFormProps) {
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
      toast.success('Message sent successfully!')
      reset({ name: defaultName, email: defaultEmail, subject: '', message: '' })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="se-name">Your Name</Label>
          <Input id="se-name" placeholder="Full name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="se-email">Your Email</Label>
          <Input
            id="se-email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="se-subject">Subject</Label>
        <Input id="se-subject" placeholder="How can we help?" {...register('subject')} />
        {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="se-message">Message</Label>
        <Textarea
          id="se-message"
          placeholder="Write your message to the academy admin…"
          rows={5}
          {...register('message')}
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        <Send className="mr-2 size-4" />
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
