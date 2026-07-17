'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarCheck, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { createAttendance, getStudentAttendance, type ServerAttendance } from '@/serverdata/attendance'
import { getStudentsFromApi, type ServerStudent } from '@/serverdata/students'
import { getTeacherDashboard } from '@/services'
import type { CourseWithTeacher } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/hooks/use-auth'

// ── Schema ────────────────────────────────────────────────────────────────────
const logSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  courseId: z.string().min(1, 'Please select a course'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
})

type LogFormValues = z.infer<typeof logSchema>

const STATUS_ICON = {
  present: <CheckCircle2 className="size-4 text-green-500" />,
  absent: <XCircle className="size-4 text-destructive" />,
  late: <Clock className="size-4 text-amber-500" />,
  excused: <AlertCircle className="size-4 text-blue-500" />,
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  present: 'default',
  absent: 'destructive',
  late: 'secondary',
  excused: 'secondary',
}

export default function TeacherAttendancePage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<ServerStudent[]>([])
  const [myCourses, setMyCourses] = useState<CourseWithTeacher[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<ServerAttendance[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [loadingData, setLoadingData] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      studentId: '',
      courseId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
    },
  })

  const watchedStudentId = watch('studentId')

  // ── Load teacher's courses + all students ─────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      getTeacherDashboard(user.id),
      getStudentsFromApi({ limit: 200 }),
    ])
      .then(([dashData, studentsRes]) => {
        setMyCourses(dashData.courses)
        setStudents(studentsRes.data)
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoadingData(false))
  }, [user?.id])

  // ── Load attendance when student changes ───────────────────────────────────
  useEffect(() => {
    if (!watchedStudentId) {
      setAttendanceLogs([])
      setSelectedStudentId('')
      return
    }
    setSelectedStudentId(watchedStudentId)
    setLoadingLogs(true)
    getStudentAttendance(watchedStudentId)
      .then(setAttendanceLogs)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load attendance'))
      .finally(() => setLoadingLogs(false))
  }, [watchedStudentId])

  // ── Submit — POST /api/attendance ──────────────────────────────────────────
  async function onSubmit(values: LogFormValues) {
    try {
      await createAttendance({
        studentId: values.studentId,
        courseId: values.courseId,
        date: values.date,
        status: values.status,
      })
      toast.success('Attendance logged successfully')
      setValue('courseId', '')
      setValue('date', new Date().toISOString().split('T')[0])
      setValue('status', 'present')
      setLoadingLogs(true)
      getStudentAttendance(values.studentId)
        .then(setAttendanceLogs)
        .catch(() => {})
        .finally(() => setLoadingLogs(false))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log attendance')
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = {
    present: attendanceLogs.filter((a) => a.status === 'present').length,
    absent: attendanceLogs.filter((a) => a.status === 'absent').length,
    late: attendanceLogs.filter((a) => a.status === 'late').length,
    excused: attendanceLogs.filter((a) => a.status === 'excused').length,
    total: attendanceLogs.length,
  }
  const attendanceRate =
    summary.total > 0
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <CalendarCheck className="h-4 w-4" />Attendance
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Mark Attendance</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Log attendance for students in your courses and review their history.
            </p>
          </div>
          <Button render={<Link href="/dashboard/teacher" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      {/* Log Form */}
      <SectionCard
        title="Log Attendance"
        description="Select a student, your course, date, and attendance status."
      >
        {loadingData ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="t-att-student">Student</Label>
              <select
                id="t-att-student"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('studentId')}
              >
                <option value="">Select student…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.studentId && (
                <p className="text-xs text-destructive">{errors.studentId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="t-att-course">Course</Label>
              <select
                id="t-att-course"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('courseId')}
              >
                <option value="">Select course…</option>
                {myCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {errors.courseId && (
                <p className="text-xs text-destructive">{errors.courseId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="t-att-date">Date</Label>
              <Input id="t-att-date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="t-att-status">Status</Label>
              <select
                id="t-att-status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('status')}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                <Plus className="mr-2 size-4" />
                {isSubmitting ? 'Logging…' : 'Log Attendance'}
              </Button>
            </div>
          </form>
        )}
      </SectionCard>

      {/* Attendance History */}
      {selectedStudentId && (
        <SectionCard
          title={`Attendance History — ${students.find((s) => s.id === selectedStudentId)?.name ?? ''}`}
          description={
            summary.total > 0
              ? `${summary.total} records · ${attendanceRate}% attendance rate`
              : 'No records yet for this student'
          }
        >
          {summary.total > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="size-3" />Present: {summary.present}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="size-3" />Absent: {summary.absent}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="size-3" />Late: {summary.late}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <AlertCircle className="size-3" />Excused: {summary.excused}
              </span>
            </div>
          )}

          {loadingLogs && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}
          {!loadingLogs && attendanceLogs.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No attendance records found for this student.
            </p>
          )}
          {!loadingLogs && attendanceLogs.length > 0 && (
            <DataTable
              columns={[
                { header: 'Date', accessor: (row) => formatDate(row.date) },
                { header: 'Course', accessor: (row) => row.course?.title ?? '—' },
                {
                  header: 'Status',
                  accessor: (row) => (
                    <div className="flex items-center gap-2">
                      {STATUS_ICON[row.status]}
                      <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                    </div>
                  ),
                },
              ]}
              data={attendanceLogs}
            />
          )}
        </SectionCard>
      )}
    </div>
  )
}
