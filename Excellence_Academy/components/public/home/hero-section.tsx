"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";

const highlights = [
  "অভিজ্ঞ শিক্ষক",
  "সুবিধাজনক ব্যাচ",
  "সাফল্যের প্রমাণিত ইতিহাস",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#010F3F]">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#010F3F] via-[#061A52] to-[#146373]" />


      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="
          absolute
          -left-20
          top-20
          h-72
          w-72
          rounded-full
          bg-blue-500/20
          blur-3xl
        " />

        <div className="
          absolute
          right-0
          top-10
          h-96
          w-96
          rounded-full
          bg-orange-400/20
          blur-3xl
        " />


        <motion.div
          animate={{
            y:[0,-20,0]
          }}
          transition={{
            duration:5,
            repeat:Infinity
          }}
          className="
          absolute
          left-[40%]
          top-20
          h-20
          w-20
          rounded-full
          border
          border-white/10
          "
        />

      </div>



      <div className="
        container
        relative
        z-10
        mx-auto
        grid
        w-[95%]
        gap-10
        px-4
        py-16

        lg:grid-cols-2
        lg:items-center
        lg:py-24
      ">



        {/* Content */}

        <motion.div

          initial={{
            opacity:0,
            x:-40
          }}

          animate={{
            opacity:1,
            x:0
          }}

          transition={{
            duration:0.7
          }}

          className="space-y-7"

        >


          {/* Badge */}

          <motion.div

            initial={{
              opacity:0,
              y:-20
            }}

            animate={{
              opacity:1,
              y:0
            }}

            transition={{
              delay:.2
            }}

            className="
            inline-flex
            items-center
            gap-2

            rounded-full

            border
            border-white/20

            bg-white/10

            px-5
            py-2

            text-sm
            text-white

            backdrop-blur-xl
            "
          >

            <Sparkles className="size-4 text-orange-400"/>

            নতুন ব্যাচে ভর্তি চলছে

          </motion.div>




          {/* Heading */}

          <h1 className="
            text-4xl
            font-bold
            leading-tight
            tracking-tight

            text-white

            sm:text-5xl

            lg:text-6xl
          ">

            আজকের শিক্ষা,

            <br/>

            <span className="
              bg-gradient-to-r
              from-orange-400
              to-yellow-300

              bg-clip-text
              text-transparent
            ">
              আগামীর নেতৃত্ব
            </span>

          </h1>




          {/* Description */}

          <p className="
            max-w-xl

            text-lg

            leading-relaxed

            text-white/80
          ">

            দক্ষ ও অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে
            মানসম্মত শিক্ষা, নিয়মিত পরীক্ষা,
            ব্যক্তিগত যত্ন এবং আধুনিক শিক্ষার
            পরিবেশের মাধ্যমে আমরা শিক্ষার্থীদের
            উজ্জ্বল ভবিষ্যৎ গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।

          </p>




          {/* Buttons */}

          <div className="
            flex
            flex-wrap
            gap-4
          ">


            <Link

              href="/courses"

              className="
              group

              inline-flex
              h-12
              items-center
              gap-2

              rounded-full

              bg-gradient-to-r
              from-blue-500
              to-cyan-500

              px-6

              text-sm
              font-semibold

              text-white

              shadow-lg
              shadow-blue-500/30

              transition

              hover:scale-105
              "
            >

              সকল কোর্স দেখুন

              <ArrowRight
                className="
                size-4
                transition
                group-hover:translate-x-1
                "
              />

            </Link>




            <Link

              href="/contact"

              className="
              inline-flex
              h-12

              items-center
              gap-2

              rounded-full

              border
              border-white/20

              bg-white/10

              px-6

              text-sm
              font-semibold

              text-white

              backdrop-blur-xl

              transition

              hover:bg-white/20
              "
            >

              <Phone className="size-4"/>

              যোগাযোগ করুন

            </Link>


          </div>





          {/* Highlights */}

          <div className="
            flex
            flex-wrap
            gap-5
            pt-3
          ">


            {highlights.map((item,index)=>(

              <motion.div

                key={item}

                initial={{
                  opacity:0,
                  y:20
                }}

                animate={{
                  opacity:1,
                  y:0
                }}

                transition={{
                  delay:.4 + index*.1
                }}

                className="
                flex
                items-center
                gap-2

                text-sm
                text-white/90
                "

              >

                <CheckCircle2
                  className="
                  size-5
                  text-orange-400
                  "
                />

                {item}

              </motion.div>

            ))}


          </div>



        </motion.div>






        {/* Image */}


        <motion.div

          initial={{
            opacity:0,
            scale:.9
          }}

          animate={{
            opacity:1,
            scale:1
          }}

          transition={{
            duration:.8
          }}

          className="
          relative
          flex
          justify-center
          "

        >


          {/* Image Glow */}

          <div className="
            absolute
            inset-10
            rounded-full
            bg-orange-400/20
            blur-3xl
          "/>



          <motion.div

            animate={{
              y:[0,-12,0]
            }}

            transition={{
              duration:4,
              repeat:Infinity
            }}

            className="
            relative

            overflow-hiddenF

            rounded-[40px]

            border

            border-white/20

            bg-white/10

            p-3

            backdrop-blur-xl

            shadow-2xl
            "

          >


            <Image

              src="/st.png"

              alt="Excellence Academic Coaching"

              width={700}

              height={700}

              priority

              className="
              rounded-[32px]

              object-cover
              "

            />


          </motion.div>



        </motion.div>


      </div>


    </section>
  );
}