import { nillionConfig } from "./nillionConfig";

export async function retrieveSecretBlob(
  nillion: any,
  nillionClient: any,
  store_id: string,
  secret_name: string,
): Promise<string> {
  try {
    const retrieved = await nillionClient.retrieve_secret(nillionConfig.cluster_id, store_id, secret_name);
    const decodedByteArray = await nillion.decode_bytearray_secret(retrieved);
    const decodeToString = new TextDecoder("utf-8").decode(decodedByteArray);
    return decodeToString;
  } catch (error: any) {
    return error;
  }
}
