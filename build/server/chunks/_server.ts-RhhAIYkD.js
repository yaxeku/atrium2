import { j as json } from './index-DgaSZy_D.js';

async function POST({ cookies }) {
  cookies.delete("authToken", { path: "/" });
  cookies.delete("authTokenAdmin", { path: "/" });
  return json({ success: true });
}

export { POST };
//# sourceMappingURL=_server.ts-RhhAIYkD.js.map
