import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
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
    description: "সম্পূর্ণ নোট, অধ্যয়ন উপকরণ এবং নিয়মিত মডেল টেস্টের সুবিধা।",
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
    <section className="bg-[#F6F8FB] py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="কেন আমাদের বেছে নেবেন"
          title="আপনার সাফল্যের জন্য যা যা প্রয়োজন, সবই একসাথে"
          description="আমরা এমন একটি সম্পূর্ণ শিক্ষাব্যবস্থা প্রদান করি যা আপনার শেখা, দক্ষতা বৃদ্ধি এবং সফল ভবিষ্যৎ গঠনে সহায়ক।"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(1,15,63,0.05)]">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#EAF2F4] text-[#146373]">
                  <feature.icon className="size-6" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-lg font-semibold text-[#010F3F]">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#5b6b7a]">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
