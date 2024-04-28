"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CopyString } from "~~/components/nillion/CopyString";
import { NillionOnboarding } from "~~/components/nillion/NillionOnboarding";
import RetrieveSecretCommand from "~~/components/nillion/RetrieveSecretCommand";
import SecretForm from "~~/components/nillion/SecretForm";
import { Address } from "~~/components/scaffold-eth";
import useNillionSnapClient from "~~/hooks/useNillionSnapClient";
import { retrieveSecretBlob } from "~~/utils/nillion/retrieveSecretBlob";
import { storeSecretsBlob } from "~~/utils/nillion/storeSecretsBlob";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [storedSecretName, setStoredSecretName] = useState<string>("my_blob");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);

  const { userKey, nillionClient, handleConnectToSnap, connectedToSnap, userId, nillion, resetNillion } =
    useNillionSnapClient();

  // ✅ #3 DONE: complete this asynchronous function to process the submission of a form used for storing secrets
  // Once this is done, the form will be hooked up to store your secret blob
  async function handleSecretFormSubmit(
    secretName: string,
    secretValue: string,
    permissionedUserIdForRetrieveSecret: string | null,
    permissionedUserIdForUpdateSecret: string | null,
    permissionedUserIdForDeleteSecret: string | null,
  ) {
    // call storeSecretsBlob, then handle the promise that resolves with a store_id
    await storeSecretsBlob(
      nillion,
      nillionClient,
      [{ name: secretName, value: secretValue }],
      permissionedUserIdForRetrieveSecret ? [permissionedUserIdForRetrieveSecret] : [],
      permissionedUserIdForUpdateSecret ? [permissionedUserIdForUpdateSecret] : [],
      permissionedUserIdForDeleteSecret ? [permissionedUserIdForDeleteSecret] : [],
    ).then((store_id: string) => {
      // inside of the "then" method, console log the store_id
      console.log("Secret stored at store_id:", store_id);
      // update state: set storedSecretName
      setStoredSecretName(secretName);
      // update state: set storeId
      setStoreId(store_id);
    });
  }

  // ✅ #4 DONE: complete this asynchronous function to retrieve and read the value of a secret blob
  // Once this is done, you can retrieve the stored message from Nillion
  async function handleRetrieveSecretBlob(store_id: string, secret_name: string) {
    // call retrieveSecretBlob then handle the promise that resolves with the retrieved value
    // update state: set retrievedValue
    await retrieveSecretBlob(nillionClient, store_id, secret_name).then(setRetrievedValue);
  }

  // reset store blob form to store a new secret
  const resetForm = () => {
    setStoreId(null);
    setRetrievedValue(null);
  };

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5 flex flex-col">
          <h1 className="text-xl">
            <span className="block text-4xl font-bold text-center">
              Store and Retrieve &quot;Hello World&quot; with Nillion: ✅ Completed version
            </span>

            <p className="text-center text-lg">
              This is the completed version of hello-world, hooked up to store and retrieve SecretBlob secrets in
              Nillion.
            </p>

            <p className="text-center text-lg">
              Check out this completed code in{" "}
              <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                packages/nextjs/app/nillion-hello-world-complete/page.tsx
              </code>
            </p>

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
            {!userKey ? (
              <NillionOnboarding />
            ) : (
              <div className="flex flex-row justify-between">
                {/* Store secret blob */}
                <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full rounded-3xl my-2 justify-between mx-5">
                  <h1 className="text-xl">Store &quot;Hello World&quot; as a SecretBlob in Nillion</h1>
                  <div className="flex flex-row w-full justify-between items-center my-10 mx-10">
                    <div className="flex-1 px-2">
                      {!!storeId ? (
                        <>
                          <RetrieveSecretCommand
                            secretType="SecretBlob"
                            userKey={userKey}
                            storeId={storeId}
                            secretName={storedSecretName}
                          />
                          <button className="btn btn-sm btn-primary mt-4" onClick={resetForm}>
                            Reset
                          </button>
                        </>
                      ) : (
                        <SecretForm
                          secretName={storedSecretName}
                          onSubmit={handleSecretFormSubmit}
                          secretType="text"
                          isLoading={false}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Retrieve secret blob */}

                <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full rounded-3xl my-2 justify-between mx-5">
                  <h1 className="text-xl">Retrieve and decode SecretBlob from Nillion</h1>
                  <div className="flex flex-row w-full justify-between items-center my-10 mx-10">
                    <div className="flex-1 px-2" key={storedSecretName}>
                      <button
                        className="btn btn-sm btn-primary mt-4"
                        onClick={() => handleRetrieveSecretBlob(storeId || "", storedSecretName)}
                        disabled={!storeId}
                      >
                        Retrieve and decode {storedSecretName}
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
