interface PageBannerProps {
  title: string
  description?: string
}

export function PageBanner({ title, description }: PageBannerProps) {
  return (
    <section className="border-b border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center md:px-6 md:py-20">
        <h1 className="font-display text-3xl font-bold text-balance text-foreground md:text-4xl">{title}</h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">{description}</p>
        ) : null}
      </div>
    </section>
  )
}
