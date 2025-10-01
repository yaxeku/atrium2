<script lang="ts">
    // STYLE IMPORTS
    import "$lib/components/titleAnimation.sass"
    import "$lib/components/loginBackground.css"

    import { goto } from '$app/navigation';

    import bootstrap from "$lib/images/bootstrap.svg"
    import Narc from "$lib/images/narc.png"


    
    let userName = "";
    let passWord = "";
    let invalidLoginBool = false;
    let currentErrorMessage = "";

    let invalidCredentials: string[] = [];
    let errorMessages = [
        "Nope, not quite. Try again, champ!",
        "Uh-oh! Your username and password don’t get along.",
        "Whoops! That didn’t work. Did you forget your password?",
        "Looks like your login went on vacation. Try again!"
    ]
    let errorMsgIndex = 0;

    async function handleLogin(event: SubmitEvent) {
        event.preventDefault();
        try {
            currentErrorMessage = '';
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userName, passWord })
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                localStorage.setItem('authToken', data.token);
                goto('/dashboard');
            } else {
                // Failed login
                errorMsgIndex = (errorMsgIndex + 1) % errorMessages.length;
                currentErrorMessage = data.error || errorMessages[errorMsgIndex];
            }
        } catch (error) {
            console.error('Login error:', error);
            currentErrorMessage = 'Failed to connect to the server. Please try again.';
        }
    }
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, passWord }),
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('authToken', token);
            goto('/dashboard');
        } else {
            const { error } = await response.json();

            if (errorMsgIndex > errorMessages.length - 1) {
                errorMsgIndex = 0;
            }

            currentErrorMessage = errorMessages[errorMsgIndex];
            errorMsgIndex++;

            invalidCredentials = [userName, passWord];
        }
    }

    $effect(() => {
        if (userName) {
            if (!invalidCredentials.includes(userName)) {
                console.log("sigma")
                if (currentErrorMessage !== "") {
                    currentErrorMessage = ""
                }
            }
        }
        if (passWord) {
            if (!invalidCredentials.includes(passWord)) {
                if (currentErrorMessage !== "") {
                    currentErrorMessage = ""
                }
            }
        } 
    })
</script>

<div class="contentbox">
        <div class="el">
        </div>
        <div class="loginbox">
            <div class="titleBox">
                <h2>Welcome To</h2>
                <div class="logo">
                    <img src={bootstrap} height="40px" width="40px" alt="logo">
                    <h1 class="white">Xekku Panel.</h1>
                </div>
            </div>
            <div class="loginform">
                <form onsubmit={(e) => { e.preventDefault(); handleLogin(e); }}>
                    <label for="username">Username</label>
                    <input id="username" bind:value={userName} placeholder="Your Username" type="text">
                    <label for="password">Password</label>
                    <input id="password" bind:value={passWord} placeholder="Your Password" type="password">
                    {#if currentErrorMessage !== ""}
                        <p class="redText">{currentErrorMessage}</p>
                    {/if}
                    <button type="submit">Login</button>
                </form>
            </div>
            <p>Panel Version: <span class="darkText">1.0.1</span></p>
        </div>
</div>

<style>
    .logo {
        display: flex;
        flex-direction: row;
        gap: 0.5em;
        margin-top: 0.5em;
        margin-bottom: 2em;
    }

    .contentbox {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100%;
        background-color: #32322C;
    }
    
    .loginbox {
        position: fixed;
        width: 20em;
        padding: 4em;
        border: 3px solid #39A04D;
        background-color: #1a1a1a;
        color: #4CF485;
        border-radius: 1em;
    }

    .loginbox label {
        color: #4CF485;
        opacity: 0.8;
    }

    .loginbox button {
        margin-bottom: 1em;
        background: #32322C;
        color: #4CF485;
        border: 1px solid #39A04D;
        padding: 0.8em;
        border-radius: 0.5em;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1em;
    }

    .loginbox button:hover {
        background: #39A04D;
        color: #32322C;
        box-shadow: 0 0 10px #4CF485;
    }

    .loginbox p {
        margin-top: 0.5em;
        color: #4CF485;
        opacity: 0.8;
    }

    .loginbox .redText {
        color: #ff4444;
    }

    .loginform form {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }

    .loginform input {
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid #39A04D;
        color: #4CF485;
    }

    .loginform button {
        margin-top: 1em;
    }

    .titleBox {
        margin-bottom: 1em;
    }

    .titleBox h2 {
        color: #4CF485;
    }

    .white {
        color: #4CF485 !important;
    }

    .darkText {
        color: #13C4A3;
    }
</style>
