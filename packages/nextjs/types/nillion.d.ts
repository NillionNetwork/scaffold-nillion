export type Chain = {
  chainId: string;
  chainName: string;
  iconUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

export type Config = {
  cluster_id: string;
  bootnodes: string[];
  payments_config: {
    rpc_endpoint: string;
    signer: {
      wallet: {
        chain_id: number;
        private_key: string | null;
      };
    };
    smart_contract_addresses: {
      blinding_factors_manager: string;
      payments: string;
    };
  };
};

export type ChainConfig = {
  chainId: string;
  chainName: string;
  iconUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

export type PartyKitConfig = {
  client: Nillion.Config;
  chain: Nillion.ChainConfig;
};

export type BookEntry = {
  handle: string;
  partyid: string;
  codepartyid: string;
};

export type PhoneBook = { [key: string]: BookEntry };

export type CodePartyBinding = {
  owner: string;
  handle: string;
  ownercodepartyid: string;
  owneruserid: string;
  partyid: string;
  programid: string;
  partyname: string | null;
  output: string | null;
  inputs: NadaInputs[] | null;
};

export type CodePartyBindings = {
  [key: string]: CodePartyBinding;
};

export type ComputeResult = CodePartyResult & {
  result: string;
};

export type ComputeResultNodeTask = {
  ownercodepartyid: string;
  resultid: string;
  programid: string;
};

export type CodePartyContributions = {
  [key: string]: CodePartyContrib;
};

export type CodePartyContrib = {
  ownercodepartyid: string;
  handle: string;
  storeid: string[] | null;
  status: string;
  programid: string;
};

export type CodePartyResult = {
  owner: string;
  ownercodepartyid: string;
  programid: string;
  targetcodepartyid: string;
  resultid: string;
  resultname: string;
};

export type NadaInputs = {
  type: string;
  name: string;
};

export type NadaExtracts = {
  partyname: string;
  inputs: NadaInputs[];
  output: string | null;
};

export type ProgramExtracts = {
  [key: string]: NadaExtracts;
};

export type CodePartyQueue = CodePartyBinding;

export type Baseline = {
  chain: Chain;
  config: Config;
  peers: PhoneBook;
};

export type CodePartyStart = {
  peers: CodePartyBindings;
  programid: string;
};

export type Envelope = {
  type: string;
  payload:
  | Baseline
  | BookEntry
  | CodePartyStart
  | ContribTask
  | ResultAction
  | CodePartyBinding
  | CodePartyResult
  | CodePartyContrib;
};

export type DefaultAction = { type: "PeerEntered" } | { type: "PeerExit" };
export type RegisterAction = { type: "register"; payload: BookEntry };

export type CodePartyStartAction = {
  type: "codeparty-start";
  payload: CodePartyStart;
};
export type ContribTask = { type: "codeparty-task"; payload: CodePartyBinding };
export type ContribAction = {
  type: "codeparty-contrib";
  payload: CodePartyContrib;
};
export type ResultAction = {
  type: "codeparty-result";
  payload: CodePartyResult;
};

// an Action is something the partykit server will process
export type Action =
  | DefaultAction
  | RegisterAction
  | CodePartyStartAction
  | ContribAction
  | ResultAction;
