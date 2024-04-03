import { nillionConfig } from "./nillionConfig";

export async function storeProgram(nillionClient: any, programName: string): Promise<string> {
  try {
    // put any compiled nada program in the public folder of this repo `packages/nextjs/public/programs`
    const compiledProgram = await fetch(`/programs/${programName}.nada.bin`);

    // transform the nada.bin into Uint8Array
    const arrayBufferProgram = await compiledProgram.arrayBuffer();
    const uint8Program = new Uint8Array(arrayBufferProgram);

    // store program
    console.log("storing program", programName, uint8Program);
    const action_id = await nillionClient.store_program(nillionConfig.cluster_id, programName, uint8Program);
    console.log("Stored program - action_id", action_id);

    // return the program id
    const userId = nillionClient.user_id;
    const program_id = `${userId}/${programName}`;
    return program_id;
  } catch (error: any) {
    console.log(error);
    return "error";
  }
}
