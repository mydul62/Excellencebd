import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 mb-[100px]',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-[#146373]/20 bg-[#EAF2F4] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#146373]">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance text-[#010F3F] sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-pretty leading-relaxed text-[#5b6b7a]">
          {description}
        </p>
      )}
    </div>
  )
}
