import { nillionConfig } from "./nillionConfig";

interface JsInput {
  name: string;
  value: string;
}

export async function storeSecretsInteger(
  nillion: any,
  nillionClient: any,
  secretsToStore: JsInput[],
  program_id: string,
  party_name: string,
  usersWithRetrievePermissions: string[] = [],
  usersWithUpdatePermissions: string[] = [],
  usersWithDeletePermissions: string[] = [],
  usersWithComputePermissions: string[] = [],
): Promise<string> {
  try {
    // create secrets object
    const secrets = new nillion.Secrets();

    // iterate through secretsToStore, inserting each into the secrets object
    for (const secret of secretsToStore) {
      // create new SecretInteger with value cast to string
      const newSecret = nillion.Secret.new_integer(secret.value.toString());

      // insert the SecretInteger into secrets object
      secrets.insert(secret.name, newSecret);
    }

    // create program bindings for secret so it can be used in a specific program
    const secret_program_bindings = new nillion.ProgramBindings(program_id);

    // set the input party to the bindings to specify which party will provide the secret
    const party_id = nillionClient.party_id;
    secret_program_bindings.add_input_party(party_name, party_id);
    console.log("bindings, party_name:", party_name, "party_id", party_id);

    // get user id for user storing the secret
    const user_id = nillionClient.user_id;

    // create a permissions object, give the storer default permissions, including compute permissions with the program id
    const permissions = nillion.Permissions.default_for_user(user_id, program_id);

    // iterate through usersWithComputePermissions to give these user ids compute permissions for the program
    const computePermissions: { [key: string]: string[] } = {};
    // give any other users compute permissions
    for (const user of usersWithComputePermissions) {
      computePermissions[user] = [program_id];
    }

    // add compute permissions to the permissions object
    permissions.add_compute_permissions(computePermissions);
    console.log("user ids given compute permissions:", Object.keys(computePermissions));

    // add retrieve permissions to the permissions object
    permissions.add_retrieve_permissions(usersWithRetrievePermissions);
    console.log("user ids given retrieve permissions:", usersWithRetrievePermissions);

    // add update permissions to the permissions object
    permissions.add_update_permissions(usersWithUpdatePermissions);
    console.log("user ids given update permissions:", usersWithUpdatePermissions);

    // add delete permissions to the permissions object
    permissions.add_delete_permissions(usersWithDeletePermissions);
    console.log("user ids given delete permissions:", usersWithDeletePermissions);

    // store secret(s) with bindings and permissions
    const store_id = await nillionClient.store_secrets(
      nillionConfig.cluster_id,
      secrets,
      secret_program_bindings,
      permissions,
    );
    return store_id;
  } catch (error) {
    console.log(error);
    return "error";
  }
}
