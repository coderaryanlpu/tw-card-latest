"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

// ────────────────────────────────────────────────
//  Network option data
// ────────────────────────────────────────────────
const networks = [
  {
    id: "BSC",
    label: "USDT BEP20",
    sublabel: "BNB Smart Chain",
    color: "#F0B90B",
    bgColor: "rgba(240,185,11,0.08)",
    borderColor: "rgba(240,185,11,0.40)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9">
        <circle cx="16" cy="16" r="16" fill="#F0B90B" />
        <path
          d="M12.116 14.404 16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26ZM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16Zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.002-.001 2.262-2.259ZM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16Zm-3.188-.002h.002V16L16 18.294 13.708 16v-.004l.002-.002.563-.563L14.59 15l1.41-1.41 1.291 1.408Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    id: "ETH",
    label: "USDT ERC20",
    sublabel: "Ethereum Network",
    color: "#627EEA",
    bgColor: "rgba(98,126,234,0.08)",
    borderColor: "rgba(98,126,234,0.40)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9">
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <path d="M16.498 4v8.87l7.497 3.35L16.498 4Z" fill="rgba(255,255,255,0.60)" />
        <path d="M16.498 4 9 16.22l7.498-3.35V4Z" fill="#fff" />
        <path d="M16.498 21.968v6.027L24 17.616l-7.502 4.352Z" fill="rgba(255,255,255,0.60)" />
        <path d="M16.498 27.995v-6.028L9 17.616l7.498 10.379Z" fill="#fff" />
        <path d="m16.498 20.573 7.497-4.353-7.497-3.348v7.701Z" fill="rgba(255,255,255,0.20)" />
        <path d="m9 16.22 7.498 4.353v-7.701L9 16.22Z" fill="rgba(255,255,255,0.60)" />
      </svg>
    ),
  },
  {
    id: "TRON",
    label: "USDT TRC20",
    sublabel: "TRON Network",
    color: "#EF0027",
    bgColor: "rgba(239,0,39,0.07)",
    borderColor: "rgba(239,0,39,0.35)",
    icon: (
      <img
        src="/tron.png"
        alt="TRON"
        className="w-9 h-9 object-contain"
      />
    ),
  },
]


// ────────────────────────────────────────────────
//  Main modal component
// ────────────────────────────────────────────────
interface NetworkSelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (networkId: string) => void
  onNetworkHover?: (networkId: string) => void
}

export function NetworkSelectModal({ open, onClose, onSelect, onNetworkHover }: NetworkSelectModalProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)


  // Reset selection when reopened
  useEffect(() => {
    if (open) setSelected(null)
  }, [open])

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(10px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 22 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: "#ffffff",
              boxShadow: "0 24px 64px -12px rgba(15,23,42,0.22), 0 0 0 1px rgba(15,23,42,0.06)",
            }}
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg,#2563eb 0%,#3b82f6 50%,#60a5fa 100%)" }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Select Network</h2>
                <p className="text-xs text-slate-500 mt-0.5">Connect your assets to get card</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"
                style={{ border: "1px solid rgba(15,23,42,0.10)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Network cards */}
            <div className="px-6 pb-5 flex flex-col gap-2.5">
              {networks.map((net) => {
                const isSelected = selected === net.id
                return (
                  <motion.button
                    key={net.id}
                    whileHover={{ scale: 1.012 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelected(net.id)
                      onNetworkHover?.(net.id)
                    }}
                    onMouseEnter={() => onNetworkHover?.(net.id)}
                    className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{
                      background: isSelected ? net.bgColor : "rgba(248,250,252,1)",
                      border: isSelected
                        ? `1.5px solid ${net.borderColor}`
                        : "1.5px solid rgba(15,23,42,0.08)",
                      boxShadow: isSelected
                        ? `0 2px 16px -4px ${net.color}30`
                        : "0 1px 3px rgba(15,23,42,0.04)",
                    }}
                    aria-pressed={isSelected}
                  >
                    {/* Network icon */}
                    <div className="flex-shrink-0">
                      {net.icon}
                    </div>

                    {/* Labels */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{net.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{net.sublabel}</p>
                    </div>

                    {/* Radio dot */}
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200"
                      style={{
                        border: isSelected
                          ? `2px solid ${net.color}`
                          : "2px solid rgba(15,23,42,0.18)",
                        background: isSelected ? net.color : "transparent",
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Continue button */}
            <div className="px-6 pb-6">
              <motion.button
                whileHover={selected ? { scale: 1.02 } : {}}
                whileTap={selected ? { scale: 0.97 } : {}}
                disabled={!selected}
                onClick={() => {
                  if (selected) onSelect(selected)
                }}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: selected ? "#2563eb" : "rgba(15,23,42,0.06)",
                  color: selected ? "#fff" : "rgba(15,23,42,0.30)",
                  cursor: selected ? "pointer" : "not-allowed",
                  boxShadow: selected ? "0 4px 20px -4px rgba(37,99,235,0.55)" : "none",
                }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
