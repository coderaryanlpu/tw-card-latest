"use client"

import { motion } from "framer-motion"
import { Wifi } from "lucide-react"

export function CryptoCard() {
  return (
    <motion.div
      initial={{ rotateY: 15, rotateX: 5, opacity: 0 }}
      animate={{ rotateY: 0, rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={{ 
        rotateY: -5, 
        rotateX: 5, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="relative w-full max-w-[380px] aspect-[1.586/1] perspective-1000"
    >
      {/* Card Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 via-cyan-400/30 to-blue-600/40 rounded-3xl blur-2xl transform translate-y-4 scale-95" />
      
      {/* Main Card */}
      <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-5 shadow-2xl overflow-hidden">
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        
        {/* Decorative Circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-300/20 rounded-full blur-xl" />
        
        {/* Card Content */}
        <div className="relative h-full flex flex-col justify-between">
          {/* Top Row */}
          <div className="flex items-start justify-between -mt-1">
            <span className="text-white font-semibold text-sm">Trust Wallet</span>
            <Wifi className="w-5 h-5 text-white/80 rotate-90" />
          </div>

          {/* Chip */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-8 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-md shadow-inner">
              <div className="w-full h-full grid grid-cols-2 gap-0.5 p-1">
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-3">
            <div className="flex gap-3 text-white text-base tracking-[0.15em] font-mono">
              <span>4000</span>
              <span>1234</span>
              <span>5678</span>
              <span>9010</span>
            </div>
            
            {/* Bottom Row */}
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Card Holder</p>
                <p className="text-white font-medium text-sm">SAINT PAUL</p>
              </div>
              <div className="space-y-0.5 text-center">
                <p className="text-white/60 text-[9px] uppercase tracking-wider">Expires</p>
                <p className="text-white font-medium text-sm">12/31</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-sm italic tracking-wide">VISA</span>
                <span className="text-white/70 text-[8px]">Platinum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
