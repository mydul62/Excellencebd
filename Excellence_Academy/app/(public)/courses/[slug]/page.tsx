import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { courses } from "@/data/courses";
import { teachers } from "@/data/teachers";
import { getCourseIcon } from "@/lib/course-icons";
import { formatCurrency } from "@/lib/format";
import { CourseEnrollButton } from "@/components/public/course-enroll-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
} from "lucide-react";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "Course Not Found" };
  return { title: course.title, description: course.description };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const Icon = getCourseIcon(course.icon);
  const instructor = teachers.find((t) => t.id === course.teacherId);
  const overview = course.description;
  const syllabus = [
    `Build strong fundamentals for ${course.title}`,
    `Practice through guided exercises and mentor support`,
    `Learn at a pace that fits your goals and schedule`,
  ];

  return (
    <>
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="w-fit">
              {course.category}
            </Badge>
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-7" />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-3xl font-bold text-balance text-foreground md:text-4xl">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-pretty text-muted-foreground">
                  {course.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="leading-relaxed text-muted-foreground">
                  {overview}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You Will Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {syllabus.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-accent" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {instructor ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Instructor</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage
                      src={instructor.avatar || "/placeholder.svg"}
                      alt={instructor.name}
                    />
                    <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="font-display font-semibold text-foreground">
                      {instructor.name}
                    </span>
                    <span className="text-sm text-primary">
                      {instructor.subject}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {instructor.experienceYears} years of experience
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="flex flex-col gap-5 p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Course Fee
                  </span>
                  <span className="font-display text-3xl font-bold text-foreground">
                    {formatCurrency(course.price)}
                  </span>
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <ClockIcon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-auto font-medium text-foreground">
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <UsersIcon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Batch Size:</span>
                    <span className="ml-auto font-medium text-foreground">
                      {course.seats} students
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="ml-auto font-medium text-foreground">
                      {course.duration}
                    </span>
                  </div>
                </div>
                <Separator />

            <Button asChild variant="outline" className="w-full">
  <Link href={`/courses/${course.id}/enroll`}>
    Enroll Now
  </Link>
</Button>
                <Button
                  render={<Link href="/contact" />}
                  variant="outline"
                  className="w-full"
                >
                  Ask a Question
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
