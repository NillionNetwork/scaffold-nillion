export const nillionConfig = {
  websockets: ["/ip4/127.0.0.1/tcp/55693/ws/p2p/12D3KooWSqDTmdKdJ6AWaVMgUKdLBBVeF6mRo2sLuqbgjjCFEtDK"],
  cluster_id: "798d89ce-37f4-4d7d-aab9-ba511ae67ccc",
  payments_config: {
    rpc_endpoint: "http://localhost:55501",
    smart_contract_addresses: {
      blinding_factors_manager: "a513e6e4b8f2a923d98304ec87f64353c4d5c853",
      payments: "5fc8d32690cc91d4c39d9d3abcbd16989f875707",
    },
    signer: {
      wallet: {
        chain_id: 31337,
        private_key: "df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
      },
    },
  },
};
