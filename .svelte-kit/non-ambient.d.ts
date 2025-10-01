
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/api" | "/admin/api/getGuild" | "/admin/api/login" | "/admin/dashboard" | "/admin/login" | "/api" | "/api/capturedData" | "/api/capturedData/Add" | "/api/capturedData/Get" | "/api/deleteTarg" | "/api/deleteTarg/all" | "/api/generateMnemonic" | "/api/guild" | "/api/guild/addCaller" | "/api/guild/addDomain" | "/api/guild/deleteCashout" | "/api/guild/getCallerCashouts" | "/api/guild/getCallerTargets" | "/api/guild/getCapturedSeeds" | "/api/guild/getCashouts" | "/api/guild/getDomains" | "/api/guild/getGuildCallers" | "/api/guild/getGuild" | "/api/guild/getSettings" | "/api/guild/registerCashout" | "/api/guild/removeCaller" | "/api/guild/removeDomain" | "/api/guild/updateCaller" | "/api/guild/updateCashout" | "/api/guild/updateSettings" | "/api/login" | "/api/logout" | "/api/mailer" | "/api/mailer/sendmail" | "/api/mailer/sendmail/[mailtype]" | "/api/register" | "/api/send-sms" | "/api/sound" | "/api/sound/[username]" | "/api/startingPage" | "/api/startingPage/get" | "/api/startingPage/set" | "/api/targets" | "/api/targets/[targetid]" | "/api/upload-sound" | "/dashboard" | "/login" | "/logout";
		RouteParams(): {
			"/api/mailer/sendmail/[mailtype]": { mailtype: string };
			"/api/sound/[username]": { username: string };
			"/api/targets/[targetid]": { targetid: string }
		};
		LayoutParams(): {
			"/": { mailtype?: string; username?: string; targetid?: string };
			"/admin": Record<string, never>;
			"/admin/api": Record<string, never>;
			"/admin/api/getGuild": Record<string, never>;
			"/admin/api/login": Record<string, never>;
			"/admin/dashboard": Record<string, never>;
			"/admin/login": Record<string, never>;
			"/api": { mailtype?: string; username?: string; targetid?: string };
			"/api/capturedData": Record<string, never>;
			"/api/capturedData/Add": Record<string, never>;
			"/api/capturedData/Get": Record<string, never>;
			"/api/deleteTarg": Record<string, never>;
			"/api/deleteTarg/all": Record<string, never>;
			"/api/generateMnemonic": Record<string, never>;
			"/api/guild": Record<string, never>;
			"/api/guild/addCaller": Record<string, never>;
			"/api/guild/addDomain": Record<string, never>;
			"/api/guild/deleteCashout": Record<string, never>;
			"/api/guild/getCallerCashouts": Record<string, never>;
			"/api/guild/getCallerTargets": Record<string, never>;
			"/api/guild/getCapturedSeeds": Record<string, never>;
			"/api/guild/getCashouts": Record<string, never>;
			"/api/guild/getDomains": Record<string, never>;
			"/api/guild/getGuildCallers": Record<string, never>;
			"/api/guild/getGuild": Record<string, never>;
			"/api/guild/getSettings": Record<string, never>;
			"/api/guild/registerCashout": Record<string, never>;
			"/api/guild/removeCaller": Record<string, never>;
			"/api/guild/removeDomain": Record<string, never>;
			"/api/guild/updateCaller": Record<string, never>;
			"/api/guild/updateCashout": Record<string, never>;
			"/api/guild/updateSettings": Record<string, never>;
			"/api/login": Record<string, never>;
			"/api/logout": Record<string, never>;
			"/api/mailer": { mailtype?: string };
			"/api/mailer/sendmail": { mailtype?: string };
			"/api/mailer/sendmail/[mailtype]": { mailtype: string };
			"/api/register": Record<string, never>;
			"/api/send-sms": Record<string, never>;
			"/api/sound": { username?: string };
			"/api/sound/[username]": { username: string };
			"/api/startingPage": Record<string, never>;
			"/api/startingPage/get": Record<string, never>;
			"/api/startingPage/set": Record<string, never>;
			"/api/targets": { targetid?: string };
			"/api/targets/[targetid]": { targetid: string };
			"/api/upload-sound": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/login": Record<string, never>;
			"/logout": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/api" | "/admin/api/" | "/admin/api/getGuild" | "/admin/api/getGuild/" | "/admin/api/login" | "/admin/api/login/" | "/admin/dashboard" | "/admin/dashboard/" | "/admin/login" | "/admin/login/" | "/api" | "/api/" | "/api/capturedData" | "/api/capturedData/" | "/api/capturedData/Add" | "/api/capturedData/Add/" | "/api/capturedData/Get" | "/api/capturedData/Get/" | "/api/deleteTarg" | "/api/deleteTarg/" | "/api/deleteTarg/all" | "/api/deleteTarg/all/" | "/api/generateMnemonic" | "/api/generateMnemonic/" | "/api/guild" | "/api/guild/" | "/api/guild/addCaller" | "/api/guild/addCaller/" | "/api/guild/addDomain" | "/api/guild/addDomain/" | "/api/guild/deleteCashout" | "/api/guild/deleteCashout/" | "/api/guild/getCallerCashouts" | "/api/guild/getCallerCashouts/" | "/api/guild/getCallerTargets" | "/api/guild/getCallerTargets/" | "/api/guild/getCapturedSeeds" | "/api/guild/getCapturedSeeds/" | "/api/guild/getCashouts" | "/api/guild/getCashouts/" | "/api/guild/getDomains" | "/api/guild/getDomains/" | "/api/guild/getGuildCallers" | "/api/guild/getGuildCallers/" | "/api/guild/getGuild" | "/api/guild/getGuild/" | "/api/guild/getSettings" | "/api/guild/getSettings/" | "/api/guild/registerCashout" | "/api/guild/registerCashout/" | "/api/guild/removeCaller" | "/api/guild/removeCaller/" | "/api/guild/removeDomain" | "/api/guild/removeDomain/" | "/api/guild/updateCaller" | "/api/guild/updateCaller/" | "/api/guild/updateCashout" | "/api/guild/updateCashout/" | "/api/guild/updateSettings" | "/api/guild/updateSettings/" | "/api/login" | "/api/login/" | "/api/logout" | "/api/logout/" | "/api/mailer" | "/api/mailer/" | "/api/mailer/sendmail" | "/api/mailer/sendmail/" | `/api/mailer/sendmail/${string}` & {} | `/api/mailer/sendmail/${string}/` & {} | "/api/register" | "/api/register/" | "/api/send-sms" | "/api/send-sms/" | "/api/sound" | "/api/sound/" | `/api/sound/${string}` & {} | `/api/sound/${string}/` & {} | "/api/startingPage" | "/api/startingPage/" | "/api/startingPage/get" | "/api/startingPage/get/" | "/api/startingPage/set" | "/api/startingPage/set/" | "/api/targets" | "/api/targets/" | `/api/targets/${string}` & {} | `/api/targets/${string}/` & {} | "/api/upload-sound" | "/api/upload-sound/" | "/dashboard" | "/dashboard/" | "/login" | "/login/" | "/logout" | "/logout/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | "/notification.mp3" | "/uploads/testuser/b447d732235cfcacdbc54e5b4f0e5bf1.mp3" | "/uploads/testuser/sound-mappings.json" | string & {};
	}
}