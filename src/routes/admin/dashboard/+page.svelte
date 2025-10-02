<script lang="ts">
    import "$lib/components/titleAnimation.sass";

    import bootstrap from "$lib/images/bootstrap.svg"

    import Overview from "$lib/components/adminElements/Overview.svelte"
    import Callers from "$lib/components/adminElements/Callers.svelte"
    import Settings from "$lib/components/adminElements/Settings.svelte"
    import Cashouts from "$lib/components/adminElements/Cashouts.svelte"
    import Seeds from "$lib/components/adminElements/Seeds.svelte"

    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { jwtDecode, type JwtPayload } from 'jwt-decode';
    import { fade } from 'svelte/transition';

    interface CustomJwtPayload extends JwtPayload {
        userName: string;
    }

    let selectedElement = $state("Overview");
    let authToken;
    let username = $state("Guest");
    let guild = $state("");

    let loading = $state(true);

    async function fetchGuild(username: string) {
        try {
            const response = await fetch(`/admin/api/getGuild?username=${username}`);
            const data = await response.json();
            if (response.ok) {
                guild = data.guild;
            } else {
                console.error("Error fetching guild:", data.error);
            }
        } catch (error) {
            console.error("Error fetching guild:", error);
        }
    }

    function setElement(element: string) {
        selectedElement = element;
    }

    function handleLogout() {
        goto('/logout');
    }

    onMount(async () => {
        // Server-side authentication is already handled in +layout.server.ts
        // If we reach this point, the user is authenticated
        
        // We need to get the username somehow - let's fetch it from the server
        try {
            const response = await fetch('/api/admin/user/me');
            if (response.ok) {
                const userData = await response.json();
                username = userData.userName;
                fetchGuild(username);
            } else {
                console.error('Failed to get admin user data');
                goto('/admin/login');
            }
        } catch (error) {
            console.error('Error fetching admin user data:', error);
            goto('/admin/login');
        }

        setTimeout(() => {
            selectedElement = "lol"
            selectedElement = "Overview"
            loading = false;
        }, 2000);
    });
</script>

