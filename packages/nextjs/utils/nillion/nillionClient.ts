import { nillionConfig } from "./nillionConfig";
import * as nillion from "@nillion/client";

export const initializeNillionClient = (userkey: any, nodekey: any, websockets: string[]): nillion.NillionClient =>
  new nillion.NillionClient(userkey, nodekey, websockets);

export const getNillionClient = async (userKey: string) => {
  await nillion.default();
  const nillionUserKey = nillion.UserKey.from_base58(userKey);
  // temporary fix for an issue where nodekey cannot be reused between calls
  const wl = process.env.NEXT_PUBLIC_NILLION_NODEKEY_ALLOWLISTED_SEED
    ? process.env.NEXT_PUBLIC_NILLION_NODEKEY_ALLOWLISTED_SEED.split(", ")
    : [`scaffold-eth-${Math.floor(Math.random() * 10000)}`];
  const randomElement = wl[Math.floor(Math.random() * wl.length)];
  const nodeKey = nillion.NodeKey.from_seed(randomElement);

  const client = initializeNillionClient(nillionUserKey, nodeKey, nillionConfig.websockets as string[]);
  return {
    nillion,
    nillionClient: client,
  };
};
