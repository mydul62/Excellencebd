"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PageBanner } from "@/components/public/page-banner";
import { getTeachers, type ServerTeacher } from "@/serverdata/teachers";
import {
  GraduationCap,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";


function toCardTeacher(t: ServerTeacher) {
  return {
    id: t.id,
    name: t.user.name,
    email: t.user.email ?? "",
    phone: t.user.phone ?? "",
    avatar: t.user.avatar ?? "",
    subject: t.subject,
    bio: t.bio ?? "",
    experienceYears: t.experienceYears,
    qualification: t.qualification ?? "",
  };
}


export default function TeachersPage() {

  const [teachers, setTeachers] = useState<ServerTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {

    getTeachers({ limit: 100 })

      .then(({ data }) => setTeachers(data))

      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load teachers"
        )
      )

      .finally(() => setLoading(false));

  }, []);



  return (

    <>

      <PageBanner
        title="আমাদের অভিজ্ঞ শিক্ষকবৃন্দ"
        description="দক্ষ, অভিজ্ঞ ও আন্তরিক শিক্ষকবৃন্দ প্রতিটি শিক্ষার্থীকে তার লক্ষ্যে পৌঁছাতে সর্বদা প্রতিশ্রুতিবদ্ধ।"
      />



      <section className="
        bg-gradient-to-b
        from-white
        to-blue-50/40
        py-16
        md:py-24
      ">


        <div className="
          mx-auto
          container
          w-[95%]
          px-4
          md:px-6
        ">



          {loading && (

            <div className="
              grid
              grid-cols-1
              gap-8
              sm:grid-cols-2
              lg:grid-cols-4
            ">

              {
                Array.from({length:8}).map((_,i)=>(

                  <div
                    key={i}
                    className="
                    h-[420px]
                    rounded-3xl
                    bg-gray-200
                    animate-pulse
                    "
                  />

                ))
              }

            </div>

          )}





          {!loading && error && (

            <p className="
              text-center
              text-red-500
            ">
              {error}
            </p>

          )}





          {!loading && !error && teachers.length === 0 && (

            <p className="
              text-center
              text-muted-foreground
            ">
              No teachers found.
            </p>

          )}







          {!loading && !error && teachers.length > 0 && (

            <div className="
              grid
              grid-cols-1
              gap-8

              sm:grid-cols-2

              lg:grid-cols-4
            ">


              {teachers.map((teacher)=>{


                const data = toCardTeacher(teacher);


                return (

                  <div
                    key={data.id}

                    className="
                    group

                    overflow-hidden

                    rounded-3xl

                    border
                    border-gray-200

                    bg-white

                    shadow-[0_15px_40px_rgba(15,23,42,0.08)]

                    transition

                    hover:-translate-y-2

                    hover:shadow-[0_25px_60px_rgba(37,99,235,0.15)]
                    "
                  >




                    {/* Image */}

                    <div
                      className="
                      relative

                      h-[300px]

                      w-full

                      overflow-hidden

                      bg-gray-100
                      "
                    >


                      <Image

                        src={
                          data.avatar ||
                          "/placeholder.svg"
                        }

                        alt={data.name}

                        fill

                        className="
                        object-cover

                        transition

                        duration-500

                        group-hover:scale-105
                        "

                      />


                    </div>





                    {/* Content */}

                    <div
                      className="
                      space-y-4

                      p-6
                      "
                    >



                      <div>


                        <h3
                          className="
                          text-xl
                          font-bold
                          text-[#010F3F]
                          "
                        >
                          {data.name}
                        </h3>


                        <p
                          className="
                          mt-1
                          text-sm
                          font-medium
                          text-blue-600
                          "
                        >
                          {data.subject}
                        </p>


                      </div>






                      <div className="
                        space-y-2
                        text-sm
                        text-gray-600
                      ">


                        <p className="flex gap-2">

                          <GraduationCap
                            className="
                            size-4
                            text-blue-500
                            "
                          />

                          {data.qualification || "Experienced Teacher"}

                        </p>




                        <p className="flex gap-2">

                          <Briefcase
                            className="
                            size-4
                            text-blue-500
                            "
                          />

                          {data.experienceYears}
                          + বছর অভিজ্ঞতা

                        </p>





                        <p className="flex gap-2">

                          <Mail
                            className="
                            size-4
                            text-blue-500
                            "
                          />

                          {data.email}

                        </p>





                      </div>





                      <p className="
                        line-clamp-3
                        text-sm
                        leading-relaxed
                        text-gray-500
                      ">

                        {data.bio}

                      </p>



                    </div>



                  </div>


                );


              })}



            </div>


          )}



        </div>


      </section>


    </>

  );

}