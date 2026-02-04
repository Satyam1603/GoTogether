export function Logo({ className = "h-8 w-8" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Car */}
      <g>
        {/* Car body left - main rectangle */}
        <rect x="10" y="45" width="30" height="20" rx="4" fill="currentColor" />
        {/* Car window left */}
        <rect x="15" y="48" width="12" height="10" rx="2" fill="currentColor" opacity="0.6" />
        {/* Wheel left-front */}
        <circle cx="24" cy="68" r="4" fill="currentColor" />
        {/* Wheel left-back */}
        <circle cx="36" cy="68" r="4" fill="currentColor" />
      </g>
      
      {/* Right Car */}
      <g>
        {/* Car body right - main rectangle */}
        <rect x="60" y="45" width="30" height="20" rx="4" fill="currentColor" />
        {/* Car window right */}
        <rect x="73" y="48" width="12" height="10" rx="2" fill="currentColor" opacity="0.6" />
        {/* Wheel right-front */}
        <circle cx="64" cy="68" r="4" fill="currentColor" />
        {/* Wheel right-back */}
        <circle cx="76" cy="68" r="4" fill="currentColor" />
      </g>
      
      {/* Connection arrow between cars */}
      <path
        d="M 45 55 L 55 55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head pointing right */}
      <path
        d="M 50 52 L 55 55 L 50 58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Shared riders - three people at top */}
      <g>
        {/* Person 1 head */}
        <circle cx="32" cy="18" r="3" fill="currentColor" />
        {/* Person 1 body */}
        <line x1="32" y1="22" x2="32" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Person 2 head */}
        <circle cx="50" cy="16" r="3" fill="currentColor" />
        {/* Person 2 body */}
        <line x1="50" y1="20" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Person 3 head */}
        <circle cx="68" cy="18" r="3" fill="currentColor" />
        {/* Person 3 body */}
        <line x1="68" y1="22" x2="68" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
