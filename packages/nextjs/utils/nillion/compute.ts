import { nillionConfig } from "./nillionConfig";

interface JsInput {
  name: string;
  value: string;
}

export async function compute(
  nillion: any,
  nillionClient: any,
  store_ids: (string | null)[],
  program_id: string,
  outputName: string,
  computeTimeSecrets: JsInput[] = [],
  publicVariables: JsInput[] = [],
): Promise<string> {
  try {
    // create program bindings with the program id
    const program_bindings = new nillion.ProgramBindings(program_id);

    // add input and output party details (name and party id) to program bindings
    const partyName = "Party1";
    const party_id = nillionClient.party_id;
    program_bindings.add_input_party(partyName, party_id);
    program_bindings.add_output_party(partyName, party_id);

    console.log("program_bindings", program_bindings);
    console.log("party_id", party_id);
    console.log("store_ids", store_ids);

    // create a compute time secrets object
    const compute_time_secrets = new nillion.Secrets();

    // iterate through computeTimeSecrets, inserting each into the compute_time_secrets object
    for (const compute_secret of computeTimeSecrets) {
      const newComputeTimeSecret = nillion.Secret.new_integer(compute_secret.value.toString());
      compute_time_secrets.insert(compute_secret.name, newComputeTimeSecret);
    }

    // create a public variables object
    const public_variables = new nillion.PublicVariables();

    // iterate through computeTimeSecrets, inserting each into the compute_time_secrets object
    for (const public_variable of publicVariables) {
      const newPublicVariable = nillion.Secret.new_integer(public_variable.value.toString());
      compute_time_secrets.insert(public_variable.name, newPublicVariable);
    }

    // compute
    const compute_result_uuid = await nillionClient.compute(
      nillionConfig.cluster_id,
      program_bindings,
      store_ids,
      compute_time_secrets,
      public_variables,
    );

    const compute_result = await nillionClient.compute_result(compute_result_uuid);
    const result = compute_result[outputName].toString();
    return result;
  } catch (error: any) {
    console.log("error", error);
    return "error";
  }
}
