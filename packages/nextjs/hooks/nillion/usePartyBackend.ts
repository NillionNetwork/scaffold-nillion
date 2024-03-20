import { useState } from "react";
import usePartySocket from "partysocket/react";
import type * as Nillion from "~~/types/nillion";

const PARTY_TRACKER = process.env.NEXT_PUBLIC_PARTY_TRACKER;

export const usePartyBackend = () => {
  const [programId, setProgramId] = useState<string | null>(null);
  const [partyState, setPartyState] = useState<Nillion.Baseline | null>(null);
  const [partyError, setPartyError] = useState<string | null>(null);
  const [partyQueue, setPartyQueue] = useState<Nillion.CodePartyQueue | null>(null);
  const [partyResultTask, setPartyResultTask] = useState<Nillion.CodePartyResult | null>(null);
  const [partyContrib, setPartyContrib] = useState<Nillion.CodePartyContributions | null>(null);

  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: process.env.NEXT_PUBLIC_SERVER_URL || PARTY_TRACKER,
    room: "default",

    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
    onOpen() {
      console.log("usePartyBackend onOpen");
    },
    onMessage(e) {
      console.log(`usePartyBackend onMessage: ${e.data}`);
      let envelope: Nillion.Envelope = JSON.parse(e.data);
      switch (envelope?.type) {
        case "baseline":
          // @ts-ignore - determine type from declared type
          setPartyState(envelope.payload);
          break;
        case "codeparty-result":
          console.log(`got a program result assignment`);
          // @ts-ignore - determine type from declared type
          setPartyResultTask(envelope.payload);
          break;
        case "codeparty-task":
          console.log(`got a program task assignment`);
          // @ts-ignore - determine type from declared type
          setPartyQueue(envelope.payload);
          break;
        case "codeparty-contrib":
          // @ts-ignore - programid is part of CodePartyContrib
          if (envelope.payload.programid === programId) {
            setPartyContrib(prev => ({
              ...prev,
              // @ts-ignore - programid is part of CodePartyContrib
              [envelope.payload.handle]: envelope.payload,
            }));
          }
          break;
      }
    },

    onClose() {
      console.log("usePartyBackend onClose");
    },
    onError(e) {
      console.log(`usePartyBackend onError`);
      setPartyError(`party backend failure: ${JSON.stringify(e, null, 4)}`);
    },
  });

  const dispatch = (action: Nillion.Action) => {
    console.log(`usePartyBackend dispatch message to party backend`);
    ws.send(JSON.stringify(action));
  };

  return {
    programId,
    setProgramId,
    partyState,
    partyQueue,
    partyContrib,
    partyResultTask,
    partyError,
    dispatch,
  };
};
