import { r as redirect } from './index-DgaSZy_D.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
function load({ cookies }) {
  if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined. Please set it in your .env file.");
    throw redirect(303, "login");
  }
  const token = cookies.get("authTokenAdmin");
  if (!token) {
    throw redirect(303, "login");
  }
  try {
    jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw redirect(303, "login");
  }
  return {};
}

var _layout_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./layout.svelte-UxsTmhKc.js')).default;
const server_id = "src/routes/admin/dashboard/+layout.server.ts";
const imports = ["_app/immutable/nodes/2.CaSRoIpA.js","_app/immutable/chunks/CjK9QoIm.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/BKOYs9ZV.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-Bk0sUtBH.js.map
