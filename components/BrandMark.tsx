/**
 * BrandMark — DeepSun Studio's signature solar node.
 *
 * Design: A filled circle (the deep core) with four gapped cardinal rays
 * (the sun's energy radiating outward). Reads as: sun · circuit node ·
 * compass origin · radiant system.
 *
 * Never animated. Never oversized. Inherits currentColor when inline,
 * renders in amber when standalone.
 *
 * Three contexts:
 *   size="icon"   12×12  — inside chips as the indicator dot
 *   size="mark"   20×20  — navbar companion to wordmark
 *   size="large"  32×32  — footer statement accent
 */

interface BrandMarkProps {
  size?: 'icon' | 'mark' | 'large'
  color?: string
  className?: string
  'aria-hidden'?: boolean
}

const SIZES = {
  icon:  12,
  mark:  20,
  large: 32,
}

export function BrandMark({
  size = 'mark',
  color = 'currentColor',
  className,
  'aria-hidden': ariaHidden = true,
}: BrandMarkProps) {
  const px = SIZES[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={ariaHidden}
      className={className}
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      {/* Core — the deep nucleus */}
      <circle cx="12" cy="12" r="3.2" fill={color} />

      {/* Cardinal rays — gap between circle edge and ray start */}
      {/* Top */}
      <line x1="12" y1="2"  x2="12" y2="6.8"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Right */}
      <line x1="17.2" y1="12" x2="22" y2="12"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Bottom */}
      <line x1="12" y1="17.2" x2="12" y2="22"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Left */}
      <line x1="2"  y1="12" x2="6.8"  y2="12"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
