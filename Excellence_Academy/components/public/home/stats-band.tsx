const stats = [
  { value: "5,000+", label: "Students Enrolled" },
  { value: "50+", label: "Expert Teachers" },
  { value: "98%", label: "Success Rate" },
  { value: "12+", label: "Years of Excellence" },
]

export function StatsBand() {
  return (
    <section className="bg-primary py-14 text-primary-foreground">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <span className="font-display text-3xl font-bold md:text-4xl">{stat.value}</span>
              <span className="text-sm text-primary-foreground/80">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
