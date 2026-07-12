import { notFound } from "next/navigation";
import { courses } from "@/data/courses";

interface EnrollPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EnrollPage({ params }: EnrollPageProps) {
  // Next.js App Router (v15+) এ params একটি Promise
  const { slug } = await params;
  console.log(slug)
  console.log(courses)

  // courseId এর বদলে slug দিয়ে কোর্স খুঁজুন
  const course = courses.find((c) => c.id === slug);

  if (!course) {
    notFound(); // বা আপনার কাস্টম "Course Not Found" UI
  }

  return (
    <section className="bg-slate-50 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Course Details */}
          <div className="rounded-xl bg-white p-8 shadow">
            <h2 className="mb-6 text-3xl font-bold">{course.title}</h2>
            <p className="mb-6 text-gray-600">{course.description}</p>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{course.category}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{course.duration}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Level</span>
                <span className="font-medium">{course.level}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Available Seats</span>
                <span className="font-medium">{course.seats}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Course Fee</span>
                <span className="font-bold text-blue-600">
                  ৳ {course.price}
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-green-50 p-5">
              <h3 className="mb-3 text-lg font-semibold text-green-900">
                Manual Payment Information
              </h3>

              <div className="space-y-2 text-sm text-green-800">
                <p>
                  <strong>bKash:</strong> 017XXXXXXXX
                </p>
                <p>
                  <strong>Nagad:</strong> 018XXXXXXXX
                </p>
                <p>
                  <strong>Rocket:</strong> 019XXXXXXXX
                </p>
                <p className="pt-2 font-medium text-red-500">
                  Send the exact course fee and submit your Transaction ID below.
                </p>
              </div>
            </div>
          </div>

          {/* Enrollment Form */}
          <div className="rounded-xl bg-white p-8 shadow">
            <h2 className="mb-6 text-2xl font-bold">Enrollment Form</h2>

            <form className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-lg border p-3"
                required
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border p-3"
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-lg border p-3"
                required
              />

              <input
                value={course.title}
                readOnly
                className="w-full rounded-lg border bg-gray-100 p-3 font-medium text-gray-700"
              />

              <select className="w-full rounded-lg border p-3">
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
              </select>

              <input
                type="text"
                placeholder="Transaction ID"
                className="w-full rounded-lg border p-3"
                required
              />

              <input
                type="file"
                className="w-full rounded-lg border p-3"
              />

              <textarea
                rows={4}
                placeholder="Additional Notes (Optional)"
                className="w-full rounded-lg border p-3"
              />

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Submit Enrollment
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}