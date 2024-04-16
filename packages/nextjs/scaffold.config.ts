import * as chains from "viem/chains";
import { defineChain } from "viem/utils";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
};

const fallbackChain = chains.hardhat;

const rpcUrls = process.env.NEXT_PUBLIC_NILLION_BLOCKCHAIN_RPC_ENDPOINT
  ? {
      default: { http: [process.env.NEXT_PUBLIC_NILLION_BLOCKCHAIN_RPC_ENDPOINT] },
      public: { http: [process.env.NEXT_PUBLIC_NILLION_BLOCKCHAIN_RPC_ENDPOINT] },
    }
  : fallbackChain.rpcUrls;

const configChain: chains.Chain = defineChain({
  ...fallbackChain,
  id: process.env.NEXT_PUBLIC_NILLION_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_NILLION_CHAIN_ID) : fallbackChain.id,
  name: process.env.NEXT_PUBLIC_NILLION_NAME || fallbackChain.name,
  network: process.env.NEXT_PUBLIC_NILLION_NETWORK || fallbackChain.network,
  rpcUrls,
});

const targetNetwork = process.env.NEXT_PUBLIC_USE_NILLION_CONFIG === "true" ? configChain : chains.hardhat;

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [targetNetwork],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,

  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
