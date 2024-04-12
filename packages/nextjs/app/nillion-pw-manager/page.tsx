"use client";

import { useEffect, useState } from "react";
import type * as NillionTypes from "@nillion/nillion-client-js-browser/nillion_client_js_browser.d.ts";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CopyString } from "~~/components/nillion/CopyString";
import Dropdown from "~~/components/nillion/Dropdown";
import { NillionOnboarding } from "~~/components/nillion/NillionOnboarding";
import RetrieveSecretCommand from "~~/components/nillion/RetrieveSecretCommand";
import SecretForm from "~~/components/nillion/SecretForm";
import { Address } from "~~/components/scaffold-eth";
import { getUserKeyFromSnap } from "~~/utils/nillion/getUserKeyFromSnap";
import { retrieveSecretBlob } from "~~/utils/nillion/retrieveSecretBlob";
import { storeSecretsBlob } from "~~/utils/nillion/storeSecretsBlob";

interface StoredSecrets {
  [secretName: string]: string; // store_id
}
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [connectedToSnap, setConnectedToSnap] = useState<boolean>(false);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nillion, setNillion] = useState<any>(null);
  const [nillionClient, setNillionClient] = useState<any>(null);
  const [selectedSecretName, setSelectedSecretName] = useState<string>("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [latestSecretName, setLatestSecretName] = useState<string | null>(null);
  const [storedSecrets, setStoredSecrets] = useState<StoredSecrets>({});
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);

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

  async function handleSecretFormSubmit(
    secretName: string,
    secretValue: string,
    permissionedUserIdForRetrieveSecret: string | null,
    permissionedUserIdForUpdateSecret: string | null,
    permissionedUserIdForDeleteSecret: string | null,
  ) {
    await storeSecretsBlob(
      nillion,
      nillionClient,
      [{ name: secretName, value: secretValue }],
      permissionedUserIdForRetrieveSecret ? [permissionedUserIdForRetrieveSecret] : [],
      permissionedUserIdForUpdateSecret ? [permissionedUserIdForUpdateSecret] : [],
      permissionedUserIdForDeleteSecret ? [permissionedUserIdForDeleteSecret] : [],
    ).then((store_id: string) => {
      setStoredSecrets(prevSecrets => ({
        ...prevSecrets,
        [secretName]: store_id,
      }));

      setLatestSecretName(secretName);
    });
  }

  async function handleRetrieveSecretBlob(store_id: string, secret_name: string) {
    await retrieveSecretBlob(nillionClient, store_id, secret_name).then(setRetrievedValue);
  }

  const handleSecretDropdownSelection = (secretName: string) => {
    setSelectedSecretName(secretName);
    setSelectedStoreId(storedSecrets[secretName]);
  };

  const resetNillion = () => {
    setConnectedToSnap(false);
    setUserKey(null);
    setUserId(null);
    setNillion(null);
    setNillionClient(null);
  };

  const resetForm = () => {
    setLatestSecretName(null);
    setRetrievedValue(null);
  };

  useEffect(() => {
    if (!connectedAddress) {
      resetNillion();
    }
  }, [connectedAddress]);

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5 flex flex-col">
          <h1 className="text-xl">
            <span className="block text-4xl font-bold text-center">Nillion Password Manager</span>

            {!connectedAddress && <p>Connect your MetaMask Flask wallet</p>}
            {connectedAddress && connectedToSnap && !userKey && (
              <a target="_blank" href="https://nillion-snap-site.vercel.app/" rel="noopener noreferrer">
                <button className="btn btn-sm btn-primary mt-4">
                  No Nillion User Key - Generate and store user key here
                </button>
              </a>
            )}
          </h1>

          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2">
              <p className="my-2 font-medium">Connected Wallet Address:</p>
              <Address address={connectedAddress} />
            </div>
          )}

          {connectedAddress && !connectedToSnap && (
            <button className="btn btn-sm btn-primary mt-4" onClick={handleConnectToSnap}>
              Connect to Snap with your Nillion User Key
            </button>
          )}

          {connectedToSnap && (
            <div>
              {userKey && (
                <div>
                  <div className="flex justify-center items-center space-x-2">
                    <p className="my-2 font-medium">
                      🤫 Nillion User Key from{" "}
                      <a target="_blank" href="https://nillion-snap-site.vercel.app/" rel="noopener noreferrer">
                        MetaMask Flask
                      </a>
                      :
                    </p>

                    <CopyString str={userKey} />
                  </div>

                  {userId && (
                    <div className="flex justify-center items-center space-x-2">
                      <p className="my-2 font-medium">Connected as Nillion User ID:</p>
                      <CopyString str={userId} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            {!connectedToSnap ? (
              <NillionOnboarding />
            ) : (
              <div className="flex flex-row justify-between">
                {/* Store secret blob */}
                <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full rounded-3xl my-2 justify-between mx-5">
                  <h1 className="text-xl">Store a new password</h1>
                  <div className="flex flex-row w-full justify-between items-center my-10 mx-10">
                    <div className="flex-1 px-2">
                      {latestSecretName ? (
                        <>
                          <RetrieveSecretCommand
                            secretType="SecretBlob"
                            userKey={userKey}
                            storeId={storedSecrets[latestSecretName]}
                            secretName={latestSecretName || ""}
                          />
                          <button className="btn btn-sm btn-primary mt-4" onClick={resetForm}>
                            Add another password
                          </button>
                        </>
                      ) : (
                        <SecretForm
                          secretName={""}
                          onSubmit={handleSecretFormSubmit}
                          secretType="text"
                          isLoading={false}
                          // use customSecretName boolean prop to signal that the form should set the secret name
                          customSecretName
                          hidePermissions
                          itemName="password"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Retrieve secret blob */}

                <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full rounded-3xl my-2 justify-between mx-5">
                  <h1 className="text-xl">Retrieve passwords from Nillion</h1>
                  <div className="flex flex-row w-full justify-between items-center my-10 mx-10">
                    <div className="flex-1 px-2 flex-col">
                      <div>
                        <Dropdown
                          options={Object.keys(storedSecrets).map(s => ({ value: s, label: s }))}
                          onDropdownUpdate={selectedName => handleSecretDropdownSelection(selectedName)}
                          itemName="a password"
                          disabled={Object.keys(storedSecrets).length === 0}
                        />
                      </div>

                      <button
                        className="btn btn-sm btn-primary mt-4"
                        onClick={() => handleRetrieveSecretBlob(selectedStoreId || "", selectedSecretName)}
                        disabled={!selectedStoreId}
                      >
                        Retrieve and decode {selectedSecretName}
                      </button>

                      {retrievedValue && <p>✅ Retrieved value: {retrievedValue}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
