import { nillionConfig } from "./nillionConfig";

interface JsInput {
  name: string;
  value: string;
}

export async function storeSecretsBlob(nillion: any, nillionClient: any, secretsToStore: JsInput[]): Promise<string> {
  try {
    // create secrets object
    const secrets = new nillion.Secrets();

    // iterate through secretsToStore, inserting each into the secrets object
    for (const secret of secretsToStore) {
      // encodes secret as a byteArray
      const byteArraySecret = new TextEncoder().encode(secret.value);

      // create new SecretBlob with encoded secret
      const newSecret = nillion.Secret.new_blob(byteArraySecret);

      // insert the secret into secrets object
      secrets.insert(secret.name, newSecret);
    }

    // store secrets
    const store_id = await nillionClient.store_secrets(nillionConfig.cluster_id, secrets);
    return store_id;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
