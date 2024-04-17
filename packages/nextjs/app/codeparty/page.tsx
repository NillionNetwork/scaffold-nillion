"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Code,
  Divider,
  Flex,
  Heading,
  Highlight,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Link as ChakraLink,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Progress,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Tr,
  useDisclosure,
  useSteps,
  useToast,
} from "@chakra-ui/react";
import { python } from "@codemirror/lang-python";
import { basicLight } from "@uiw/codemirror-theme-basic";
import { monokai } from "@uiw/codemirror-theme-monokai";
import CodeMirror from "@uiw/react-codemirror";
import type { NextPage } from "next";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { Web3 } from "web3";
import {
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { usePartyBackend } from "~~/hooks/nillion";
import * as NillionType from "~~/types/nillion";
import * as NillionClientTypes from "@nillion/nillion-client-js-browser/nillion_client_js_browser.d.js";

const backend = process.env.NEXT_PUBLIC_NILLION_BACKEND;

const mkObj = (key: string, value: string[]) =>
  Object.fromEntries([[key, value]]);
const partyResultsColor = (
  results: NillionType.CodePartyContributions,
  peer: string,
) => {
  if (!results || !(peer in results)) return "yellow";
  switch (results[peer].status) {
    case "ok":
      return "green";
    case "error":
      return "red";
    default:
      return "pink";
  }
};

const RainbowText = ({ text }: { text: string }) => {
  return (
    <Text
      sx={{
        fontSize: "90px", // Adjust the font size as needed
        fontWeight: "bold", // Optional: makes the gradient look better
        background:
          "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        MozBackgroundClip: "text",
        MozTextFillColor: "transparent",
        backgroundSize: "82% auto",
      }}
    >
      {text}
    </Text>
  );
};

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const seededRandom = (seedStr: string, min: number, max: number) => {
  let seed = hashString(seedStr);
  seed = (seed * 9301 + 49297) % 233280;
  const rnd = seed / 233280;
  return Math.floor(min + rnd * (max - min));
};

const Home: NextPage = () => {
  const {
    partyState,
    partyQueue,
    partyContrib,
    partyError,
    setProgramId,
    partyResultTask,
    programId,
    dispatch,
  } = usePartyBackend();
  const { isOpen: configIsOpen, onOpen: configOnOpen, onClose: configOnClose } =
    useDisclosure();
  const { isOpen: partyIsOpen, onOpen: partyOnOpen, onClose: partyOnClose } =
    useDisclosure();
  const {
    isOpen: contribFormIsOpen,
    onOpen: contribFormOnOpen,
    onClose: contribFormOnClose,
  } = useDisclosure();
  const {
    isOpen: partyResultIsOpen,
    onOpen: partyResultOnOpen,
    onClose: partyResultOnClose,
  } = useDisclosure();

  const [codePartyBindings, setCodePartyBindings] = useState<
    NillionType.CodePartyBindings | null
  >(null);

  const toast = useToast();
  const [computeResult, setComputeResult] = useState<
    NillionType.ComputeResult | null
  >(null);

  const [connectedToSnap, setConnectedToSnap] = useState<boolean>(false);
  const [isFunded, setIsFunded] = useState<string | null>(null);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [codeName, setCodeName] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [contribError, setContribError] = useState<string | null>(null);
  const [contribButtonBusy, setContribButtonBusy] = useState<
    boolean | undefined
  >(undefined);
  const [partyButtonBusy, setPartyButtonBusy] = useState<boolean | undefined>(
    undefined,
  );

  // this holds the configuration subset so that we can message
  // the peer with a compute task
  // { "marine-brown-jackal": "input1" }
  const [selectedPeers, setSelectedPeers] = useState<{ [key: string]: string }>(
    {},
  );

  const [nadalang, setNadalang] = useState<string>(`
from nada_dsl import *
def nada_main():
    party1 = Party(name="Party1")
    party2 = Party(name="Party2")
    my_int1 = SecretInteger(Input(name="my_int1", party=party1))
    my_int2 = SecretInteger(Input(name="my_int2", party=party2))
    my_int3 = SecretInteger(Input(name="my_int3", party=party2))
    x = my_int1 * my_int2 + my_int3
    output = x.reveal() * Integer(3)
    return [Output(output, "my_output", party1)]
`);

  const [myContrib, setMyContrib] = useState<number[]>([]);
  const [client, setClient] = useState<NillionClientTypes.NillionClient | null>(
    null,
  );
  const [nillion, setNillion] = useState(null);
  const [mmAddress, setMmAddress] = useState<string | null>(null);
  const [dynAddress, setDynAddress] = useState<string | null>(null);
  const [nadaParsed, setNadaParsed] = useState<
    NillionType.ProgramExtracts | null
  >(null);

  const onAssignPeerBindings = async () => {
    setCodeError(null);
    setPartyButtonBusy(true);
    try {
      const bindingInit: NillionType.CodePartyBindings = Object.keys(
        selectedPeers,
      ).reduce(
        (acc: NillionType.CodePartyBindings, p: string) => {
          acc[partyState.peers[p].codepartyid] = {
            owner: codeName,
            handle: partyState.peers[p].handle,
            ownercodepartyid: partyState.peers[codeName].codepartyid,
            owneruserid: client.user_id,
            partyid: partyState.peers[p].partyid,
            programid: programId,
            ...nadaParsed[selectedPeers[p]],
          };
          return acc;
        },
        {},
      );

      dispatch({
        type: "codeparty-start",
        payload: {
          peers: bindingInit,
          programid: programId,
        },
      });
      setActiveStep(2);
      setCodePartyBindings(bindingInit);
    } catch (error) {
      console.error("Error posting program: ", error);
      setCodeError(`server error: ${error}`);
    } finally {
      setPartyButtonBusy(undefined);
    }
  };

  const onSubmitCode = async () => {
    setCodeError(null);
    setPartyButtonBusy(true);

    const url = `${backend}/upload-nada-source/${codeName}-program`;

    // encode nadalang source code so that I don't have serialization issues
    const buffer = new TextEncoder().encode(nadalang);
    // @ts-ignore - deprecation notice
    const base64EncodedString = btoa(String.fromCharCode.apply(null, buffer));
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ nadalang: base64EncodedString }),
      });
      if (!(response.status === 200)) {
        setCodeError(`server error`);
        return;
      }
      const result = await response.json();
      console.log(`got program response: ${JSON.stringify(result, null, 4)}`);
      if (result?.statusCode !== 200) {
        setCodeError(result?.error);
        return;
      }
      setProgramId(result.programid);
      setActiveStep(1);
    } catch (error) {
      console.error("Error posting program: ", error);
      setCodeError(`server error: ${error}`);
    } finally {
      setPartyButtonBusy(undefined);
    }
  };

  const onExecuteProgram = async () => {
    // codePartyBindings should match codePartyResults
    console.log(`got all the results back - starting execute!`);

    try {
      setPartyButtonBusy(true);
      const bindings = new nillion.ProgramBindings(programId);
      let outputName;
      let outputTarget;
      Object.keys(codePartyBindings).map((i) => {
        console.log(
          `adding input binding: ${codePartyBindings[i].partyname}: ${codePartyBindings[i].partyid
          }`,
        );
        bindings.add_input_party(
          codePartyBindings[i].partyname,
          codePartyBindings[i].partyid,
        );

        if (codePartyBindings[i].output) {
          console.log(
            `adding output binding: ${codePartyBindings[i].output}: ${codePartyBindings[i].partyid
            }`,
          );
          outputName = codePartyBindings[i].output;
          outputTarget = i;
          bindings.add_output_party(
            codePartyBindings[i].partyname,
            codePartyBindings[i].partyid,
          );
        }
      });

      const store_ids = Object.values(partyContrib)
        .map((c) => c.storeid)
        .flat();
      const empty_s = new nillion.Secrets();
      const empty_p = new nillion.PublicVariables();

      console.log(`going to compute with secrets`);
      console.log({
        cluster_id: partyState.config.cluster_id,
        bindings,
        store_ids,
        empty_s,
        empty_p,
      });

      const compute_result_uuid = await client.compute(
        partyState.config.cluster_id,
        bindings,
        store_ids,
        empty_s,
        empty_p,
      );
      console.log(`got compute id: ${compute_result_uuid}`);

      dispatch({
        type: "codeparty-result",
        payload: {
          owner: codeName,
          ownercodepartyid: partyState.peers[codeName].codepartyid,
          programid: programId,
          targetcodepartyid: outputTarget,
          resultid: compute_result_uuid,
          resultname: outputName,
        },
      });
      toast({
        title: "Compute Complete",
        description: `Sending to result party for reveal`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      setActiveStep(3);
    } catch (error) {
      setExecError(`exec error: ${error}`);
    } finally {
      setPartyButtonBusy(undefined);
    }
  };

  /*
  "partyResultTask": {
      "owner": "marine-brown-jackal",
      "ownercodepartyid": "5182ebab-f1af-46bf-abc6-870c8a25e8f3",
      "programid": "53eSQSiDAcQV3ndF8cdNbYuatA7PGaw4rL8w2aLgwfKKWUA8ZBJQeoq8MJFCHKDVVUhSUHbPeWegYrcBuoxSBdAq/marine-brown-jackal-program",
      "targetcodepartyid": "5182ebab-f1af-46bf-abc6-870c8a25e8f3",
      "resultid": "e4a4e785-d4ad-4cf5-9cf9-b6359a615108",
      "resultname": "my_output"
  }
  */
  useEffect(() => {
    if (client === null) return;
    if (partyResultTask === null) return;
    (async () => {
      const task = partyResultTask;
      try {
        console.log(`starting compute reveal!`);
        const compute_result = await client.compute_result(task.resultid);
        const result = compute_result[task.resultname].toString();
        console.log(`got ${result}`);
        setComputeResult({ ...task, result });
        partyResultOnOpen();
      } catch (error) {
        setExecError(`exec error: ${error}`);
      } finally {
        setPartyButtonBusy(undefined);
      }
    })();
  }, [partyResultTask, client, partyResultOnOpen]);

  const steps = [
    { title: "First", description: "Upload Program", onClick: onSubmitCode },
    {
      title: "Second",
      description: "Select Peers",
      onClick: onAssignPeerBindings,
    },
    {
      title: "Third",
      description: "Execute Program",
      onClick: onExecuteProgram,
    },
    {
      title: "Fourth",
      description: "Complete",
      onClick: partyOnClose,
    },
  ];
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  useEffect(() => {
    if (partyError === null) return;
    setGlobalError(partyError);
  }, [partyError]);

  const onNadalangChange = useCallback((val: string) => {
    setNadalang(val);
  }, []);

  const onMyContrib = (idx: number) =>
    (
      { target: { value: contrib } }: {
        target: { value: number };
      },
    ) => {
      const newContrib = [...myContrib];
      newContrib[idx] = contrib;
      setMyContrib(newContrib);
    };

  const onSubmitContrib = async () => {
    const task = partyQueue;
    try {
      setContribButtonBusy(true);
      console.log(
        `starting submit to Nillion Network: ${JSON.stringify(task, null, 4)}`,
      );

      const results = [];
      for (let idx = 0; idx < task.inputs.length; idx++) {
        const input = task.inputs[idx];
        const binding = new nillion.ProgramBindings(task.programid);

        const my_secrets = new nillion.Secrets();
        const permissions = nillion.Permissions.default_for_user(
          client.user_id,
          task.programid,
        );
        permissions.add_compute_permissions(
          mkObj(task.owneruserid, [task.programid]),
        );

        // PublicInteger
        // SecretInteger
        // Integer
        // PublicUnsignedInteger
        // SecretUnsignedInteger
        // UnsignedInteger
        switch (input.type) {
          case "Integer":
          case "SecretInteger":
          case "PublicInteger":
            console.log(`insert new_integer: ${input.name}: ${myContrib[idx]}`);
            my_secrets.insert(
              input.name,
              nillion.Secret.new_integer(myContrib[idx]),
            );
            break;
          case "Integer":
          case "SecretInteger":
          case "PublicInteger":
            console.log(
              `insert new_unsigned_integer: ${input.name}: ${myContrib[idx]}`,
            );
            my_secrets.insert(
              input.name,
              nillion.Secret.new_unsigned_integer(myContrib[idx]),
            );
            break;
          default:
            throw new Error(`unsupported type for a codeparty: ${input.type}`);
        }
        const result = await client.store_secrets(
          partyState.config.cluster_id,
          my_secrets,
          binding,
          permissions,
        );
        results.push(result);
      }
      toast({
        title: "Secret stored",
        description: `Store ids [${results}]`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      dispatch({
        type: "codeparty-contrib",
        payload: {
          ownercodepartyid: task?.ownercodepartyid,
          handle: codeName,
          status: "ok",
          storeid: results,
          programid: task.programid,
        },
      });
      setContribButtonBusy(undefined);
      contribFormOnClose();
    } catch (error) {
      console.error("Error storing program secret: ", error);
      setContribError(`network error: ${error}`);
      toast({
        title: "Contrib Fail",
        description: `Error sending inputs to network ${error}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setContribButtonBusy(undefined);
      contribFormOnClose();
      dispatch({
        type: "codeparty-contrib",
        payload: {
          ownercodepartyid: task?.ownercodepartyid,
          handle: codeName,
          status: "error",
          storeid: null,
          programid: task.programid,
        },
      });
      return;
    }
  };

  // this sets the selectedPeers object to the nadaParsed input name
  const handleSelectedPeer = (option: string, peer: string) => {
    setSelectedPeers((prev) => ({
      ...prev,
      [peer]: option,
    }));
  };

  useEffect(() => {
    if (programId === null) return;
    const nadaextracts: NillionType.ProgramExtracts = {};
    let match;

    // SAMPLE: party1 = Party(name="Party1")
    // 1: party1
    // 2: Party1
    const extractedPartyNames = /(\w+)\s=\s*Party\(\s*name\s*=\s*"(\w+)"/gm;
    while ((match = extractedPartyNames.exec(nadalang)) !== null) {
      nadaextracts[match[1]] = {
        partyname: match[2],
        inputs: [],
        output: null,
      };
    }

    // SAMPLE: my_int1 = SecretInteger(Input(name="my_int1", party=party1))
    // 1: SecretInteger
    // 2: my_int1
    // 3: party1
    const extractedInputNames =
      /(\w+)\(\s*Input\(\s*name\s*=\s*"(\w+)",\s*party=(\w+)/gm;
    while ((match = extractedInputNames.exec(nadalang)) !== null) {
      nadaextracts[match[3]].inputs.push({ type: match[1], name: match[2] });
    }

    // SAMPLE: return [Output(output, "my_output", party1)]
    // 1: SecretInteger
    // 2: my_int1
    // 3: party1
    const extractedResultParty =
      /Output\(\s*\w+\s*,\s*"(.*?)"\s*,\s*(.*?)\s*\)/gm;
    while ((match = extractedResultParty.exec(nadalang)) !== null) {
      nadaextracts[match[2]].output = match[1];
    }

    console.log(`nada extracts: `);
    console.log(JSON.stringify(nadaextracts, null, 4));
    setNadaParsed(nadaextracts);
  }, [programId, nadalang]);

  useEffect(() => {
    if (partyQueue === null || userKey === null) return;
    console.log(`you're a selected party member!`);
    contribFormOnOpen();
  }, [partyQueue, userKey, contribFormOnOpen]);

  const addAndSwitchNetwork = useCallback(async () => {
    const myChain = partyState.chain.chainId;
    if (!myChain) {
      setGlobalError("failed to pull chain from network");
      return;
    }

    try {
      // @ts-ignore - proper arg list
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (currentChainId === myChain) {
        console.log("Desired network is already active.");
        return;
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [partyState.chain],
      });
      toast({
        title: "Metamask Success",
        description: "Network added and switched successfully",
        status: "success",
        duration: 4000,
        isClosable: false,
      });
    } catch (error) {
      console.log(JSON.stringify(error, null, 4));
      toast({
        title: "Metamask Fail",
        description: `Error adding network or switching`,
        status: "error",
        duration: 9000,
        isClosable: false,
      });
      setGlobalError("Metamask network must be testnet");
    }
  }, [partyState?.chain, setGlobalError, toast]);

  useEffect(() => {
    if (!userKey) return;
    if (!partyState?.config) return;
    if (codeName) return;

    const myName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "-",
      seed: userKey,
    });

    setCodeName(myName);

    (async () => {
      try {
        await addAndSwitchNetwork();
        console.log("getting balance of metamask wallet");
        // @ts-ignore - metamask args ok
        const mm_accounts: string[] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const mm_balance: string = await window.ethereum.request({
          method: "eth_getBalance",
          params: [mm_accounts[0]],
        });
        const balanceInEth = Web3.utils.fromWei(mm_balance, "ether");
        console.log(`metamask has ${balanceInEth}`);
        const mm_checksumAddr = Web3.utils.toChecksumAddress(mm_accounts[0]);
        setMmAddress(mm_checksumAddr);
        if (parseFloat(balanceInEth) < 1.4) {
          // this wallet needs funding
          toast({
            title: "Auto-faucet",
            description: "Funding your metamask account automatically",
            status: "success",
            duration: 2000,
            isClosable: false,
          });
          console.log(
            `posting metamask wallet [${mm_checksumAddr}] to faucet webservice`,
          );
          const url = `${backend}/faucet/${mm_checksumAddr}`;
          const response = await fetch(url, {
            method: "POST",
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          console.log(
            `got faucet response: ${JSON.stringify(result, null, 4)}`,
          );
          if (result?.statusCode !== 200) {
            toast({
              title: "Faucet Fail",
              description: `Error adding funds to address ${mm_accounts[0]}`,
              status: "error",
              duration: 9000,
              isClosable: false,
            });
            setGlobalError("Dynamic wallet must be funded");
            return;
          }
          console.log(`using dynamic wallet in nillion client: ${result.tx}`);
          toast({
            title: "Faucet Success",
            description: result.tx,
            status: "success",
            duration: 4000,
            isClosable: false,
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        console.log(
          `mm balance of ${mm_checksumAddr}: ${JSON.stringify(mm_balance, null, 4)
          }`,
        );

        // @ts-ignore - is ok
        const mm_web3 = new Web3(window.ethereum); // metamask
        const web3 = new Web3(partyState.config.payments_config.rpc_endpoint); // poa network
        const account = web3.eth.accounts.create();
        setDynAddress(account.address);

        const txSend = {
          to: account.address,
          from: mm_checksumAddr,
          value: web3.utils.toWei("0.5", "ether"),
        };
        console.log(`mm tx: ${JSON.stringify(txSend, null, 4)}`);
        const txHash = await mm_web3.eth.sendTransaction(txSend);
        setIsFunded(txHash.transactionHash.toString());

        const _nillion = await import("@nillion/nillion-client-js-browser");
        await _nillion.default();

        const randomInt = seededRandom(userKey, 0, 126); // Generates a number between 0 and 125
        const node_seed = `test-seed-${randomInt}`;
        console.log(`using node seed ${node_seed}`);
        const nodekey = _nillion.NodeKey.from_seed(node_seed);
        const _userkey = _nillion.UserKey.from_base58(userKey);
        const payments_config = partyState.config.payments_config;
        const pkWithout0x = account.privateKey.replace(/^0x/, "");
        payments_config.signer.wallet["private_key"] = pkWithout0x;
        console.log(
          `creating nillion client with config: ${JSON.stringify(
            {
              userkey: _userkey,
              nodekey,
              bootnodes: partyState.config.bootnodes,
              payments_config,
            },
            null,
            4,
          )
          }`,
        );
        const _client = new _nillion.NillionClient(
          _userkey,
          nodekey,
          partyState.config.bootnodes,
          payments_config,
        );
        console.log(`client created. going to pull cluster info`);

        const status = await _client.cluster_information(
          partyState.config.cluster_id,
        );
        console.log(JSON.stringify(status, null, 4));
        setClient(_client);
        setNillion(_nillion);

        dispatch({
          type: "register",
          // @ts-ignore - codepartyid is injected in the partykit server
          payload: { handle: myName, partyid: _client.party_id },
        });
      } catch (e) {
        console.error(`init error: ${e}`);
        setGlobalError(`init error: ${e}`);
      }
    })();
  }, [
    userKey,
    partyState?.config,
    addAndSwitchNetwork,
    codeName,
    dispatch,
    toast,
  ]);

  async function connectAndCallSnap() {
    const nillionSnapId = "npm:nillion-user-key-manager";
    if (window.ethereum) {
      try {
        // Request permission to connect to the Snap.
        await window.ethereum.request({
          // @ts-ignore
          method: "wallet_requestSnaps",
          params: {
            // @ts-ignore
            [nillionSnapId]: {},
          },
        });

        // Invoke the 'read_user_key' method of the Snap
        const response: { user_key: string } = await window.ethereum.request({
          // @ts-ignore
          method: "wallet_invokeSnap",
          params: {
            // @ts-ignore
            snapId: nillionSnapId,
            request: { method: "read_user_key" },
          },
        });

        if (response && response.user_key) {
          setUserKey(response.user_key);
          setConnectedToSnap(true);
        }
      } catch (error) {
        setGlobalError(`error interacting with Snap: ${error}`);
        console.error("Error interacting with Snap:", error);
      }
    }
  }

  const peerBindingConflict = new Set(Object.values(selectedPeers)).size !==
    Object.values(selectedPeers).length;

  const peerToPartiesConflict =
    Object.keys(selectedPeers).length !== Object.keys(nadaParsed ?? {}).length;

  // DEBUG OUTPUT
  console.log(`STATE DUMP: `);
  console.log(
    JSON.stringify(
      {
        activeStep,
        codePartyBindings,
        myContrib,
        nadaParsed,
        partyContrib,
        partyQueue,
        partyState,
        partyResultTask,
        peerBindingConflict,
        peerToPartiesConflict,
        programId,
        selectedPeers,
      },
      null,
      4,
    ),
  );

  const PeerButton = ({ peer }: { peer: string }) => {
    if (nadaParsed === null) return;
    return (
      <Card maxW="lg">
        <CardHeader>
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name={peer} />
            <Box>
              <Heading size="sm">
                {peer}
                {peer === codeName ? " (you)" : ""}
              </Heading>
            </Box>
          </Flex>
        </CardHeader>
        <CardBody>
          <RadioGroup value={selectedPeers[peer]}>
            <Stack spacing={2} direction="column">
              {Object.keys(nadaParsed).map((option) => (
                <Radio
                  key={`binding-${peer}-${option}`}
                  value={option}
                  onChange={() => handleSelectedPeer(option, peer)}
                >
                  {nadaParsed[option].partyname}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <Stack spacing={4} direction={"column"}>
          {globalError && (
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <AlertIcon />
              <Box>
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  In Error State (restart required)
                </AlertTitle>
                <AlertDescription maxWidth="sm">{globalError}</AlertDescription>
              </Box>
            </Alert>
          )}
          <Center>
            <Image
              alt="codeparty logo"
              className="null-pointer"
              width={500}
              height={200}
              src="/codeparty.png"
            />
          </Center>
          {!connectedToSnap &&
            (partyState
              ? (
                <Center>
                  <Button onClick={connectAndCallSnap}>
                    🚀 Connect to Nillion & Fund Session 💸
                  </Button>
                </Center>
              )
              : <Progress size="md" isIndeterminate />)}
        </Stack>

        <div className="px-5">
          <div>
            {userKey && (
              <Box flex="1" w={420} py={5}>
                <Card variant={"outline"}>
                  <CardHeader>
                    <Heading size="xs">Waiting Room</Heading>
                  </CardHeader>
                  <CardBody>
                    <AvatarGroup size="md" max={2}>
                      {Object.keys(partyState?.peers ?? {}).map((peer) => (
                        <Avatar key={peer} name={peer} />
                      ))}
                    </AvatarGroup>
                  </CardBody>
                  <Divider />

                  <CardFooter justify="right">
                    <Button
                      bgGradient="linear(to-r, red.500, orange.500, yellow.500, green.500, blue.500, purple.500, pink.500)"
                      color="white"
                      onClick={partyOnOpen}
                      isLoading={!isFunded}
                      loadingText="Init..."
                    >
                      Start a Party
                    </Button>
                  </CardFooter>
                </Card>
              </Box>
            )}

            {codeName && (
              <Center p={2}>
                <Highlight
                  query={codeName ?? ""}
                  styles={{ px: "1", py: "1", bg: "yellow.100" }}
                >
                  {`You are ${codeName}`}
                </Highlight>
              </Center>
            )}

            {partyState?.config && (
              <Modal size={"full"} isOpen={partyIsOpen} onClose={partyOnClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    <Stepper size="lg" index={activeStep}>
                      {steps.map((step, index) => (
                        <Step key={index}>
                          <StepIndicator>
                            <StepStatus
                              complete={<StepIcon />}
                              incomplete={<StepNumber />}
                              active={<StepNumber />}
                            />
                          </StepIndicator>

                          <Box flexShrink="0">
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription>
                              {step.description}
                            </StepDescription>
                          </Box>

                          <StepSeparator />
                        </Step>
                      ))}
                    </Stepper>
                  </ModalHeader>
                  <ModalBody>
                    <Heading as="h4" size="sm">
                      Paste Your Party Code
                    </Heading>
                    <Badge variant="subtle" colorScheme="blue">
                      <ChakraLink
                        href="https://docs.nillion.com/nada-lang"
                        isExternal
                      >
                        [docs]
                      </ChakraLink>
                    </Badge>
                    <Stack spacing={5} direction="column">
                      <Box position="relative" height="400px">
                        {(partyButtonBusy || activeStep !== 0) && (
                          <Alert status="warning">🔒 Editor Locked 🔒</Alert>
                        )}
                        <CodeMirror
                          value={nadalang}
                          height="300px"
                          extensions={[python()]}
                          readOnly={partyButtonBusy || activeStep !== 0}
                          onChange={onNadalangChange}
                          theme={partyButtonBusy || activeStep !== 0
                            ? basicLight
                            : monokai}
                        />
                      </Box>
                      {codeError && (
                        <Alert status="error">
                          <AlertIcon />
                          <Box>
                            <AlertTitle py={4} fontSize="lg">
                              There was an error compiling your program
                            </AlertTitle>
                            <AlertDescription maxWidth="sm">
                              {codeError}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      {execError && (
                        <Alert status="error">
                          <AlertIcon />
                          <Box>
                            <AlertTitle py={4} fontSize="lg">
                              There was an error executing your program
                            </AlertTitle>
                            <AlertDescription maxWidth="sm">
                              {execError}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}

                      <Accordion index={activeStep - 1}>
                        <AccordionItem isDisabled={activeStep !== 1}>
                          <h2>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                Select Peers
                              </Box>
                            </AccordionButton>
                          </h2>
                          {activeStep === 1 && (
                            <AccordionPanel pb={4}>
                              {peerBindingConflict && (
                                <Box py={2}>
                                  <Alert status="error">
                                    <AlertIcon />
                                    <Box>Peers cannot share party names</Box>
                                  </Alert>
                                </Box>
                              )}
                              {peerToPartiesConflict && (
                                <Box py={2}>
                                  <Alert status="warning">
                                    <AlertIcon />
                                    <Box>
                                      All parties must be bound to a peer
                                    </Box>
                                  </Alert>
                                </Box>
                              )}
                              <SimpleGrid
                                spacing={4}
                                templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                              >
                                {Object.keys(partyState.peers).map(
                                  (peer: string, idx: number) => {
                                    return (
                                      <>
                                        <Stack spacing={2} direction="row">
                                          <PeerButton
                                            key={`${peer}-${idx}`}
                                            peer={peer}
                                          />
                                        </Stack>
                                      </>
                                    );
                                  },
                                )}
                              </SimpleGrid>
                            </AccordionPanel>
                          )}
                        </AccordionItem>

                        <AccordionItem isDisabled={activeStep !== 2}>
                          <h2>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                Execute Program
                              </Box>
                            </AccordionButton>
                          </h2>
                          {activeStep === 2 && (
                            <AccordionPanel pb={4}>
                              <Box flex="1" py={5}>
                                <Card variant={"outline"}>
                                  <CardHeader>
                                    <Heading size="xs">
                                      Waiting for peer contribution
                                    </Heading>
                                  </CardHeader>
                                  <CardBody>
                                    <TableContainer>
                                      <Table variant="simple" size={"sm"}>
                                        <Tbody>
                                          {Object.keys(selectedPeers).map(
                                            (peer) => (
                                              <Tr key={`rowtag-${peer}`}>
                                                <Td>
                                                  <Tag
                                                    size="lg"
                                                    colorScheme={partyResultsColor(
                                                      partyContrib,
                                                      peer,
                                                    )}
                                                    borderRadius="full"
                                                  >
                                                    <Avatar
                                                      size="xs"
                                                      name={peer}
                                                      ml={-1}
                                                      mr={2}
                                                    />
                                                    <TagLabel>{peer}</TagLabel>
                                                  </Tag>
                                                </Td>
                                                <Td>
                                                  {partyContrib &&
                                                    peer in partyContrib
                                                    ? (
                                                      <Tag>
                                                        {partyContrib[peer]
                                                          .status}
                                                      </Tag>
                                                    )
                                                    : (
                                                      <Progress
                                                        size="md"
                                                        isIndeterminate
                                                      />
                                                    )}
                                                </Td>
                                              </Tr>
                                            ),
                                          )}
                                        </Tbody>
                                      </Table>
                                    </TableContainer>
                                  </CardBody>
                                </Card>
                              </Box>
                            </AccordionPanel>
                          )}
                        </AccordionItem>
                      </Accordion>
                    </Stack>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      isLoading={partyButtonBusy}
                      // isDisabled={peerBindingConflict || peerToPartiesConflict}
                      loadingText="Working..."
                      onClick={steps[activeStep].onClick}
                    >
                      {steps[activeStep].description} »
                    </Button>
                    <Button onClick={partyOnClose} variant="ghost">
                      Abort
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )}
          </div>

          {partyQueue && (
            <Modal
              size={"3xl"}
              motionPreset={"slideInBottom"}
              isOpen={contribFormIsOpen}
              onClose={contribFormOnClose}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  Contribute to{"  "}
                  <Text as="span" color="blue.500">
                    {partyQueue.owner}
                    {"'s "}
                  </Text>
                  CodeParty!
                </ModalHeader>
                <ModalBody>
                  <Heading fontFamily="monospace" as="h4" size="sm">
                    You are{" "}
                    <Text as="span" color="blue.500">
                      {partyQueue.partyname}
                      {" "}
                    </Text>
                    of programid{"  "}
                    <Text as="span" color="blue.500">
                      {partyQueue.programid}
                    </Text>
                  </Heading>
                  {contribError && (
                    <Box py={2}>
                      <Alert status="error">
                        <AlertIcon />
                        <Box>
                          <AlertTitle mt={4} mb={1} fontSize="lg">
                            There was an error submitting your input
                          </AlertTitle>
                          <AlertDescription maxWidth="sm">
                            {contribError}
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </Box>
                  )}
                  <Stack py={2} spacing={5} direction="column">
                    {partyQueue.inputs.map((myinput, idx: number) => (
                      <InputGroup key={`input-${idx}`}>
                        <InputLeftAddon>{myinput.name}</InputLeftAddon>

                        <NumberInput>
                          <NumberInputField
                            key={`input-${idx}`}
                            // @ts-ignore - https://v2.chakra-ui.com/docs/components/number-input/props
                            size={"lg"}
                            // @ts-ignore - https://v2.chakra-ui.com/docs/components/number-input/props
                            onChange={onMyContrib(idx)}
                          />
                        </NumberInput>
                        <InputRightAddon color="blue.500">
                          {myinput.type}
                        </InputRightAddon>
                      </InputGroup>
                    ))}
                  </Stack>
                </ModalBody>

                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    isLoading={contribButtonBusy}
                    onClick={onSubmitContrib}
                  >
                    Go!
                  </Button>
                  <Button onClick={contribFormOnClose} variant="ghost">
                    Abort
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )}
        </div>
        {computeResult && (
          <Modal isOpen={partyResultIsOpen} onClose={partyResultOnClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Text as="span" color="blue.500">
                  {computeResult.owner}
                  {"'s "}
                </Text>
                CodeParty Result!
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={2} direction="column">
                  <Image
                    objectFit="cover"
                    className="null-pointer"
                    width={500}
                    height={200}
                    alt="Nil Duck"
                    src="/codeparty-result.png"
                  />
                  <Center>
                    <RainbowText text={computeResult.result} />
                  </Center>
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={partyResultOnClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
        {!connectedToSnap
          ? (
            <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-m rounded-3xl">
                  <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
                  <p>
                    To connect with your Nillion user key...
                    <ol className="block my-4">
                      <li>
                        - Download the MetaMask Flask browser extension to get
                        access to MetaMask Snap
                      </li>
                      <li>
                        - Visit{" "}
                        <Link
                          href="https://github.com/nillion-oss/nillion-snap"
                          target="_blank"
                          passHref
                          className="link"
                        >
                          Nillion Key Management UI
                        </Link>{" "}
                        to generate a user key
                      </li>
                      <li>- Come back and connect to the snap</li>
                    </ol>
                  </p>
                </div>
              </div>
            </div>
          )
          : configIsOpen
            ? (
              <Modal size={"full"} isOpen={configIsOpen} onClose={configOnClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    <Box as="span" flex="1" textAlign="left">
                      Configuration
                    </Box>
                  </ModalHeader>
                  <ModalBody>
                    <Code>
                      <TableContainer py={10}>
                        <Table variant="striped">
                          <Tbody>
                            <Tr>
                              <Td>Metamask Connected Address</Td>
                              <Td>
                                <Address format={"long"} address={mmAddress} />
                              </Td>
                            </Tr>
                            <Tr>
                              <Td>Dynamic Testnet Address</Td>
                              <Td>
                                <Address format={"long"} address={dynAddress} />
                              </Td>
                            </Tr>
                            <Tr>
                              <Td>Funding Tx Hash</Td>
                              <Td>
                                {isFunded}
                                <CopyToClipboard text={isFunded}>
                                  <DocumentDuplicateIcon
                                    className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                                    aria-hidden="true"
                                  />
                                </CopyToClipboard>
                              </Td>
                            </Tr>
                            <Tr>
                              <Td>Nillion User Key</Td>
                              <Td>
                                {userKey}
                                <CopyToClipboard text={userKey}>
                                  <DocumentDuplicateIcon
                                    className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                                    aria-hidden="true"
                                  />
                                </CopyToClipboard>
                              </Td>
                            </Tr>
                            <Tr>
                              <Td>Your Code Name</Td>
                              <Td>
                                {codeName}
                                <CopyToClipboard text={codeName}>
                                  <DocumentDuplicateIcon
                                    className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                                    aria-hidden="true"
                                  />
                                </CopyToClipboard>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Code>
                    <Divider py={10} />
                    <Heading as="h4" size="md">
                      Shared Party State
                    </Heading>
                    <Code>{JSON.stringify(partyState, null, 4)}</Code>
                  </ModalBody>

                  <ModalFooter>
                    <Button onClick={configOnClose} variant="ghost">
                      Close
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )
            : (
              <Button
                colorScheme="gray"
                size="xs"
                variant="outline"
                onClick={configOnOpen}
              >
                View Config
              </Button>
            )}
      </div>
    </>
  );
};

export default Home;
