import { j as json } from './index-DgaSZy_D.js';
import * as bip39 from 'bip39';

async function GET() {
  const mnemonic = bip39.generateMnemonic();
  return json({ mnemonic });
}

export { GET };
//# sourceMappingURL=_server.ts-C1e66dlO.js.map
