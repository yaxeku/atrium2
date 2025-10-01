import { json } from "@sveltejs/kit";
import * as bip39 from "bip39";
async function GET() {
  const mnemonic = bip39.generateMnemonic();
  return json({ mnemonic });
}
export {
  GET
};
