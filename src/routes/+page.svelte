<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    export let data;
    
    let isLoading = false;
    
    // Get data from server-side load function
    const { targetUser, hasIdParam } = data;
    
    onMount(() => {
        // If no ID parameter, redirect to login
        if (!hasIdParam) {
            goto('/login');
        }
    });
</script>

<svelte:head>
    <title>Welcome | Xekku Panel</title>
    <meta name="description" content="Welcome to Xekku Panel" />
</svelte:head>

<main class="container">
    {#if isLoading}
        <div class="loading">
            <h1>Loading...</h1>
        </div>
    {:else if !hasIdParam}
        <div class="error">
            <h1>Invalid Link</h1>
            <p>This link appears to be invalid or incomplete.</p>
            <button on:click={() => goto('/login')}>Go to Login</button>
        </div>
    {:else if targetUser}
        <div class="welcome">
            <h1>Welcome to Xekku Panel</h1>
            <p>Connected via: <strong>{targetUser}</strong></p>
            
            <div class="actions">
                <button on:click={() => goto('/login')}>Login</button>
                <button on:click={() => goto('/admin/login')}>Admin Login</button>
            </div>
            
            <!-- You can add more content here based on the targetUser -->
            <div class="info">
                <p>This is a tracking link. You can customize this page to show:</p>
                <ul>
                    <li>Custom content for different users</li>
                    <li>Tracking information</li>
                    <li>Redirect to specific pages</li>
                    <li>Capture user data</li>
                </ul>
            </div>
        </div>
    {:else}
        <div class="error">
            <h1>Invalid Link Format</h1>
            <p>The link format is not recognized.</p>
            <button on:click={() => goto('/login')}>Go to Login</button>
        </div>
    {/if}
</main>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }
    
    .loading, .error, .welcome {
        padding: 2rem;
        border-radius: 8px;
        background: #f5f5f5;
        margin: 2rem 0;
    }
    
    .error {
        background: #fee;
        border: 1px solid #fcc;
    }
    
    .welcome {
        background: #f0f8ff;
        border: 1px solid #cce7ff;
    }
    
    .actions {
        margin: 2rem 0;
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: #007acc;
        color: white;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    button:hover {
        background: #005c99;
    }
    
    .info {
        margin-top: 2rem;
        padding: 1rem;
        background: #fff;
        border-radius: 4px;
        text-align: left;
    }
    
    ul {
        margin: 1rem 0;
        padding-left: 2rem;
    }
</style>
