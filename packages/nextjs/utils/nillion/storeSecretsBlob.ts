import { nillionConfig } from "./nillionConfig";
import { pay } from "./nillionPayments";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { NillionClient, Operation, PaymentReceipt } from "@nillion/client";

interface JsInput {
  name: string;
  value: string;
}

export async function storeSecretsBlob(
  nillion: any,
  nillionClient: NillionClient,
  nilChainClient: SigningStargateClient,
  appWallet: DirectSecp256k1Wallet,
  secretsToStore: JsInput[],
  usersWithRetrievePermissions: string[] = [],
  usersWithUpdatePermissions: string[] = [],
  usersWithDeletePermissions: string[] = [],
): Promise<string> {
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

    console.log(secrets);
    const receipt = await pay(
      nillion,
      nillionClient,
      nilChainClient,
      appWallet,
      nillion.Operation.store_secrets(secrets),
    );
    console.log(receipt);

    // get user id for user storing the secret
    const user_id = nillionClient.user_id;

    // create a permissions object, give the storer default perissions
    const permissions = nillion.Permissions.default_for_user(user_id);

    // add retrieve permissions to the permissions object
    permissions.add_retrieve_permissions(usersWithRetrievePermissions);
    console.log("user ids given retrieve permissions:", usersWithRetrievePermissions);

    // add update permissions to the permissions object
    permissions.add_update_permissions(usersWithUpdatePermissions);
    console.log("user ids given update permissions:", usersWithUpdatePermissions);

    // add delete permissions to the permissions object
    permissions.add_delete_permissions(usersWithDeletePermissions);
    console.log("user ids given delete permissions:", usersWithDeletePermissions);

    // store secrets with permissions
    const store_id = await nillionClient.store_secrets(
      nillionConfig.cluster_id as string,
      secrets,
      permissions,
      receipt,
    );
    return store_id;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
