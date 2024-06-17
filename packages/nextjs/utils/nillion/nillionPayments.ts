import { nillionConfig } from "./nillionConfig";
import { MsgPayFor, typeUrl } from "./tempProto";
import { DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { NillionClient, Operation, PaymentReceipt } from "@nillion/client";

// create Nillion wallet from private key
export async function createNillionWallet(hexKey: string): Promise<DirectSecp256k1Wallet> {
  //   @ts-ignore
  //   if (!window.keplr) {
  //     throw new Error("Keplr extension is not installed");
  //   }

  //   //   @ts-ignore
  //   await window.keplr.experimentalSuggestChain({
  //     chainId: "test-test",
  //     chainName: "test-test",
  //     rpc: process.env.NEXT_PUBLIC_NILLION_JSON_RPC,
  //     rest: process.env.NEXT_PUBLIC_NILLION_JSON_RPC,
  //     chainSymbolImageUrl:
  //       "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png",
  //     stakeCurrency: {
  //       coinDenom: "NIL",
  //       coinMinimalDenom: "unil",
  //       coinDecimals: 6,
  //       coinImageUrl:
  //         "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png",
  //     },
  //     bip44: {
  //       coinType: 118,
  //     },
  //     bech32Config: {
  //       bech32PrefixAccAddr: "nillion",
  //       bech32PrefixAccPub: "nillionpub",
  //       bech32PrefixValAddr: "nillionvaloper",
  //       bech32PrefixValPub: "nillionvaloperpub",
  //       bech32PrefixConsAddr: "nillionvalcons",
  //       bech32PrefixConsPub: "nillionvalconspub",
  //     },
  //     currencies: [
  //       {
  //         coinDenom: "NIL",
  //         coinMinimalDenom: "unil",
  //         coinDecimals: 6,
  //         coinImageUrl:
  //           "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png",
  //       },
  //     ],
  //     feeCurrencies: [
  //       {
  //         coinDenom: "NIL",
  //         coinMinimalDenom: "unil",
  //         coinDecimals: 6,
  //         coinImageUrl:
  //           "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png",
  //         gasPriceStep: {
  //           low: 0.001,
  //           average: 0.001,
  //           high: 0.01,
  //         },
  //       },
  //     ],
  //     features: [],
  //   });

  //   //   @ts-ignore
  //   await window.keplr.enable("test-test");

  const key = Uint8Array.from(
    // @ts-ignore
    hexKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)),
  );
  // @ts-ignore
  //   return await window.keplr.enable("test-test");
  return await DirectSecp256k1Wallet.fromKey(key, "nillion");
}

export async function createNilChainClient(wallet: DirectSecp256k1Wallet): Promise<SigningStargateClient> {
  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options = {
    registry,
    gasPrice: GasPrice.fromString("0.025nil"),
    gasAdjustment: 1.3,
    autoGas: true,
  };
  // use rpc url proxy, set up in next.config.js
  const proxyRpcEndpoint = `${document.location.origin}/api/rpc`;
  return await SigningStargateClient.connectWithSigner(proxyRpcEndpoint, wallet, options);
}

export async function pay(
  nillion: any,
  client: NillionClient,
  nilchainClient: SigningStargateClient,
  wallet: DirectSecp256k1Wallet,
  operation: Operation,
): Promise<PaymentReceipt> {
  console.log("try to get quote", nillionConfig.cluster_id);
  const op = Operation.update_permissions();
  // debugger;
  const info = await client.cluster_information("9e68173f-9c23-4acc-ba81-4f079b639964");
  console.log("info", info);
  const quote = await client.request_price_quote("9e68173f-9c23-4acc-ba81-4f079b639964", op);
  console.log("got quote", quote);

  const denom = "unil";
  const [account] = await wallet.getAccounts();
  const from = account.address;

  const payload: MsgPayFor = {
    fromAddress: from,
    resource: quote.nonce,
    amount: [{ denom, amount: quote.cost.total }],
  };

  const result = await nilchainClient.signAndBroadcast(from, [{ typeUrl, value: payload }], "auto");

  return new nillion.PaymentReceipt(quote, result.transactionHash);
}
