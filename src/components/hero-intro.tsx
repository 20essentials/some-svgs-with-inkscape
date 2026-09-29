import BlurOutUp from '@/components/smoothui/blur-out-up';
import MagneticButton from '@/components/smoothui/magnetic-button';
import PerCharacterRise from '@/components/smoothui/per-character-rise';
import SmoothButton from '@/components/smoothui/smooth-button';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Sequential entrances, one delay step per block. */
const DELAYS = {
  eyebrow: 100,
  tagline: 620,
  actions: 780
} as const;

interface HeroIntroProps {
  count: string;
  headline: string;
  subline: string;
  tagline: string;
  eyebrow: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export default function HeroIntro({
  count,
  headline,
  subline,
  tagline,
  eyebrow,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref
}: HeroIntroProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  /** Motion's own reduced-motion handling would strip opacity, leaving the
   *  block invisible — so the animation is skipped entirely instead. */
  const rise = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          animate: { opacity: 1, y: 0 },
          initial: { opacity: 0, y: 18 },
          transition: { delay: delay / 1000, duration: 0.7, ease: EASE }
        };

  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <motion.p
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[4.5%] px-3.5 py-1.5 font-mono text-[0.68rem] tracking-[0.24em] text-white/65 uppercase backdrop-blur-md"
        {...rise(DELAYS.eyebrow)}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-brand)]" />
        {eyebrow}
      </motion.p>

      <h1 className="flex flex-col items-center text-balance">
        <span className="sr-only">
          {count} {headline} {subline}
        </span>
        <span
          aria-hidden="true"
          className="font-display block bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-[clamp(2.75rem,12vw,10rem)] leading-[0.86] font-semibold tracking-[-0.05em] text-transparent"
        >
          <PerCharacterRise delay={200} stagger={26}>
            {`${count} ${headline}`}
          </PerCharacterRise>
        </span>
        <span
          aria-hidden="true"
          className="font-display block text-[clamp(1.5rem,5vw,4.25rem)] leading-[1.05] font-medium tracking-[-0.04em] text-white/45"
        >
          <BlurOutUp delay={420} stagger={80}>
            {subline}
          </BlurOutUp>
        </span>
      </h1>

      <motion.p
        className="max-w-[46ch] text-balance text-[0.975rem] leading-relaxed text-white/60 sm:text-lg"
        {...rise(DELAYS.tagline)}
      >
        <BlurOutUp delay={DELAYS.tagline} stagger={42}>
          {tagline}
        </BlurOutUp>
      </motion.p>

      <motion.div
        className="mt-1 flex flex-wrap items-center justify-center gap-3"
        {...rise(DELAYS.actions)}
      >
        <MagneticButton
          asChild
          className="h-11 rounded-full bg-[var(--color-brand)] px-7 text-[0.95rem] font-medium text-white shadow-lg shadow-black/40 hover:bg-[var(--color-brand-secondary)]"
          strength={0.22}
        >
          <a href={primaryHref}>
            {primaryLabel}
            <ArrowDown className="size-4" />
          </a>
        </MagneticButton>
        <SmoothButton
          asChild
          className="h-11 rounded-full border border-white/15 bg-white/[4.5%] px-7 text-[0.95rem] font-medium text-white backdrop-blur-md hover:bg-white/10"
          shape="pill"
          size="lg"
          suffix={<ArrowUpRight className="size-4" />}
          variant="outline"
        >
          <a href={secondaryHref} rel="noopener noreferrer" target="_blank">
            {secondaryLabel}
          </a>
        </SmoothButton>
      </motion.div>
    </div>
  );
}
