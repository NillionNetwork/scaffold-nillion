import * as nillion from "@nillion/nillion-client-js-browser/nillion_client_js_browser.js";

export type NillionClientJSBrowser = typeof nillion;
export type NillionClient = nillion.NillionClient;

export enum SecretInputType {
  INTEGER,
  UNSIGNED_INTEGER,
  BLOB,
}
