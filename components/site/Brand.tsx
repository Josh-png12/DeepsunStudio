import Link from 'next/link'

export function SunMark({ className = 'sunmark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path fill="#FFB83F" d="M8 51a42 42 0 0 1 84 0v5H8z" />
      <path fill="#FFB83F" d="M7 63h86v8H7zM16 80h68v8H16z" />
    </svg>
  )
}

export function BrandLink({ label, href = '/' }: { label: string; href?: string }) {
  return (
    <Link className="brand" href={href} aria-label={label}>
      <SunMark />
      <span className="brandword">
        deepsun{' '}
        <small>STUDIO</small>
      </span>
    </Link>
  )
}
