import {
  CalendarDays,
  User,
  ArrowRight,
  Megaphone,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { NoticeCategoryBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import type { Notice } from "@/types";

export function NoticeCard({ 
  notice,
  isNew = false
}: { 
  notice: Notice;
  isNew?: boolean;
}) {

  return (
    <Card
      className="
      group
      overflow-hidden

      rounded-3xl

      border
      border-slate-200

      bg-white

      transition-all
      duration-300

      hover:-translate-y-1

      hover:border-[#146373]/30

      hover:shadow-[0_20px_50px_rgba(20,99,115,0.12)]
      "
    >

      <CardContent
        className="
        p-0
        "
      >


        {/* Top Accent */}

        <div
          className="
          h-1.5
          w-full
          bg-gradient-to-r
          from-[#146373]
          to-[#F9801D]
          "
        />



        <div className="p-6">



          {/* Header */}

          <div
            className="
            flex
            items-start
            justify-between
            gap-4
            "
          >


            <div className="flex gap-3">


              <div
                className="
                flex
                size-12
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-[#146373]/10

                text-[#146373]
                "
              >

                <Megaphone
                  className="
                  size-6
                  "
                />

              </div>



              <div>


                <h3
                  className="
                  line-clamp-2

                  text-lg

                  font-bold

                  leading-snug

                  text-[#010F3F]

                  transition

                  group-hover:text-[#146373]
                  "
                >
                  {notice.title}
                </h3>


              </div>


            </div>




            {isNew && (

              <span
                className="
                shrink-0

                rounded-full

                bg-red-500

                px-3

                py-1

                text-xs

                font-bold

                text-white
                "
              >
                NEW
              </span>

            )}



          </div>






          {/* Category */}

          <div
            className="
            mt-5

            flex

            flex-wrap

            gap-2
            "
          >

            <NoticeCategoryBadge 
              category={notice.category}
            />


            <span
              className="
              rounded-full

              bg-slate-100

              px-3

              py-1

              text-xs

              font-medium

              text-slate-600
              "
            >
              {notice.audience}
            </span>


          </div>







          {/* Content */}

          <p
            className="
            mt-4

            line-clamp-3

            text-sm

            leading-7

            text-slate-600
            "
          >
            {notice.content}
          </p>








          {/* Footer */}

          <div
            className="
            mt-6

            flex

            flex-wrap

            items-center

            justify-between

            gap-4

            border-t

            pt-4

            text-xs

            text-slate-500
            "
          >


            <div className="flex items-center gap-2">

              <CalendarDays
                className="
                size-4
                text-[#146373]
                "
              />

              {formatDate(notice.date)}

            </div>





            <div className="flex items-center gap-2">

              <User
                className="
                size-4
                text-[#146373]
                "
              />

              {notice.author}

            </div>



          </div>






          {/* Action */}

          <div
            className="
            mt-5

            flex

            items-center

            gap-2

            text-sm

            font-semibold

            text-[#146373]

            opacity-0

            transition

            group-hover:opacity-100
            "
          >

            View Details

            <ArrowRight
              className="
              size-4
              "
            />

          </div>



        </div>


      </CardContent>

    </Card>
  );
}