import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { NillionClient, NillionClientJSBrowser } from "~~/types/nillion";
import { getUserKeyFromSnap } from "~~/utils/nillion";

export default function useNillionSnapClient() {
  const { address: connectedAddress } = useAccount();
  const [connectedToSnap, setConnectedToSnap] = useState<boolean>(false);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nillion, setNillion] = useState<NillionClientJSBrowser | null>(null);
  const [nillionClient, setNillionClient] = useState<NillionClient | null>(null);

  async function handleConnectToSnap() {
    const snapResponse = await getUserKeyFromSnap();
    setUserKey(snapResponse?.user_key || null);
    setConnectedToSnap(snapResponse?.connectedToSnap || false);
  }

  useEffect(() => {
    if (userKey) {
      const getNillionClientLibrary = async () => {
        const nillionClientUtil = await import("~~/utils/nillion/nillionClient");
        const libraries = await nillionClientUtil.getNillionClient(userKey);
        setNillion(libraries.nillion);
        setNillionClient(libraries.nillionClient);
        return libraries.nillionClient;
      };

      getNillionClientLibrary().then(nillionClient => {
        const user_id = nillionClient.user_id;
        setUserId(user_id);
      });
    }
  }, [userKey]);

  const resetNillion = () => {
    setConnectedToSnap(false);
    setUserKey(null);
    setUserId(null);
    setNillion(null);
    setNillionClient(null);
  };

  useEffect(() => {
    if (connectedAddress) {
      handleConnectToSnap();
    } else {
      resetNillion();
    }
  }, [connectedAddress]);

  return {
    connectedToSnap,
    userKey,
    userId,
    nillion,
    nillionClient,
    handleConnectToSnap,
    resetNillion,
  };
}
