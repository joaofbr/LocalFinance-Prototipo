import { useState } from 'react'
import { TOUR_SLIDES } from './tourSlides'

export function ProductTour() {
  const [active, setActive] = useState(0)
  const slide = TOUR_SLIDES[active]
  const next = () => setActive((index) => (index + 1) % TOUR_SLIDES.length)

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Conheça o LocalFinance"
      className="group w-full max-w-[420px]"
    >
      <div className="relative h-[292px]">
        {TOUR_SLIDES.map(({ title, Preview }, index) => (
          <div
            key={title}
            data-theme="light"
            aria-hidden={index !== active}
            className={`absolute inset-0 flex flex-col rounded-2xl bg-surface p-5 text-text shadow-[0_32px_64px_-28px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${index === active
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0'
              }`}
          >
            <Preview />
          </div>
        ))}
      </div>

      <div
        key={active}
        aria-live="polite"
        className="mt-7 min-h-[72px] animate-[tour-fade_450ms_ease-out] motion-reduce:animate-none"
      >
        <h2 className="text-[18px] font-bold tracking-tight">{slide.title}</h2>
        <p className="mt-1 text-pretty text-[14.5px] leading-relaxed text-white/70">
          {slide.text}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {TOUR_SLIDES.map(({ title }, index) => (
          <button
            key={title}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Mostrar: ${title}`}
            aria-current={index === active}
            className={`relative h-1.5 overflow-hidden rounded-full bg-white/20 transition-[width] duration-300 hover:bg-white/35 ${index === active ? 'w-10' : 'w-4'
              }`}
          >
            {index === active && (
              <span
                onAnimationEnd={next}
                className="absolute inset-0 origin-left rounded-full bg-white animate-[tour-progress_3s_linear_forwards] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:bg-white/80"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
