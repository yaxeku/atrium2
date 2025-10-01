import { b as attr } from './attributes-BxhU0IcD.js';
import { b as bootstrap } from './bootstrap-ChKl15H9.js';
import './escaping-DWmW5pWT.js';
import './state.svelte-D9Nv4Mt-.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let userName = "";
    let passWord = "";
    $$renderer2.push(`<div class="contentbox svelte-1x05zx6"><div class="el"></div> <div class="loginbox svelte-1x05zx6"><div class="titleBox svelte-1x05zx6"><h2 class="svelte-1x05zx6">Welcome To</h2> <div class="logo svelte-1x05zx6"><img${attr("src", bootstrap)} height="40px" width="40px" alt="logo"/> <h1 class="white svelte-1x05zx6">Xekku Panel.</h1></div></div> <div class="loginform svelte-1x05zx6"><form class="svelte-1x05zx6"><label for="username" class="svelte-1x05zx6">Username</label> <input id="username"${attr("value", userName)} placeholder="Your Username" type="text" class="svelte-1x05zx6"/> <label for="password" class="svelte-1x05zx6">Password</label> <input id="password"${attr("value", passWord)} placeholder="Your Password" type="password" class="svelte-1x05zx6"/> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit" class="svelte-1x05zx6">Login</button></form></div> <p class="svelte-1x05zx6">Panel Version: <span class="darkText svelte-1x05zx6">1.0.1</span></p></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BZQtKc4b.js.map
