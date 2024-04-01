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
    const party_id = await nillionClient.party_id();
    secret_program_bindings.add_input_party(party_name, party_id);
    console.log("bindings, party_name:", party_name, "party_id", party_id);

    // store secret(s)
    const store_id = await nillionClient.store_secrets(nillionConfig.cluster_id, secrets, secret_program_bindings);
    return store_id;
  } catch (error) {
    return "error";
  }
}
