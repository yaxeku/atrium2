import { b as attr } from './attributes-BxhU0IcD.js';
import { b as bootstrap } from './bootstrap-ChKl15H9.js';
import './escaping-DWmW5pWT.js';
import './state.svelte-D9Nv4Mt-.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let userName = "";
    let passWord = "";
    $$renderer2.push(`<div class="contentbox svelte-18c6u1m"><div class="el"></div> <div class="loginbox svelte-18c6u1m"><div class="titleBox svelte-18c6u1m"><h2 class="svelte-18c6u1m">Welcome To</h2> <div class="logo svelte-18c6u1m"><img${attr("src", bootstrap)} height="40px" width="40px" alt="logo"/> <h1 class="white svelte-18c6u1m">Xekku Panel.</h1> <p class="svelte-18c6u1m">ADMIN</p></div></div> <div class="loginform svelte-18c6u1m"><form class="svelte-18c6u1m"><label for="username" class="svelte-18c6u1m">Username</label> <input id="username"${attr("value", userName)} placeholder="Your Username" type="text" class="svelte-18c6u1m"/> <label for="password" class="svelte-18c6u1m">Password</label> <input id="password"${attr("value", passWord)} placeholder="Your Password" type="password" class="svelte-18c6u1m"/> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="svelte-18c6u1m">Login</button></form></div> <p class="svelte-18c6u1m">For registration contact <a href="https://t.me/xekku" target="_blank" rel="noopener noreferrer" class="svelte-18c6u1m">@xekku</a></p></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BAvH9voM.js.map
