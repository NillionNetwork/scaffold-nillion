export const nillionConfig = {
  websockets: ["/ip4/127.0.0.1/tcp/63305/ws/p2p/12D3KooWFwP3xbuVVbFS5hnae6Vbb4dN4bSNrG3eBP2M7XM7V1qH"],
  cluster_id: "17db6f7b-903d-470e-9ff1-37c12d0d5efc",
  payments_config: {
    rpc_endpoint: "http://localhost:63121",
    smart_contract_addresses: {
      blinding_factors_manager: "a513e6e4b8f2a923d98304ec87f64353c4d5c853",
      payments: "5fc8d32690cc91d4c39d9d3abcbd16989f875707",
    },
    signer: {
      wallet: {
        chain_id: 31337,
        private_key: "92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
      },
    },
  },
};
