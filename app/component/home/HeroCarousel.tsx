"use client";

import Link from "next/link";
import { useEffect, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/* =========================================================
   EDIT THE SLIDES HERE
   Photos are free to use under the Unsplash License
   (https://unsplash.com/license). Swap any `image` for your own.
   ========================================================= */

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1800&q=75`;

const SLIDES = [
  {
    // Photo: Blessfield John, Unsplash: graduates in caps and gowns
    image: unsplash("photo-1769905226600-1d447fe7d020"),
    alt: "Graduates in caps and gowns celebrating in an auditorium",
    kicker: "Scholarships",
    title: "Find scholarships that open doors",
    text: "Rwanda's trusted youth opportunity platform, connecting students and graduates to scholarships, fellowships and study opportunities.",
    cta: { label: "Explore Scholarships", href: "/opportunities/scholarships" },
  },
  {
    // Photo: Vitaly Gariev, Unsplash: students gathered around a laptop
    image: unsplash("photo-1758270705290-62b6294dd044"),
    alt: "Students learning together around a laptop",
    kicker: "Skills & Training",
    title: "Build skills that employers want",
    text: "Explore courses and training in web development, cybersecurity, data analysis, design and more.",
    cta: { label: "Explore Training", href: "/opportunities/training" },
  },
  {
    // Photo: Lala Azizli, Unsplash: a team working together at desks
    image: unsplash("photo-1569098644584-210bcd375b59"),
    alt: "A team of young professionals working together at a desk",
    kicker: "Jobs & Internships",
    title: "Start your career with confidence",
    text: "Browse jobs and internships, and get expert guidance on your documents and applications from first search to final submission.",
    cta: { label: "Browse Jobs", href: "/opportunities/jobs" },
  },
] as const;

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true); // the visitor's pause / play button
  const [hovering, setHovering] = useState(false); // pointer or keyboard focus inside the carousel
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const count = SLIDES.length;

  const go = (to: number) => setIndex(((to % count) + count) % count);

  // Auto-advance. The timer restarts every time the slide changes, so using the arrows or dots
  // never causes an immediate jump. Visitors who prefer reduced motion never get autoplay.
  useEffect(() => {
    if (!playing || hovering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [index, playing, hovering, count]);

  function onTouchEnd(e: TouchEvent<HTMLElement>) {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) >= SWIPE_PX) go(index + (delta < 0 ? 1 : -1));
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured opportunities"
      className="relative isolate h-full min-h-[420px] w-full overflow-hidden rounded-2xl bg-[#0A1F44]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
    >
      {SLIDES.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? "z-10 opacity-100" : "z-0 opacity-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            {/* Dark gradient so the text is readable on any photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F44]/90 via-[#0A1F44]/65 to-[#0A1F44]/10" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0A1F44]/60 to-transparent" />

            <div className="relative mx-auto flex h-full max-w-[1240px] items-center px-6 sm:px-10 md:px-16">
              <div
                className={`max-w-md transition-all duration-700 motion-reduce:transition-none ${active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
              >
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {slide.kicker}
                </span>
                <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl xl:text-4xl">
                  {slide.title}
                </h2>
                <p className="mt-3 max-w-md text-[14px] leading-6 text-blue-100 sm:text-[15px]">{slide.text}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={slide.cta.href}
                    className="inline-flex h-11 items-center justify-center rounded-sm bg-[#2166E8] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1554C7]"
                  >
                    {slide.cta.label}
                  </Link>
                  <Link
                    href="/opportunities"
                    className="inline-flex h-11 items-center justify-center rounded-sm border border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    All Opportunities
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* PREVIOUS / NEXT (hidden on small phones, where swiping works) */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 sm:flex"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 sm:flex"
      >
        <ChevronRight size={22} />
      </button>

      {/* DOTS + PAUSE */}
      <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause automatic slide show" : "Start automatic slide show"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}