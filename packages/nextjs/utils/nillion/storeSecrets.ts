import { nillionConfig } from "./nillionConfig";
import { NillionClient, NillionClientJSBrowser, SecretInputType } from "~~/types/nillion";

export type SecretToStore = {
  name: string;
  value: string;
  type: SecretInputType;
};

export type StoreSecretsParams = {
  nillion: NillionClientJSBrowser;
  nillionClient: NillionClient;
  secretsToStore: SecretToStore[];
  programId?: string;
  partyName?: string;
  usersWithRetrievePermissions?: string[];
  usersWithUpdatePermissions?: string[];
  usersWithDeletePermissions?: string[];
  usersWithComputePermissions?: string[];
};

export const ComputableSecretTypes = [SecretInputType.UNSIGNED_INTEGER, SecretInputType.INTEGER];

export async function storeSecrets({
  nillion,
  nillionClient,
  secretsToStore,
  programId,
  partyName,
  usersWithRetrievePermissions = [],
  usersWithUpdatePermissions = [],
  usersWithDeletePermissions = [],
  usersWithComputePermissions = [],
}: StoreSecretsParams): Promise<string> {
  const secretEncoder: {
    [key in SecretInputType]: (secretValue: string) => InstanceType<NillionClientJSBrowser["Secret"]>;
  } = {
    [SecretInputType.BLOB]: secretValue => {
      const byteArraySecret = new TextEncoder().encode(secretValue);
      return nillion.Secret.new_blob(byteArraySecret);
    },
    [SecretInputType.INTEGER]: secretValue => nillion.Secret.new_integer(secretValue),
    [SecretInputType.UNSIGNED_INTEGER]: secretValue => nillion.Secret.new_unsigned_integer(secretValue),
  };

  try {
    // create secrets object
    const secrets = new nillion.Secrets();

    // iterate through secretsToStore, inserting each into the secrets object
    for (const secret of secretsToStore) {
      // create new SecretInteger with value cast to string
      const newSecret = secretEncoder[secret.type](secret.value);

      // insert the SecretInteger into secrets object
      secrets.insert(secret.name, newSecret);
    }

    const hasComputableSecrets = secretsToStore.some(s => ComputableSecretTypes.includes(s.type));

    let secret_program_bindings: InstanceType<NillionClientJSBrowser["ProgramBindings"]> | undefined = undefined;

    if (hasComputableSecrets && programId && partyName) {
      // create program bindings for secret so it can be used in a specific program
      secret_program_bindings = new nillion.ProgramBindings(programId);
      // set the input party to the bindings to specify which party will provide the secret
      const partyId = nillionClient.party_id;
      secret_program_bindings.add_input_party(partyName, partyId);
      console.log("bindings, party_name:", partyName, "party_id", partyId);
    }

    // get user id for user storing the secret
    const user_id = nillionClient.user_id;

    // create a permissions object, give the storer default permissions, including compute permissions with the program id
    const permissions = nillion.Permissions.default_for_user(user_id, programId);

    if (hasComputableSecrets && programId) {
      // iterate through usersWithComputePermissions to give these user ids compute permissions for the program
      const computePermissions: { [key: string]: string[] } = {};
      // give any other users compute permissions
      for (const user of usersWithComputePermissions) {
        computePermissions[user] = [programId];
      }

      // add compute permissions to the permissions object
      permissions.add_compute_permissions(computePermissions);
      console.log("user ids given compute permissions:", Object.keys(computePermissions));
    }

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
    return nillionClient.store_secrets(nillionConfig.cluster_id, secrets, secret_program_bindings, permissions);
  } catch (error) {
    console.log(error);
    return "error";
  }
}
