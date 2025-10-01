import { r as redirect } from './index-DgaSZy_D.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
async function load({ cookies }) {
  if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined. Please set it in your .env file.");
    throw redirect(303, "/login");
  }
  const token = cookies.get("authToken");
  if (!token) {
    throw redirect(303, "/login");
  }
  try {
    const user = jwt.verify(token, SECRET_KEY);
    return { user };
  } catch {
    throw redirect(303, "/login");
  }
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Btmx66I5.js')).default;
const server_id = "src/routes/dashboard/+page.server.ts";
const imports = ["_app/immutable/nodes/7.WflbxTQU.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/Ck01Vq7Y.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/BKOYs9ZV.js","_app/immutable/chunks/Cfw8beTg.js","_app/immutable/chunks/bg2FVGoa.js","_app/immutable/chunks/DbIzEwoh.js","_app/immutable/chunks/DB_lmZqj.js","_app/immutable/chunks/DQkptMSE.js","_app/immutable/chunks/RR5R80WA.js","_app/immutable/chunks/B0yxJNGR.js"];
const stylesheets = ["_app/immutable/assets/bootstrap.6KA-2mUj.css","_app/immutable/assets/7.DdGTV3EM.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-CXwGCEJS.js.map
