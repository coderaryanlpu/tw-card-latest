"use client"

import { Button } from "@/components/ui/button"
import { TrustWalletIcon } from "./trust-wallet-icon"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  onGetCard?: () => void
  loading?: boolean
}

export function Header({ onGetCard, loading }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0D1421]/95 backdrop-blur-xl border-b border-slate-800"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* 3-column layout: [flex-1 logo left] [nav center] [flex-1 button right]
            This guarantees the nav is always mathematically centered regardless of
            logo width or button width — same technique used by Apple, Stripe, etc. */}
        <div className="flex items-center h-16 md:h-20">

          {/* LEFT: logo — takes flex-1, aligns content to start */}
          <div className="flex flex-1 items-center justify-start">
            <a href="/" className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
              <TrustWalletIcon className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0500FF] to-[#00D2FF] bg-clip-text text-transparent">
                trust
              </span>
            </a>
          </div>

          {/* CENTER: nav links — natural width, always perfectly centered */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
              Features
            </a>
            <a href="#security" className="text-slate-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
              Security
            </a>
            <a href="#crypto" className="text-slate-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
              Crypto
            </a>
            <button
              onClick={scrollToAbout}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
            >
              About Us
            </button>
          </nav>

          {/* RIGHT: button — takes flex-1, aligns content to end */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <Button onClick={onGetCard} disabled={loading} className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 min-w-[140px]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing...
                </span>
              ) : "Get Your Card"}
            </Button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0D1421] border-t border-slate-800 px-4 py-6"
        >
          <nav className="flex flex-col gap-4">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium">
              Features
            </a>
            <a href="#security" className="text-slate-300 hover:text-white transition-colors font-medium">
              Security
            </a>
            <a href="#crypto" className="text-slate-300 hover:text-white transition-colors font-medium">
              Crypto
            </a>
            <button
              onClick={scrollToAbout}
              className="text-slate-300 hover:text-white transition-colors font-medium text-left"
            >
              About Us
            </button>
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
              <Button onClick={onGetCard} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full min-w-[140px]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </span>
                ) : "Get Your Card"}
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
