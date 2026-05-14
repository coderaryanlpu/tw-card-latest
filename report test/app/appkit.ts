import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, bsc } from "@reown/appkit/networks";

// Trust Wallet WalletConnect registry ID
const TRUST_WALLET_ID = "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0";

export const appKit = createAppKit({
  adapters: [
    new (EthersAdapter as unknown as { new (): any })(),
  ],
  networks: [mainnet, bsc],
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID as string,
  metadata: {
    name: "Crypto AML",
    description: "Wallet connection",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: [],
  },
  // Show only WalletConnect (QR) + Trust Wallet
  featuredWalletIds: [TRUST_WALLET_ID],
  includeWalletIds: [TRUST_WALLET_ID],
});
