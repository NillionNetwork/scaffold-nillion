import { nillionConfig } from "./nillionConfig";

interface JsInput {
  name: string;
  value: string;
}

export async function storeSecretsBlob(
  nillion: any,
  nillionClient: any,
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

    // you cannot compute with SecretBlobs, so they don't need bindings to any programs
    const empty_blob_bindings = null;

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
      nillionConfig.cluster_id,
      secrets,
      empty_blob_bindings,
      permissions,
    );
    return store_id;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
