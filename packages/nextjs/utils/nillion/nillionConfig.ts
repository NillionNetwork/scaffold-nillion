export const nillionConfig = {
  websockets: [process.env.NEXT_PUBLIC_NILLION_WEBSOCKETS],
  cluster_id: "9e68173f-9c23-4acc-ba81-4f079b639964",
  payments_config: {
    rpc_endpoint: process.env.NEXT_PUBLIC_NILLION_BLOCKCHAIN_RPC_ENDPOINT,
    smart_contract_addresses: {
      blinding_factors_manager: process.env.NEXT_PUBLIC_NILLION_BLINDING_FACTORS_MANAGER_SC_ADDRESS,
      payments: process.env.NEXT_PUBLIC_NILLION_PAYMENTS_SC_ADDRESS,
    },
    signer: {
      wallet: {
        // @ts-ignore
        chain_id: parseInt(process.env.NEXT_PUBLIC_NILLION_CHAIN_ID || 0),
        private_key: process.env.NEXT_PUBLIC_NILLION_WALLET_PRIVATE_KEY,
      },
    },
  },
};
