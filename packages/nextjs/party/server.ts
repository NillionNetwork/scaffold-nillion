import type * as Nillion from "../types/nillion";
import type * as Party from "partykit/server";

// @ts-ignore - manually placed
import config from './remote.json';

export default class Server implements Party.Server {
  chain: Nillion.ChainConfig = config.chain;
  config: Nillion.Config = config.client;
  phonebook: Nillion.PhoneBook = {};

  constructor(readonly room: Party.Room) { }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    conn.send(JSON.stringify(this.baseline));
  }

  baseline: Nillion.Envelope = {
    type: "baseline",
    payload: {
      chain: this.chain,
      config: this.config,
      peers: this.phonebook,
    },
  };

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    let envelope: Nillion.Envelope = JSON.parse(message);
    // we could use a more sophisticated protocol here, such as JSON
    // in the message data, but for simplicity we just use a string
    switch (envelope?.type) {
      case "register":
        // @ts-ignore - determine type from declared type
        this.register({ ...envelope.payload, codepartyid: sender.id });
        break;
      case "codeparty-start":
        // @ts-ignore - determine type from declared type
        this.codeparty(envelope.payload);
        break;
      case "codeparty-contrib":
        // @ts-ignore - determine type from declared type
        this.contrib(envelope.payload);
        break;
      case "codeparty-result":
        // @ts-ignore - determine type from declared type
        this.result(envelope.payload);
        break;
      default:
        console.log(`onMessage: unknown type: ${envelope?.type}`);
    }
  }

  onRequest(req: Party.Request) {
    // response to any HTTP request (any method, any path) with the current
    // phonebook. This allows us to use SSR to give components an initial value
    console.log(req);

    return new Response(JSON.stringify(this.baseline));
  }

  register(payload: Nillion.BookEntry) {
    console.log(`broadcasting phonebook change`);
    this.phonebook[payload["handle"]] = payload;
    this.room.broadcast(JSON.stringify(this.baseline), []);
  }

  contrib(payload: Nillion.CodePartyContrib) {
    console.log(`routing contrib`);
    const result: Nillion.Envelope = {
      type: "codeparty-contrib",
      payload: payload,
    };
    this.room.getConnection(payload.ownercodepartyid)?.send(
      JSON.stringify(result),
    );
  }

  result(payload: Nillion.CodePartyResult) {
    console.log(`routing result task`);
    const result: Nillion.Envelope = {
      type: "codeparty-result",
      payload: payload,
    };
    this.room.getConnection(payload.targetcodepartyid)?.send(
      JSON.stringify(result),
    );
  }

  codeparty(payload: Nillion.CodePartyStart) {
    // when we handle codeparty start action, we send a CodePartyBinding
    // task to each peer that is listed
    Object.keys(payload.peers).map((p) => {
      console.log(`sending codeparty task to peer ${p}`);
      const task: Nillion.Envelope = {
        type: "codeparty-task",
        payload: payload.peers[p],
      };
      this.room.getConnection(p)?.send(JSON.stringify(task));
    });
  }
}

Server satisfies Party.Worker;
