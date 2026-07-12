"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { SendIcon } from "lucide-react"

export function ContactForm() {
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Message sent! We will get back to you soon.")
      ;(e.target as HTMLFormElement).reset()
    }, 900)
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
              {loading ? "Sending..." : "Send Message"}
              {!loading ? <SendIcon data-icon="inline-end" /> : null}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
