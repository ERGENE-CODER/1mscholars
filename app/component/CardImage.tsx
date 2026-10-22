"use client";

import { GraduationCap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Opportunity picture that never shows a blank box: if the image link is missing or broken,
 * a neutral placeholder is shown instead.
 */
export default function CardImage({ src, className = "", iconSize = 40 }: { src: string | null | undefined; className?: string; iconSize?: number }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // A broken image can fail before React attaches onError (server-rendered pages), so check once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el && src && el.complete && el.naturalWidth === 0) {
      const id = requestAnimationFrame(() => setFailedSrc(src));
      return () => cancelAnimationFrame(id);
    }
  }, [src]);

  if (!src || failedSrc === src) {
    return (
      <div className={`flex items-center justify-center bg-[#E4ECF7] text-[#12396B]/35 ${className}`} role="img" aria-label="No picture available">
        <GraduationCap size={iconSize} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} className={`object-cover ${className}`} />
  );
}
