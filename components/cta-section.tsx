"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TrustWalletIcon } from "./trust-wallet-icon"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
  onGetCard?: () => void
  loading?: boolean
}

export function CTASection({ onGetCard, loading }: CTASectionProps) {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-8 md:p-16 overflow-hidden"
        >
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl" />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <TrustWalletIcon className="w-12 h-12" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance">
              Ready to spend crypto your way?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto text-pretty">
              Join millions of users who trust TrustCard for their everyday crypto spending. Get your card in minutes.
            </p>

            <div className="flex justify-center mt-10">
              <Button
                size="lg"
                onClick={onGetCard}
                disabled={loading}
                className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg min-w-[220px]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Get Your Card Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="mt-6 text-white/60 text-sm">
              No monthly fees • Cancel anytime • Instant activation
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
