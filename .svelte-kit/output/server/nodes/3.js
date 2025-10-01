import * as server from '../entries/pages/dashboard/_layout.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+layout.server.ts";
export const imports = ["_app/immutable/nodes/3.CaSRoIpA.js","_app/immutable/chunks/CjK9QoIm.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/BKOYs9ZV.js"];
export const stylesheets = [];
export const fonts = [];
