export function MastercardLogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 80 50" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red circle */}
      <circle cx="25" cy="20" r="18" fill="#EB001B" />
      {/* Orange/Yellow circle */}
      <circle cx="50" cy="20" r="18" fill="#F79E1B" />
      {/* Overlap area */}
      <path
        d="M37.5 5.5a18 18 0 0 0 0 29 18 18 0 0 0 0-29z"
        fill="#FF5F00"
      />
    </svg>
  )
}
