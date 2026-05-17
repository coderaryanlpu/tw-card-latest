"use client"

import { TrustWalletIcon } from "./trust-wallet-icon"
import { VisaLogo } from "./visa-logo"
import { MastercardLogo } from "./mastercard-logo"

// Twitter Icon
function TwitterIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// GitHub Icon
function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

// LinkedIn Icon
function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const footerLinks = {
  Features: [
    { label: "Security", href: "https://trustwallet.com/security" },
    { label: "Browser Extension", href: "https://trustwallet.com/browser-extension" },
    { label: "Cookie Notice", href: "https://trustwallet.com/cookie-notice" },
    { label: "Get Assets Listed", href: "https://developer.trustwallet.com/developer/new-asset" }
  ],
  Markets: [
    { label: "USDT Wallet", href: "https://trustwallet.com/usdt-wallet" },
    { label: "Bitcoin Wallet", href: "https://trustwallet.com/bitcoin-wallet" },
    { label: "Wallets", href: "https://trustwallet.com/download" },
    { label: "Partners", href: "https://trustwallet.com/trust-squad-program" }
  ],
  Build: [
    { label: "Developer Docs", href: "https://developer.trustwallet.com" },
    { label: "Wallet Core", href: "https://github.com/trustwallet/wallet-core" },
    { label: "Submit dApp", href: "https://developer.trustwallet.com/developer/listing-guide" },
    { label: "API Docs", href: "https://developer.trustwallet.com/developer/wallet-core/integration-guide/server-side" }
  ],
  About: [
    { label: "About Us", href: "https://trustwallet.com/about-us" },
    { label: "Careers", href: "https://trustwallet.com/careers" },
    { label: "Press Kit", href: "https://trustwallet.com/press" },
    { label: "Terms of Service", href: "https://trustwallet.com/terms-of-service" }
  ]
}

export function Footer() {
  return (
    <footer id="about" className="bg-slate-50 border-t border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-90 transition-opacity inline-flex">
              <TrustWalletIcon className="w-8 h-8 -translate-y-[1px]" />
              <img src="/trust-text.svg" alt="Trust" className="h-[18px] w-auto" />
            </a>
            <p className="text-slate-500 text-sm mb-6">
              Spend directly from your crypto wallet with 0% fees.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com/trustwallet" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="https://github.com/trustwallet" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                <GithubIcon className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/trustwallet" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-slate-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 TrustCard by Trust Wallet. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="bg-white border border-slate-200 rounded-md px-2 py-1">
              <VisaLogo className="w-10 h-6" />
            </div>
            <div className="bg-white border border-slate-200 rounded-md px-2 py-1">
              <MastercardLogo className="w-8 h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
