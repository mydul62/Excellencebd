'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function TeacherRegistrationForm() {
  return (
    <form className="grid gap-6">
      <div className="grid gap-2">
        <Label>Full Name</Label>
        <Input placeholder="Teacher Name" />
      </div>

      <div className="grid gap-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="teacher@email.com"
        />
      </div>

      <div className="grid gap-2">
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="********"
        />
      </div>

      <div className="grid gap-2">
        <Label>Phone</Label>
        <Input placeholder="01XXXXXXXXX" />
      </div>

      <div className="grid gap-2">
        <Label>Subject</Label>
        <Input placeholder="Mathematics" />
      </div>

      <div className="grid gap-2">
        <Label>Experience (Years)</Label>
        <Input
          type="number"
          placeholder="5"
        />
      </div>

      <div className="grid gap-2">
        <Label>Qualification</Label>
        <Input placeholder="M.Sc in Mathematics" />
      </div>

      <div className="grid gap-2">
        <Label>Address</Label>
        <Textarea placeholder="Teacher Address" />
      </div>

      <Button type="submit">
        Register Teacher
      </Button>
    </form>
  )
}