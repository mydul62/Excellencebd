const stats = [
  { value: "৫,০০০+", label: "শিক্ষার্থী ভর্তি" },
  { value: "৫০+", label: "অভিজ্ঞ শিক্ষক" },
  { value: "৯৮%", label: "সাফল্যের হার" },
  { value: "১২+", label: "বছরের অভিজ্ঞতা" },
];

export function StatsBand() {
  return (
    <section className="bg-[#010F3F] py-14 text-[#8FA2B8]">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span className="font-display text-3xl font-bold text-white md:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm text-[#8FA2B8]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
