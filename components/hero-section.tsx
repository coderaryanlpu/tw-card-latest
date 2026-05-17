"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CryptoCard } from "./crypto-card"
import { VisaLogo } from "./visa-logo"
import { MastercardLogo } from "./mastercard-logo"
import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  onGetCard?: () => void
  loading?: boolean
}

export function HeroSection({ onGetCard, loading }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen lg:min-h-[auto] pt-8 md:pt-12 lg:pt-32 lg:pb-10 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-12 md:py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
              The Crypto Card That
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Moves With You
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty">
              Spend directly from your Trust Wallet with 0% fees and 2% cashback on all purchases.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">0%</p>
                <p className="text-sm text-slate-500 mt-1">Joining Fees</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">0%</p>
                <p className="text-sm text-slate-500 mt-1">Transaction Fees</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">2%</p>
                <p className="text-sm text-slate-500 mt-1">Cashback Rewards</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">180+</p>
                <p className="text-sm text-slate-500 mt-1">Countries Supported</p>
              </div>
            </div>

            {/* CTA Button — taller on mobile */}
            <div className="flex flex-col items-center lg:items-start sm:flex-row gap-4 justify-center lg:justify-start mt-8 md:mt-10">
              <Button
                size="lg"
                onClick={onGetCard}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 md:px-8 md:py-6 text-base md:text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all min-w-[220px] w-auto h-14 md:h-14"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Get Your Card
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Trust Badges - Desktop only */}
            <div className="hidden lg:flex items-center gap-4 justify-start mt-8 text-slate-400">
              <span className="text-sm">Accepted worldwide</span>
              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 rounded-md px-2 py-1">
                  <VisaLogo className="w-12 h-7" />
                </div>
                <div className="bg-white border border-slate-200 rounded-md px-2 py-1">
                  <MastercardLogo className="w-10 h-7" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center lg:items-end w-full lg:pr-21"
          >
            {/* Spacer between button and card on mobile */}
            <div className="h-8 lg:hidden" />

            {/* Card wrapper — centered on mobile, right-aligned on desktop */}
            <div className="relative mx-auto lg:mx-0 lg:scale-[1.2] xl:scale-[1.3] lg:origin-right lg:translate-y-4">
              {/* Payment Complete badge */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-2 z-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Payment Complete</p>
                    <p className="text-[10px] text-slate-500">-$350</p>
                  </div>
                </div>
              </motion.div>

              {/* Cashback badge */}
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-3 -right-3 bg-white rounded-xl shadow-lg p-2 z-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">💰</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Cashback Earned</p>
                    <p className="text-[10px] text-green-600">+$12.50</p>
                  </div>
                </div>
              </motion.div>

              {/* Static card — no float */}
              <div className="relative z-20">
                <CryptoCard />
              </div>
            </div>

            {/* Trust Badges — mobile only, lower spacing below card */}
            <div className="flex lg:hidden flex-col items-center gap-2 mt-16 text-slate-400">
              <span className="text-sm">Accepted worldwide</span>
              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 rounded-md px-2 py-1">
                  <VisaLogo className="w-12 h-7" />
                </div>
                <div className="bg-white border border-slate-200 rounded-md px-2 py-1">
                  <MastercardLogo className="w-10 h-7" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
