interface UserKeyFromSnapResponse {
  user_key: string | null;
  connectedToSnap: boolean;
  message: any;
}

export async function getUserKeyFromSnap(): Promise<UserKeyFromSnapResponse | undefined> {
  const nillionSnapId = "npm:nillion-user-key-manager";
  if (window.ethereum) {
    try {
      // Request permission to connect to the Snap.
      await window.ethereum.request({
        // @ts-ignore
        method: "wallet_requestSnaps",
        params: {
          // @ts-ignore
          [nillionSnapId]: {},
        },
      });

      // Invoke the 'read_user_key' method of the Snap
      const response: { user_key: string } | undefined = await window?.ethereum?.request({
        // @ts-ignore
        method: "wallet_invokeSnap",
        params: {
          // @ts-ignore
          snapId: nillionSnapId,
          request: { method: "read_user_key" },
        },
      });

      return {
        user_key: response?.user_key || null,
        connectedToSnap: true,
        message: "",
      };
    } catch (error) {
      console.error("Error interacting with Snap:", error);
      return {
        user_key: null,
        connectedToSnap: false,
        message: error,
      };
    }
  }
}
