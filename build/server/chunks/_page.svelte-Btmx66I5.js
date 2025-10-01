import { x as attr_class, y as stringify } from './index2-BR1Y24po.js';
import { b as bootstrap } from './bootstrap-ChKl15H9.js';
import 'socket.io-client';
import 'md5';
import { D as escape_html } from './escaping-DWmW5pWT.js';
import { b as attr } from './attributes-BxhU0IcD.js';
import './state.svelte-D9Nv4Mt-.js';
import 'jwt-decode';
import './context-CXhJZien.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedElement = "lol";
    let username = "Guest";
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`loading-screen ${stringify("")}`, "svelte-x1i5gj")}><div class="loadingLogo svelte-x1i5gj"><img${attr("src", bootstrap)} alt="Logo" class="svelte-x1i5gj"/> <div class="loading-text svelte-x1i5gj"><h1 class="svelte-x1i5gj">Xekku Panel<span class="accent svelte-x1i5gj">.</span></h1> <p class="user-badge svelte-x1i5gj">DASHBOARD</p></div></div></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="dashboard-container svelte-x1i5gj"><div class="sidebar svelte-x1i5gj"><div class="logo-section svelte-x1i5gj"><img${attr("src", bootstrap)} alt="Logo" class="svelte-x1i5gj"/> <div class="brand svelte-x1i5gj"><h1 class="svelte-x1i5gj">Xekku Panel<span class="accent svelte-x1i5gj">.</span></h1> <div class="user-tag svelte-x1i5gj">${escape_html(username)}</div></div></div> <div class="navigation-section svelte-x1i5gj"><div class="nav-group svelte-x1i5gj"><h3 class="svelte-x1i5gj"><span class="material-icons svelte-x1i5gj">dashboard</span> Main Panel</h3> <div class="nav-items svelte-x1i5gj"><button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Overview" })}><span class="material-icons svelte-x1i5gj">home</span> Overview</button> <button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Dashboard" })}><span class="material-icons svelte-x1i5gj">analytics</span> Dashboard</button> <button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Routing" })}><span class="material-icons svelte-x1i5gj">sync_alt</span> Routing</button> <button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Cashouts" })}><span class="material-icons svelte-x1i5gj">payments</span> Cashouts</button> <button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Domains" })}><span class="material-icons svelte-x1i5gj">language</span> Domains</button></div></div> <div class="nav-group svelte-x1i5gj"><h3 class="svelte-x1i5gj"><span class="material-icons svelte-x1i5gj">chat</span> Outreach Tools</h3> <div class="nav-items svelte-x1i5gj"><button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Mailer" })}><span class="material-icons svelte-x1i5gj">mail</span> Mailer</button> <button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "SMSPage" })}><span class="material-icons svelte-x1i5gj">sms</span> SMS</button></div></div> <div class="nav-group svelte-x1i5gj"><h3 class="svelte-x1i5gj"><span class="material-icons svelte-x1i5gj">manage_accounts</span> Account</h3> <div class="nav-items svelte-x1i5gj"><button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "Settings" })}><span class="material-icons svelte-x1i5gj">settings</span> Settings</button> <button${attr_class("nav-item svelte-x1i5gj", void 0, { "active": selectedElement === "myAccount" })}><span class="material-icons svelte-x1i5gj">person</span> My Account</button> <button class="nav-item logout svelte-x1i5gj"><span class="material-icons svelte-x1i5gj">logout</span> Logout</button></div></div></div></div> <main class="content-area svelte-x1i5gj"><div class="content-container svelte-x1i5gj">`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        {
          $$renderer2.push("<!--[!-->");
          {
            $$renderer2.push("<!--[!-->");
            {
              $$renderer2.push("<!--[!-->");
              {
                $$renderer2.push("<!--[!-->");
                {
                  $$renderer2.push("<!--[!-->");
                  {
                    $$renderer2.push("<!--[!-->");
                    {
                      $$renderer2.push("<!--[!-->");
                    }
                    $$renderer2.push(`<!--]-->`);
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></main></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Btmx66I5.js.map
