export function VisaLogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 60" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue bar on top */}
      <rect x="0" y="0" width="100" height="8" fill="#1A1F71" />
      {/* Orange bar on bottom */}
      <rect x="0" y="52" width="100" height="8" fill="#F7A600" />
      {/* VISA text */}
      <text
        x="50"
        y="38"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="28"
        fontStyle="italic"
        fill="#1A1F71"
      >
        VISA
      </text>
    </svg>
  )
}
