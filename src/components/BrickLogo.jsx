export default function BrickLogo({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Brick logo"
    >
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#2E2B28" />
      <g fill="#C8432B">
        <rect x="10" y="22" width="20" height="9" rx="1.5" />
        <rect x="32" y="22" width="22" height="9" rx="1.5" />
        <rect x="10" y="33" width="14" height="9" rx="1.5" />
        <rect x="26" y="33" width="20" height="9" rx="1.5" />
        <rect x="48" y="33" width="6" height="9" rx="1.5" />
      </g>
    </svg>
  )
}
