import { nillionConfig } from "./nillionConfig";

export async function retrieveSecretInteger(
  nillionClient: any,
  store_id: string,
  secret_name: string,
): Promise<string> {
  try {
    const retrieved = await nillionClient.retrieve_secret(nillionConfig.cluster_id, store_id, secret_name);
    return retrieved.to_integer();
  } catch (error: any) {
    return error;
  }
}
