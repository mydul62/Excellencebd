'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, User, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { getCourses, assignTeacherToCourse, type ServerCourse } from '@/serverdata/courses'
import { getTeachers, type ServerTeacher } from '@/serverdata/teachers'
import { SectionCard } from '@/components/dashboard/section-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'

export default function AdminCourseAssignPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<ServerCourse[]>([])
  const [teachers, setTeachers] = useState<ServerTeacher[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getCourses({ limit: 100 }),
      getTeachers({ limit: 100 }),
    ])
      .then(([coursesResult, teachersResult]) => {
        setCourses(coursesResult.data)
        setTeachers(teachersResult.data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const currentTeacher = teachers.find((t) => t.id === selectedCourse?.teacherId)

  async function handleAssign() {
    if (!selectedCourseId) {
      toast.error('Please select a course')
      return
    }

    setAssigning(true)
    try {
      await assignTeacherToCourse(selectedCourseId, selectedTeacherId || null)
      
      // Update local state
      setCourses((prev) =>
        prev.map((c) =>
          c.id === selectedCourseId
            ? { ...c, teacherId: selectedTeacherId || null }
            : c
        )
      )

      toast.success(
        selectedTeacherId
          ? 'Teacher assigned successfully'
          : 'Teacher removed from course'
      )
      
      setSelectedCourseId('')
      setSelectedTeacherId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign teacher')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <SectionCard title="Course-Teacher Assignment">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </SectionCard>
    )
  }

  if (error) {
    return (
      <SectionCard title="Course-Teacher Assignment">
        <p className="text-sm text-destructive">{error}</p>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Assign Teacher to Course"
        description="Select a course and assign a teacher to it. You can also remove teacher assignments."
      >
        <div className="grid max-w-2xl gap-6">
          <div className="grid gap-2">
            <Label htmlFor="course">Select Course</Label>
            <Select value={selectedCourseId} onValueChange={(v) => setSelectedCourseId(v ?? '')}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4" />
                      <span>{course.title}</span>
                      {course.teacherId && (
                        <span className="text-xs text-muted-foreground">
                          (Assigned)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourse && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Current Assignment</h4>
              {currentTeacher ? (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span>
                    <strong>{currentTeacher.user.name}</strong> ({currentTeacher.subject})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="size-4" />
                  <span>No teacher assigned</span>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="teacher">Select Teacher</Label>
            <Select value={selectedTeacherId} onValueChange={(v) => setSelectedTeacherId(v ?? '')}>
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Choose a teacher or leave empty to unassign..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-muted-foreground italic">No teacher (unassign)</span>
                </SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{teacher.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({teacher.subject})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAssign}
            disabled={!selectedCourseId || assigning}
            className="w-full sm:w-auto"
          >
            {assigning ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                {selectedTeacherId ? 'Assign Teacher' : 'Remove Assignment'}
              </>
            )}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="All Courses with Assignments">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Assigned Teacher</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((course) => {
                const teacher = teachers.find((t) => t.id === course.teacherId)
                return (
                  <tr key={course.id} className="group hover:bg-muted/50">
                    <td className="py-3 font-medium">{course.title}</td>
                    <td className="py-3 text-muted-foreground">{course.category}</td>
                    <td className="py-3">
                      {teacher ? (
                        <span className="text-sm">
                          {teacher.user.name}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({teacher.subject})
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {teacher ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          <CheckCircle2 className="size-3" />
                          Assigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                          <XCircle className="size-3" />
                          Unassigned
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
