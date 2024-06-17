export const nillionConfig = {
  websockets: ["/ip4/127.0.0.1/tcp/50356/ws/p2p/12D3KooWNQTeFoEFHLp46RVG3ydUSZ9neeoAL44DSRYjExWLsRQ4"],
  cluster_id: "18d71351-b5d9-4d8d-bbcd-cdcc615badab",
  payments_config: {
    rpc_endpoint: "http://127.0.0.1:48102",
    smart_contract_addresses: {
      blinding_factors_manager: process.env.NEXT_PUBLIC_NILLION_BLINDING_FACTORS_MANAGER_SC_ADDRESS,
      payments: process.env.NEXT_PUBLIC_NILLION_PAYMENTS_SC_ADDRESS,
    },
    signer: {
      wallet: {
        // @ts-ignore
        chain_id: parseInt(process.env.NEXT_PUBLIC_NILLION_CHAIN_ID || 0),
        private_key: "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
      },
    },
  },
};

console.log("config:", nillionConfig);
