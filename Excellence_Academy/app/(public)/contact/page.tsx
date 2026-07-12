import { ContactForm } from "@/components/public/contact-form";
import { PageBanner } from "@/components/public/page-banner";
import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description:
    "Exellence Academy-এর সাথে যোগাযোগ করুন। আমরা আপনাকে সহায়তা করতে সর্বদা প্রস্তুত।",
};

const info = [
  {
    icon: MapPinIcon,
    label: "ঠিকানা",
    value: "বাড়ি নং ৩১৫, রোড নং ১৩, সাভার DOHS, সাভার",
  },
  {
    icon: PhoneIcon,
    label: "ফোন",
    value: "+880 1306031982",
  },
  {
    icon: MailIcon,
    label: "ইমেইল",
    value: "toukirahmed.th@gmail.com",
  },
  {
    icon: ClockIcon,
    label: "অফিস সময়",
    value: "শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ৮:০০",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="যোগাযোগ করুন"
        description="ভর্তি, কোর্স বা ক্লাসের সময়সূচি সম্পর্কে কোনো প্রশ্ন আছে? আমরা আপনার কথা শুনতে এবং সহায়তা করতে আনন্দিত।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {info.map((item) => (
              <Card key={item.label} className="border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(1,15,63,0.05)]">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F4] text-[#146373]">
                    <item.icon className="size-5" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[#5b6b7a]">
                      {item.label}
                    </span>

                    <span className="font-medium text-[#010F3F]">
                      {item.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
