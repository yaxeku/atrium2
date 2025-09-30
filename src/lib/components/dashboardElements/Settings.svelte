<script lang="ts">
    export let username: string;
    let selectedFile: File | null = null;
    let audioUrl: string | null = null;
    let audio: HTMLAudioElement | null = null;
    let soundName: string = '';
    let uploadStatus: string = '';
    let botToken: string = '';
    let chatId: string = '';

    async function updateTelegramSettings() {
        try {
            const response = await fetch('/api/guild/updateSettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    guild: 'default', // Replace with actual guild if available
                    setting: 'telegram',
                    value: {
                        token: botToken,
                        chatId: chatId
                    }
                })
            });

            if (response.ok) {
                alert('Telegram settings updated successfully!');
            } else {
                alert('Failed to update Telegram settings');
            }
        } catch (error) {
            console.error('Error updating Telegram settings:', error);
            alert('Error updating Telegram settings');
        }
    }

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            selectedFile = input.files[0];
            // Create object URL for preview
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            audioUrl = URL.createObjectURL(input.files[0]);
            audio = new Audio(audioUrl);
        }
    }

    function playPreview() {
        if (audio) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    }

    async function uploadSound() {
        if (!selectedFile || !soundName.trim()) {
            uploadStatus = 'Please select a file and enter a name';
            return;
        }

        const formData = new FormData();
        formData.append('sound', selectedFile);
        formData.append('name', soundName);
        formData.append('username', username);

        try {
            const response = await fetch('/api/upload-sound', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                uploadStatus = 'Sound uploaded successfully!';
                // Clear form
                selectedFile = null;
                soundName = '';
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    audioUrl = null;
                }
            } else {
                uploadStatus = 'Failed to upload sound';
            }
        } catch (error) {
            console.error('Error uploading sound:', error);
            uploadStatus = 'Error uploading sound';
        }
    }

    // Cleanup object URL when component is destroyed
    import { onDestroy } from 'svelte';
    onDestroy(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    });
</script>

<div class="settings">
    <div class="intro">
        <p>You are able to change your settings here.</p>
        <h1 class="white">Settings</h1>
    </div>
    <div class="settings-grid">
        <div class="container">
            <h2 class="white">Telegram Settings</h2>
            <p>You can setup the telegram bot notifications here. The notifications are shown upon connection and receiving the seed.</p>
            <label for="bot-token">Telegram Bot Token</label>
            <input id="bot-token" bind:value={botToken}>
            <label for="chat-id">Telegram Chat ID</label>
            <input id="chat-id" bind:value={chatId}>
            <button on:click={updateTelegramSettings}>Update</button>
        </div>
        <div class="container">
            <h2 class="white">Notification Sound</h2>
            <p>Upload a custom notification sound (.mp3 format)</p>
            <label for="sound-name">Sound Name</label>
            <input type="text" id="sound-name" bind:value={soundName} placeholder="Enter a name for your sound">
            <div class="file-input-wrapper">
                <label for="sound-file" class="file-label">Choose File</label>
                <input id="sound-file" type="file" accept=".mp3" on:change={handleFileSelect}>
            </div>
            {#if selectedFile}
                <div class="sound-preview">
                    <p class="file-name">Selected file: {selectedFile.name}</p>
                    <button class="preview-btn" on:click={playPreview}>
                        <span class="material-icons">play_arrow</span> Play Preview
                    </button>
                </div>
            {/if}
            <button on:click={uploadSound}>Upload Sound</button>
            {#if uploadStatus}
                <p class="status-message">{uploadStatus}</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .intro {
        padding-bottom: 1em;
        border-bottom: 1px solid #39A04D;
        margin-bottom: 2em;
    }
    
    .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2em;
    }

    .container {
        display: flex;
        flex-direction: column;
        padding: 1em;
        border-radius: 1em;
        gap: 1em;
        border: 1px solid #39A04D;
        background: #1a1a1a;
    }

    .file-input-wrapper {
        position: relative;
    }

    .file-label {
        display: inline-block;
        padding: 0.5em 1em;
        background: rgba(76, 244, 133, 0.2);
        border: 1px solid #39A04D;
        border-radius: 0.5em;
        cursor: pointer;
        transition: background 0.2s;
        color: #4CF485;
    }

    .file-label:hover {
        background: rgba(76, 244, 133, 0.3);
    }

    input[type="file"] {
        position: absolute;
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        z-index: -1;
    }

    .file-name {
        font-size: 0.9em;
        opacity: 0.8;
        color: #4CF485;
    }

    .sound-preview {
        display: flex;
        align-items: center;
        gap: 1em;
    }

    .preview-btn {
        display: flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.5em 1em;
        background: rgba(76, 244, 133, 0.2);
        border: 1px solid #39A04D;
        border-radius: 0.5em;
        color: #4CF485;
    }

    .preview-btn:hover {
        background: rgba(76, 244, 133, 0.3);
    }

    .status-message {
        text-align: center;
        padding: 0.5em;
        border-radius: 0.5em;
        background: rgba(0,0,0,0.2);
        color: #4CF485;
    }

    .white {
        color: #4CF485;
    }

    p {
        color: #888;
    }

    label {
        color: #888;
    }

    input {
        background: rgba(76, 244, 133, 0.1);
        border: 1px solid #39A04D;
        color: #4CF485;
        border-radius: 0.5em;
        padding: 0.8em;
    }

    button {
        background: #39A04D;
        border: none;
        color: #32322C;
        padding: 0.8em;
        border-radius: 0.5em;
        cursor: pointer;
    }
</style>
