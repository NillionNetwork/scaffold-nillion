import { nillionConfig } from "./nillionConfig";

export async function storeSecretsBlob(
  nillion: any,
  nillionClient: any,
  secretValue: string,
  secretName: string,
): Promise<string> {
  try {
    // create secrets object
    const secrets = new nillion.Secrets();

    // encode secret blob for storage
    const encoder = new TextEncoder();
    const encoded = await nillion.encode_blob_secret(secretName, {
      bytes: encoder.encode(secretValue),
    });

    // insert encoded blob(s) into secrets object
    await secrets.insert(encoded);

    // store secrets
    const store_id = await nillionClient.store_secrets(nillionConfig.cluster_id, secrets);
    return store_id;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
