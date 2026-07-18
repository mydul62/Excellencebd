"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  AwardIcon,
  BookOpenCheckIcon,
  ClockIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  UsersIcon,
} from "lucide-react";

const features = [
  {
    icon: GraduationCapIcon,
    title: "অভিজ্ঞ শিক্ষকবৃন্দ",
    description:
      "অভিজ্ঞ ও দক্ষ শিক্ষকদের কাছ থেকে বিষয়ভিত্তিক মানসম্মত শিক্ষা গ্রহণের সুযোগ।",
  },
  {
    icon: UsersIcon,
    title: "ছোট ব্যাচ সিস্টেম",
    description:
      "প্রতিটি ব্যাচে সীমিত সংখ্যক শিক্ষার্থী থাকায় সবাই পায় ব্যক্তিগত যত্ন ও নির্দেশনা।",
  },
  {
    icon: ClockIcon,
    title: "সুবিধাজনক ক্লাস সময়সূচি",
    description:
      "সকাল ও সন্ধ্যার ব্যাচের সুবিধা, যাতে আপনার সময়ের সাথে সহজেই মিলিয়ে পড়াশোনা করা যায়।",
  },
  {
    icon: AwardIcon,
    title: "প্রমাণিত সাফল্য",
    description:
      "হাজারো শিক্ষার্থীর ধারাবাহিক ভালো ফলাফল ও সফলতার গর্বিত ইতিহাস।",
  },
  {
    icon: BookOpenCheckIcon,
    title: "মানসম্মত শিক্ষাসামগ্রী",
    description:
      "সম্পূর্ণ নোট, অধ্যয়ন উপকরণ এবং নিয়মিত মডেল টেস্টের সুবিধা।",
  },
  {
    icon: HeartHandshakeIcon,
    title: "সর্বক্ষণিক শিক্ষার্থী সহায়তা",
    description:
      "মেন্টরশিপ, প্রশ্ন সমাধান এবং প্রয়োজনীয় সহায়তা সবসময় আপনার পাশে।",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-16 md:py-24">

      {/* Background Glow */}
      <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />


      <div className="relative container mx-auto w-[95%] px-4 md:px-6">


        <SectionHeading
          eyebrow="কেন আমাদের বেছে নেবেন"
          title="আপনার সাফল্যের জন্য যা যা প্রয়োজন, সবই একসাথে"
          description="আমরা এমন একটি সম্পূর্ণ শিক্ষাব্যবস্থা প্রদান করি যা আপনার শেখা, দক্ষতা বৃদ্ধি এবং সফল ভবিষ্যৎ গঠনে সহায়ক।"
        />


        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">


          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (

              <motion.div

                key={feature.title}

                initial={{
                  opacity:0,
                  y:40
                }}

                whileInView={{
                  opacity:1,
                  y:0
                }}

                viewport={{
                  once:true
                }}

                transition={{
                  duration:0.5,
                  delay:index * 0.1
                }}

                whileHover={{
                  y:-10
                }}

                className="group"

              >


                <div
                  className="
                  relative h-full
                  rounded-3xl
                  border border-white/60
                  bg-white/70
                  backdrop-blur-xl
                  p-6

                  shadow-[0_20px_50px_rgba(15,23,42,0.08)]

                  transition-all
                  duration-300

                  hover:shadow-[0_25px_60px_rgba(37,99,235,0.18)]
                  "
                >


                  {/* Icon */}

                  <div
                    className="
                    flex
                    size-14
                    items-center
                    justify-center

                    rounded-2xl

                    bg-gradient-to-br
                    from-blue-500
                    to-cyan-400

                    text-white

                    shadow-lg
                    shadow-blue-500/30

                    transition-transform
                    duration-300

                    group-hover:scale-110
                    "
                  >

                    <Icon className="size-7" />

                  </div>



                  <div className="mt-6 space-y-3">


                    <h3
                      className="
                      text-xl
                      font-bold

                      text-[#010F3F]
                      "
                    >
                      {feature.title}
                    </h3>



                    <p
                      className="
                      text-sm
                      leading-relaxed

                      text-[#5b6b7a]
                      "
                    >
                      {feature.description}
                    </p>


                  </div>



                  {/* Bottom Line */}

                  <div
                    className="
                    absolute
                    bottom-0
                    left-6
                    h-1
                    w-0

                    rounded-full

                    bg-gradient-to-r
                    from-blue-500
                    to-cyan-400

                    transition-all
                    duration-500

                    group-hover:w-20
                    "
                  />


                </div>


              </motion.div>

            );

          })}


        </div>


      </div>


    </section>
  );
}