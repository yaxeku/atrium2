import * as server from '../entries/pages/admin/dashboard/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/dashboard/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.CaSRoIpA.js","_app/immutable/chunks/CjK9QoIm.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/BKOYs9ZV.js"];
export const stylesheets = [];
export const fonts = [];
