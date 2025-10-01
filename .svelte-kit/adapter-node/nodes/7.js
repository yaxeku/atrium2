import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.WflbxTQU.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/Ck01Vq7Y.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/BKOYs9ZV.js","_app/immutable/chunks/Cfw8beTg.js","_app/immutable/chunks/bg2FVGoa.js","_app/immutable/chunks/DbIzEwoh.js","_app/immutable/chunks/DB_lmZqj.js","_app/immutable/chunks/DQkptMSE.js","_app/immutable/chunks/RR5R80WA.js","_app/immutable/chunks/B0yxJNGR.js"];
export const stylesheets = ["_app/immutable/assets/bootstrap.6KA-2mUj.css","_app/immutable/assets/7.DdGTV3EM.css"];
export const fonts = [];
