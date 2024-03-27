import { nillionConfig } from "./nillionConfig";

const bigIntFromByteArray = (byteArray: Uint8Array) => {
  let hexString = "0x";
  for (let i = byteArray.length - 1; i >= 0; i--) {
    hexString += byteArray[i].toString(16).padStart(2, "0");
  }
  return BigInt(hexString);
};

export async function compute(
  nillion: any,
  nillionClient: any,
  store_ids: (string | null)[],
  program_id: string,
): Promise<string> {
  try {
    // create program bindings with the program id
    const program_bindings = new nillion.ProgramBindings(program_id);

    // add input and output party details (name and party id) to program bindings
    const partyName = "Party1";
    const party_id = await nillionClient.party_id();
    program_bindings.add_input_party(partyName, party_id);
    program_bindings.add_output_party(partyName, party_id);

    console.log(program_bindings);
    console.log(party_id);

    console.log(store_ids);

    // all secrets were stored ahead of time, so there
    // are no compute time secrets used in this computation
    // compute_time_secrets is an empty object of secrets
    const compute_time_secrets = new nillion.Secrets();
    console.log(compute_time_secrets);

    // compute
    const compute_result_uuid = await nillionClient.compute(
      nillionConfig.cluster_id,
      program_bindings,
      store_ids,
      compute_time_secrets,
    );

    const compute_result = await nillionClient.compute_result(compute_result_uuid);

    // transform bytearray to bigint and get compute result value
    const decoded_compute_result = bigIntFromByteArray(compute_result.value);
    return decoded_compute_result.toString();
  } catch (error: any) {
    console.log("error", error);
    return "error";
  }
}
