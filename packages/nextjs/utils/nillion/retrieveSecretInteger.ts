import { nillionConfig } from "./nillionConfig";

export async function retrieveSecretInteger(
  nillion: any,
  nillionClient: any,
  store_id: string,
  secret_name: string,
): Promise<string> {
  try {
    const retrieved = await nillionClient.retrieve_secret(nillionConfig.cluster_id, store_id, secret_name);
    console.log(retrieved);
    // TODO - needs decode bigint function
    return "";
  } catch (error: any) {
    return error;
  }
}
