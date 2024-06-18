"use client";

import { useEffect, useRef, useState } from "react";
// import { Context } from "./config";
import { DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import init, { NillionClient, NodeKey, Operation, PaymentReceipt, Secret, Secrets, UserKey } from "@nillion/client";
import { MsgPayFor, typeUrl } from "@nillion/client/proto";
import type { NextPage } from "next";
import { Sign } from "node:crypto";
// import { useAccount } from "wagmi";
import { CopyString } from "~~/components/nillion/CopyString";
import { NillionOnboarding } from "~~/components/nillion/NillionOnboarding";
import RetrieveSecretCommand from "~~/components/nillion/RetrieveSecretCommand";
import SecretForm from "~~/components/nillion/SecretForm";
import { Address } from "~~/components/scaffold-eth";
import { getUserKeyFromSnap } from "~~/utils/nillion/getUserKeyFromSnap";
import { nillionConfig } from "~~/utils/nillion/nillionConfig";
import { createNillionWallet } from "~~/utils/nillion/nillionPayments";
import { retrieveSecretBlob } from "~~/utils/nillion/retrieveSecretBlob";
import { storeSecretsBlob } from "~~/utils/nillion/storeSecretsBlob";

const Home: NextPage = () => {
  const initCalled = useRef(false);
  const [result, setResult] = useState<any>();

  useEffect(function () {
    if (initCalled.current) return;

    async function go() {
      initCalled.current = true;
      const [vmClient, chainClient, chainWallet] = await connect();

      const secretName = "foo";
      const secrets = new Secrets();
      secrets.insert(secretName, Secret.new_non_zero_unsigned_integer("42"));
      const storeOperation = Operation.store_secrets(secrets);

      const storeQuote = await vmClient.request_price_quote(config.clusterId, storeOperation);

      console.log("quote: ", JSON.stringify(storeQuote));

      const storeReceipt = await pay(vmClient, chainClient, chainWallet, storeOperation);
      console.log("receipt: ", JSON.stringify(storeReceipt));

      const storeId = await vmClient.store_secrets(config.clusterId, secrets, undefined, storeReceipt);

      console.log("commit: ", storeId);

      const writeResult = {
        storeQuote,
        storeReceipt,
        storeId,
      };

      const retrieveOperation = Operation.retrieve_secret();
      const retrieveQuote = await vmClient.request_price_quote(config.clusterId, retrieveOperation);
      console.log("quote: ", JSON.stringify(retrieveQuote));

      const retrieveReceipt = await pay(vmClient, chainClient, chainWallet, retrieveOperation);
      console.log("receipt: ", JSON.stringify(retrieveReceipt));

      const secret = await vmClient.retrieve_secret(config.clusterId, storeId, secretName, retrieveReceipt);

      console.log("secret: ", secret.to_integer());

      const retrieveResult = {
        retrieveQuote,
        retrieveReceipt,
        secret: secret.to_integer(),
      };

      const result = {
        writeResult,
        retrieveResult,
      };

      setResult(result);
    }

    go().catch(console.error);
  }, []);

  if (!result) {
    return (
      <div>
        <h2>Loading ...</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>Nillion client loaded</h2>
      <p>{JSON.stringify(result)}</p>
    </div>
  );
};

export default Home;

export const config = {
  clusterId: "9e68173f-9c23-4acc-ba81-4f079b639964",
  bootnodes: ["/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS"],
  chain: {
    endpoint: "http://127.0.0.1:48102",
    keys: ["9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5"],
  },
  vm: {
    nodeKey: "nillion-testnet-seed-1",
  },
};

export async function connect(): Promise<[NillionClient, SigningStargateClient, DirectSecp256k1Wallet]> {
  await init();

  const userKey = UserKey.generate();
  const nodeKey = NodeKey.from_seed(config.vm.nodeKey);
  const nilVmClient = new NillionClient(userKey, nodeKey, config.bootnodes);
  const [nilChainClient, nilChainWallet] = await createNilChainClient();

  return [nilVmClient, nilChainClient, nilChainWallet];
}

export async function createNilChainClient(): Promise<[SigningStargateClient, DirectSecp256k1Wallet]> {
  const key = Uint8Array.from(config.chain.keys[0].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const wallet = await DirectSecp256k1Wallet.fromKey(key, "nillion");

  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options = {
    registry,
    gasPrice: GasPrice.fromString("25unil"),
    gasAdjustment: 1.3,
    autoGas: true,
  };

  const client = await SigningStargateClient.connectWithSigner(config.chain.endpoint, wallet, options);

  return [client, wallet];
}

export async function pay(
  vmClient: NillionClient,
  chainClient: SigningStargateClient,
  chainWallet: DirectSecp256k1Wallet,
  operation: Operation,
): Promise<PaymentReceipt> {
  const quote = await vmClient.request_price_quote(config.clusterId, operation);

  const denom = "unil";
  const [account] = await chainWallet.getAccounts();
  const from = account.address;

  const payload: MsgPayFor = {
    fromAddress: from,
    resource: quote.nonce,
    amount: [{ denom, amount: quote.cost.total }],
  };

  const result = await chainClient.signAndBroadcast(from, [{ typeUrl, value: payload }], "auto");

  return new PaymentReceipt(quote, result.transactionHash);
}
