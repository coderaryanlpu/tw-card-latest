export function USDTIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#26A17B" />
      <path
        d="M22.5 21.5v-2.3c3.1-.2 5.4-.8 5.4-1.6 0-.8-2.3-1.4-5.4-1.6v-2.5h4v-2.5h-11v2.5h4v2.5c-3.1.2-5.4.8-5.4 1.6 0 .8 2.3 1.4 5.4 1.6v6.8h3v-6.8h-.1c3.2-.2 5.5-.8 5.5-1.6 0-.8-2.3-1.4-5.4-1.6z"
        fill="#FFF"
      />
      <text x="20" y="34" textAnchor="middle" fontSize="5" fill="#FFF" fontWeight="bold">USDT</text>
    </svg>
  )
}

export function USDCIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#2775CA" />
      <path
        d="M25.5 22.5c0-2-1.2-2.7-3.7-3-.5-.1-1.8-.3-1.8-1.2 0-.7.5-1.1 1.5-1.1s1.7.4 1.8 1.2h1.9c-.2-1.5-1.2-2.5-2.7-2.8V14h-1.8v1.6c-1.7.3-2.8 1.4-2.8 2.9 0 1.9 1.4 2.6 3.5 2.9.8.1 2 .4 2 1.4 0 .8-.7 1.3-1.8 1.3-1.3 0-2-.6-2.1-1.5h-1.9c.1 1.7 1.2 2.8 3 3.1V27h1.8v-1.3c1.8-.3 3.1-1.4 3.1-3.2z"
        fill="#FFF"
      />
    </svg>
  )
}

export function BNBIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#F3BA2F" />
      <path d="M20 8l-3 3 3 3 3-3-3-3zm-8 8l-3 3 3 3 3-3-3-3zm16 0l-3 3 3 3 3-3-3-3zm-8 0l-3 3v0l3 3 3-3-3-3zm-8 8l-3 3 3 3 3-3-3-3zm16 0l-3 3 3 3 3-3-3-3zm-8 0l-3 3 3 3 3-3-3-3z" fill="#FFF"/>
    </svg>
  )
}

export function ETHIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#627EEA" />
      <path d="M20 6v11l9 4-9-15z" fill="#FFF" fillOpacity="0.6" />
      <path d="M20 6l-9 15 9-4V6z" fill="#FFF" />
      <path d="M20 26v8l9-12-9 4z" fill="#FFF" fillOpacity="0.6" />
      <path d="M20 34v-8l-9-4 9 12z" fill="#FFF" />
      <path d="M20 24l9-4-9-4v8z" fill="#FFF" fillOpacity="0.2" />
      <path d="M11 20l9 4v-8l-9 4z" fill="#FFF" fillOpacity="0.6" />
    </svg>
  )
}

export function TRONIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#EF0027" />
      <path d="M10 12l10 20 10-16-9-5-11 1z" fill="#FFF" />
      <path d="M21 13l7 4-7 10V13z" fill="#EF0027" fillOpacity="0.3" />
    </svg>
  )
}

export function TONIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#0098EA" />
      <path d="M20 8l-10 7 10 17 10-17-10-7z" fill="#FFF" />
      <path d="M20 8v24l10-17-10-7z" fill="#FFF" fillOpacity="0.7" />
    </svg>
  )
}
