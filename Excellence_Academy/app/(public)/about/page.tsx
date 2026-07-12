import { StatsBand } from "@/components/public/home/stats-band";
import { PageBanner } from "@/components/public/page-banner";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2Icon, EyeIcon, HeartIcon, TargetIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "Exellence Academy সম্পর্কে জানুন—আমাদের লক্ষ্য, দৃষ্টিভঙ্গি এবং শিক্ষার্থীদের সাফল্যের প্রতি আমাদের অঙ্গীকার।",
};

const values = [
  {
    icon: TargetIcon,
    title: "আমাদের লক্ষ্য",
    description:
      "মানসম্মত ও সহজলভ্য শিক্ষা প্রদান করে প্রতিটি শিক্ষার্থীকে তার সর্বোচ্চ সম্ভাবনা অর্জন এবং একাডেমিক সাফল্যের পথে এগিয়ে নেওয়া।",
  },
  {
    icon: EyeIcon,
    title: "আমাদের দৃষ্টিভঙ্গি",
    description:
      "আধুনিক ও কার্যকর শিক্ষাদান পদ্ধতির মাধ্যমে আত্মবিশ্বাসী শিক্ষার্থী এবং ভবিষ্যতের দক্ষ নেতৃত্ব তৈরি করে দেশের অন্যতম বিশ্বস্ত কোচিং সেন্টার হিসেবে প্রতিষ্ঠিত হওয়া।",
  },
  {
    icon: HeartIcon,
    title: "আমাদের মূল্যবোধ",
    description:
      "সততা, নিষ্ঠা এবং শিক্ষার্থী-কেন্দ্রিক চিন্তাধারা আমাদের প্রতিটি কার্যক্রমের মূল ভিত্তি। আমরা জ্ঞান ও নৈতিকতার সমন্বিত বিকাশে বিশ্বাস করি।",
  },
];

const highlights = [
  "অভিজ্ঞ ও দক্ষ শিক্ষকবৃন্দ",
  "আধুনিক শ্রেণিকক্ষ ও ডিজিটাল শিক্ষার সুবিধা",
  "নিয়মিত মূল্যায়ন ও অগ্রগতি পর্যবেক্ষণ",
  "ছোট ব্যাচের মাধ্যমে ব্যক্তিগত যত্ন",
  "সম্পূর্ণ স্টাডি ম্যাটেরিয়াল ও শিক্ষাসহায়ক উপকরণ",
  "শিক্ষার্থীদের ধারাবাহিক সফলতার প্রমাণিত ইতিহাস",
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="আমাদের সম্পর্কে"
        description="গত ১২ বছরেরও বেশি সময় ধরে আমরা মানসম্মত শিক্ষার মাধ্যমে শিক্ষার্থীদের আত্মবিশ্বাসী ও সফল মানুষ হিসেবে গড়ে তুলতে কাজ করে আসছি।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(1,15,63,0.05)]">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#EAF2F4] text-[#146373]">
                    <value.icon className="size-6" />
                  </div>

                  <h2 className="font-display text-xl font-semibold text-[#010F3F]">
                    {value.title}
                  </h2>

                  <p className="text-sm leading-relaxed text-[#5b6b7a]">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F6F8FB] py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-3xl font-bold text-balance text-[#010F3F]">
              কেন শিক্ষার্থী ও অভিভাবকরা আমাদের ওপর আস্থা রাখেন
            </h2>

            <p className="leading-relaxed text-[#5b6b7a]">
              Bright Future Coaching Center-এ আমরা অভিজ্ঞ শিক্ষকবৃন্দ, সহায়ক
              শিক্ষার পরিবেশ এবং ফলাফলভিত্তিক শিক্ষাদান পদ্ধতির মাধ্যমে প্রতিটি
              শিক্ষার্থীকে একাডেমিক ও ব্যক্তিগত জীবনে সফল হতে সহায়তা করি।
            </p>

            <ul className="flex flex-col gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-[#F9801D]" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] shadow-[0_10px_30px_rgba(1,15,63,0.08)]">
            <img
              src="/students-studying-together-in-a-modern-classroom.png"
              alt="আধুনিক শ্রেণিকক্ষে একসাথে পড়াশোনা করছে শিক্ষার্থীরা"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <StatsBand />
    </>
  );
}
