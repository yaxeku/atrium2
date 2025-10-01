import { r as redirect } from './index-DgaSZy_D.js';

const load = async ({ cookies }) => {
  cookies.delete("authToken", { path: "/" });
  throw redirect(303, "/login");
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 9;
const server_id = "src/routes/logout/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

export { fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=9-BWq-6vj9.js.map