{#if loading}
<div class="loading-screen {loading ? '' : 'hidden'}" transition:fade>
    <div class="loadingLogo">
        <img src={bootstrap} alt="Logo" />
        <div class="loading-text">
            <h1>Xekku Panel<span class="accent">.</span></h1>
            <p class="admin-badge">ADMIN PANEL</p>
        </div>
    </div>
</div>
{/if}

<div class="dashboard-container">
    <div class="sidebar">
        <div class="logo-section">
            <img src={bootstrap} alt="Logo" />
            <div class="brand">
                <h1>Xekku Panel<span class="accent">.</span></h1>
                <div class="admin-tag">ADMIN</div>
            </div>
        </div>

        <div class="navigation-section">
            <div class="nav-group">
                <h3>
                    <span class="material-icons">dashboard</span>
                    Control Panel
                </h3>
                <div class="nav-items">
                    <button 
                        class="nav-item" 
                        class:active={selectedElement === "Statistics"}
                        onclick={() => setElement("Statistics")}
                    >
                        <span class="material-icons">analytics</span>
                        Statistics
                    </button>
                    
                    <button 
                        class="nav-item" 
                        class:active={selectedElement === "Callers"}
                        onclick={() => setElement("Callers")}
                    >
                        <span class="material-icons">groups</span>
                        Callers
                    </button>
                    
                    <button 
                        class="nav-item" 
                        class:active={selectedElement === "Seeds"}
                        onclick={() => setElement("Seeds")}
                    >
                        <span class="material-icons">key</span>
                        Seeds
                    </button>
                    
                    <button 
                        class="nav-item" 
                        class:active={selectedElement === "Cashouts"}
                        onclick={() => setElement("Cashouts")}
                    >
                        <span class="material-icons">payments</span>
                        Cashouts
                    </button>
                </div>
            </div>

            <div class="nav-group">
                <h3>
                    <span class="material-icons">admin_panel_settings</span>
                    Administration
                </h3>
                <div class="nav-items">
                    <button 
                        class="nav-item" 
                        class:active={selectedElement === "Settings"}
                        onclick={() => setElement("Settings")}
                    >
                        <span class="material-icons">settings</span>
                        Settings
                    </button>
                    
                    <button class="nav-item logout" onclick={handleLogout}>
                        <span class="material-icons">logout</span>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </div>

    <main class="content-area">
        <div class="content-container" in:fade>
            {#if selectedElement === "Statistics"}
                <Overview {guild}/>
            {:else if selectedElement === "Callers"}
                <Callers {guild}/>
            {:else if selectedElement === "Settings"}
                <Settings {guild}/>
            {:else if selectedElement === "Cashouts"}
                <Cashouts {guild}/>
            {:else if selectedElement === "Seeds"}
                <Seeds {guild}/>
            {/if}
        </div>
    </main>
</div>

<style>
    .dashboard-container {
        display: flex;
        min-height: 100vh;
        background: #32322C;
    }

    .sidebar {
        width: 280px;
        background: #1a1a1a;
        border-right: 1px solid #39A04D;
        padding: 2em;
        display: flex;
        flex-direction: column;
        gap: 3em;
        position: relative;
    }

    .logo-section {
        display: flex;
        align-items: center;
        gap: 1em;
        padding-bottom: 1.5em;
        border-bottom: 1px solid rgba(76, 244, 133, 0.15);
    }

    .logo-section img {
        width: 40px;
        height: 40px;
        filter: drop-shadow(0 0 8px rgba(76, 244, 133, 0.3));
        transition: all 0.3s ease;
    }

    .brand {
        display: flex;
        flex-direction: column;
    }

    .brand h1 {
        font-size: 1.5em;
        color: #4CF485;
        margin: 0;
        line-height: 1;
    }

    .accent {
        color: #36F1CD;
    }

    .admin-tag {
        font-size: 0.7em;
        color: #39A04D;
        letter-spacing: 0.1em;
    }

    .navigation-section {
        display: flex;
        flex-direction: column;
        gap: 2em;
    }

    .nav-group h3 {
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #4CF485;
        opacity: 0.8;
        margin: 0 0 1em 0;
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .nav-group h3 .material-icons {
        font-size: 1.2em;
        color: #39A04D;
    }

    .nav-items {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.8em;
        padding: 1em 1.2em;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 0.8em;
        color: #4CF485;
        font-size: 0.9em;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        text-align: left;
    }

    .nav-item:hover {
        color: #32322C;
        background: #36F1CD;
        border-color: #13C4A3;
        transform: translateX(0.5em);
    }

    .nav-item.active {
        color: #32322C;
        background: #4CF485;
        border: 1px solid #39A04D;
        box-shadow: 0 4px 20px rgba(76, 244, 133, 0.2);
        transform: translateX(0.5em);
    }

    .nav-item .material-icons {
        font-size: 1.2em;
        color: #39A04D;
        transition: all 0.3s ease;
    }

    .nav-item:hover .material-icons {
        color: #13C4A3;
        transform: scale(1.1);
    }

    .logout {
        margin-top: 1em;
        border-top: 1px solid rgba(76, 244, 133, 0.1);
        padding-top: 1.5em;
    }

    .logout .material-icons {
        color: #ff4444 !important;
    }

    .logout:hover {
        color: #ff4444 !important;
        background: rgba(255, 68, 68, 0.05) !important;
        border-color: rgba(255, 68, 68, 0.2) !important;
    }

    .content-area {
        flex: 1;
        padding: 2em;
        overflow-y: auto;
    }

    .content-container {
        max-width: 1600px;
        margin: 0 auto;
    }

    /* Loading Screen */
    .loading-screen {
        position: fixed;
        inset: 0;
        background: #32322C;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .loadingLogo {
        display: flex;
        align-items: center;
        gap: 1em;
    }

    .loadingLogo img {
        width: 60px;
        height: 60px;
        animation: pulse 2s infinite;
        filter: drop-shadow(0 0 12px rgba(76, 244, 133, 0.4));
    }

    .loading-text h1 {
        font-size: 2.5em;
        color: #4CF485;
        margin: 0;
    }

    .admin-badge {
        font-size: 0.8em;
        color: #39A04D;
        letter-spacing: 0.2em;
        margin: 0;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 12px rgba(76, 244, 133, 0.4));
        }
        50% {
            transform: scale(1.1) rotate(180deg);
            filter: drop-shadow(0 0 20px rgba(76, 244, 133, 0.6));
        }
    }
</style>
