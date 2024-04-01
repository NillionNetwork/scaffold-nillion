import { nillionConfig } from "./nillionConfig";

export async function retrieveSecretBlob(nillionClient: any, store_id: string, secret_name: string): Promise<string> {
  try {
    // retrieves SecretBlob from client
    const retrieved = await nillionClient.retrieve_secret(nillionConfig.cluster_id, store_id, secret_name);

    // gets byte array value
    const byteArraySecret = retrieved.to_byte_array();

    // decodes byte array to string
    const decodedValue = new TextDecoder("utf-8").decode(byteArraySecret);

    return decodedValue;
  } catch (error: any) {
    return error;
  }
}
