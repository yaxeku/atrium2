<script lang="ts">
    import { fade, slide, scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { onMount } from 'svelte';

    export let username: string;
    export let guild: string;
    
    import pageConfigurations from '$lib/data/pageConfigurations.json';
    
    interface RouteStep {
        pageId: string;
        delay: number;
    }

    interface RoutePreset {
        id: string;
        name: string;
        steps: RouteStep[];
    }

    let presets: RoutePreset[] = [];
    let currentSteps: RouteStep[] = [];
    let presetName: string = '';
    let editingPreset: RoutePreset | null = null;

    function getLocalStorageKey() {
        return `routePresets_${username}_${guild}`;
    }

    onMount(() => {
        const savedPresets = localStorage.getItem(getLocalStorageKey());
        if (savedPresets) {
            presets = JSON.parse(savedPresets);
        }
    });

    function updateLocalStorage() {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(presets));
    }

    type PageConfig = {
        groups: Record<string, {
            icon: string;
            pages: Record<string, {
                icon: string;
                description: string;
                dataCollected: string;
                imagePath: string;
            }>;
        }>;
    };

    let availablePages = Object.entries((pageConfigurations as PageConfig).groups).flatMap(([groupName, group]) => 
        Object.entries(group.pages).map(([pageId, page]) => ({
            id: pageId,
            name: pageId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            icon: page.icon
        }))
    );

    function addStep() {
        currentSteps = [...currentSteps, { pageId: availablePages[0].id, delay: 5 }];
    }

    function removeStep(index: number) {
        currentSteps = currentSteps.filter((_, i) => i !== index);
    }

    function moveStep(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index > 0) {
            [currentSteps[index], currentSteps[index - 1]] = [currentSteps[index - 1], currentSteps[index]];
            currentSteps = [...currentSteps];
        } else if (direction === 'down' && index < currentSteps.length - 1) {
            [currentSteps[index], currentSteps[index + 1]] = [currentSteps[index + 1], currentSteps[index]];
            currentSteps = [...currentSteps];
        }
    }

    function savePreset() {
        if (!presetName.trim()) return;

        if (editingPreset?.id) {
            const editId = editingPreset.id;
            presets = presets.map(p => 
                p.id === editId
                    ? { ...p, name: presetName, steps: currentSteps }
                    : p
            );
        } else {
            presets = [...presets, {
                id: crypto.randomUUID(),
                name: presetName,
                steps: currentSteps
            }];
        }

        resetForm();
        updateLocalStorage();
    }

    function editPreset(preset: RoutePreset) {
        editingPreset = preset;
        presetName = preset.name;
        currentSteps = [...preset.steps];
    }

    function deletePreset(id: string) {
        presets = presets.filter(p => p.id !== id);
        updateLocalStorage();
    }

    function resetForm() {
        presetName = '';
        currentSteps = [];
        editingPreset = null;
    }
</script>

<div class="routing-container" in:fade>
    <div class="intro">
        <div class="intro-content">
            <p>Create and manage your routing sequences</p>
            <h1 class="white">Routing</h1>
        </div>
        <div class="intro-stats">
            <div class="stat">
                <span class="material-icons">route</span>
                <div class="stat-content">
                    <p>Active Presets</p>
                    <h3>{presets.length}</h3>
                </div>
            </div>
            <div class="stat">
                <span class="material-icons">pages</span>
                <div class="stat-content">
                    <p>Available Pages</p>
                    <h3>{availablePages.length}</h3>
                </div>
            </div>
        </div>
    </div>

    <div class="content-grid">
        <div class="left-panel">
            <div class="builder-form">
                <div class="info-section">
                    <div class="info-header">
                        <span class="material-icons">edit</span>
                        <h3>Route Builder</h3>
                    </div>
                    <div class="input-wrapper">
                        <input
                            type="text"
                            bind:value={presetName}
                            placeholder="Enter preset name"
                            class:filled={presetName?.trim()}
                        />
                        {#if presetName?.trim()}
                            <span class="material-icons check-icon" in:scale={{ duration: 200 }}>
                                check_circle
                            </span>
                        {/if}
                    </div>
                </div>

                <div class="steps-container">
                    {#if currentSteps.length === 0}
                        <div class="empty-state" transition:fade>
                            <span class="material-icons">route</span>
                            <p>Add pages to create your routing sequence</p>
                        </div>
                    {:else}
                        {#each currentSteps as step, index (index)}
                            <div
                                class="step-card"
                                animate:flip
                                transition:slide
                            >
                                <div class="step-number">{index + 1}</div>
                                <div class="step-content">
                                    <div class="page-select">
                                        <span class="material-icons">{availablePages.find(p => p.id === step.pageId)?.icon || 'web'}</span>
                                        <select bind:value={step.pageId}>
                                            {#each availablePages as page}
                                                <option value={page.id}>{page.name}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="delay-input">
                                        <span class="material-icons">timer</span>
                                        <input
                                            type="number"
                                            bind:value={step.delay}
                                            min="0"
                                            placeholder="Delay"
                                        />
                                        <span class="unit">seconds</span>
                                    </div>
                                </div>
                                <div class="step-actions">
                                    <button
                                        class="icon-button"
                                        on:click={() => moveStep(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <span class="material-icons">arrow_upward</span>
                                    </button>
                                    <button
                                        class="icon-button"
                                        on:click={() => moveStep(index, 'down')}
                                        disabled={index === currentSteps.length - 1}
                                    >
                                        <span class="material-icons">arrow_downward</span>
                                    </button>
                                    <button
                                        class="icon-button delete"
                                        on:click={() => removeStep(index)}
                                    >
                                        <span class="material-icons">delete</span>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>

                <button class="add-step-button" on:click={addStep}>
                    <span class="material-icons">add_circle</span>
                    Add Page to Sequence
                </button>

                <div class="form-actions">
                    <button class="secondary" on:click={resetForm}>
                        <span class="material-icons">close</span>
                        Cancel
                    </button>
                    <button 
                        class="primary" 
                        on:click={savePreset} 
                        disabled={!presetName || currentSteps.length === 0}
                    >
                        <span class="material-icons">{editingPreset ? 'save' : 'add'}</span>
                        {editingPreset ? 'Update' : 'Save'} Preset
                    </button>
                </div>
            </div>
        </div>

        <div class="right-panel">
            <div class="info-header">
                <span class="material-icons">bookmark</span>
                <h3>Saved Presets</h3>
            </div>
            <div class="presets-container">
                {#if presets.length === 0}
                    <div class="empty-state" transition:fade>
                        <span class="material-icons">bookmarks</span>
                        <p>No saved presets yet</p>
                    </div>
                {:else}
                    {#each presets as preset (preset.id)}
                        <div class="preset-card" transition:slide>
                            <div class="preset-header">
                                <div class="preset-info">
                                    <span class="material-icons">route</span>
                                    <h4>{preset.name}</h4>
                                </div>
                                <div class="preset-actions">
                                    <button class="icon-button" on:click={() => editPreset(preset)}>
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button class="icon-button delete" on:click={() => deletePreset(preset.id)}>
                                        <span class="material-icons">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div class="preset-steps">
                                {#each preset.steps as step, index}
                                    <div class="preset-step">
                                        <div class="step-info">
                                            <span class="step-number">{index + 1}</span>
                                            <span class="material-icons">{availablePages.find(p => p.id === step.pageId)?.icon || 'web'}</span>
                                            <span class="step-name">
                                                {availablePages.find(p => p.id === step.pageId)?.name}
                                            </span>
                                        </div>
                                        <div class="step-delay">
                                            <span class="material-icons">timer</span>
                                            {step.delay}s
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .routing-container {
        padding: 2em;
    }

    .intro {
        padding-bottom: 1.5em;
        border-bottom: 1px solid #39A04D;
        margin-bottom: 2em;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .intro-stats {
        display: flex;
        gap: 2em;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 1em;
        padding: 1em 1.5em;
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 0.8em;
        transition: all 0.3s ease;
    }

    .stat:hover {
        transform: translateY(-2px);
        border-color: #4CF485;
        box-shadow: 0 4px 20px rgba(76, 244, 133, 0.2);
    }

    .stat .material-icons {
        color: #4CF485;
        font-size: 1.5em;
    }

    .stat-content p {
        margin: 0;
        font-size: 0.8em;
        color: #8b8b8b;
    }

    .stat-content h3 {
        margin: 0;
        font-size: 1.2em;
        color: #4CF485;
    }

    .content-grid {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 2em;
    }

    .left-panel, .right-panel {
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 1em;
        padding: 1.5em;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    .builder-form {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
    }

    .info-section {
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 0.8em;
        padding: 1.2em;
        transition: all 0.3s ease;
        width: 100%;
        box-sizing: border-box;
    }

    .info-header {
        display: flex;
        align-items: center;
        gap: 0.8em;
        margin-bottom: 1em;
        color: #4CF485;
    }

    .info-header h3 {
        margin: 0;
        font-size: 1.1em;
        font-weight: 500;
        color: #4CF485;
    }

    .input-wrapper {
        position: relative;
        width: 100%;
    }

    input[type="text"]:focus {
        outline: none;
        border-color: #4CF485;
        box-shadow: 0 0 15px rgba(76, 244, 133, 0.2);
    }

    input[type="text"].filled {
        border-color: #4CF485;
    }

    .check-icon {
        position: absolute;
        right: 0.8em;
        top: 50%;
        transform: translateY(-50%);
        color: #4CAF50;
    }

    .steps-container {
        display: flex;
        flex-direction: column;
        gap: 1em;
        max-height: 50vh;
        overflow-y: auto;
        padding-right: 0.5em;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1em;
        padding: 3em;
        color: rgba(255, 255, 255, 0.3);
        text-align: center;
    }

    .empty-state .material-icons {
        font-size: 3em;
    }

    .step-card {
        display: flex;
        align-items: center;
        gap: 1em;
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 0.8em;
        padding: 1em;
        transition: all 0.3s ease;
    }

    .step-card:hover {
        transform: translateY(-2px);
        border-color: #4CF485;
        box-shadow: 0 4px 20px rgba(76, 244, 133, 0.2);
    }

    .step-number {
        background: #39A04D;
        color: #32322C;
        width: 2em;
        height: 2em;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 500;
    }

    .step-content {
        flex: 1;
        display: flex;
        gap: 1em;
        align-items: center;
    }

    .page-select {
        flex: 2;
        display: flex;
        align-items: center;
        gap: 0.5em;
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 0.5em;
        padding: 0.5em;
        position: relative;
    }

    .page-select::after {
        content: 'expand_more';
        font-family: 'Material Icons';
        position: absolute;
        right: 0.5em;
        color: #4CF485;
        pointer-events: none;
    }

    .page-select select {
        flex: 1;
        background: none;
        border: none;
        color: #4CF485;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        padding-right: 2em;
    }

    .page-select select option {
        background: #1a1a1a;
        color: #4CF485;
        padding: 0.8em;
    }

    .page-select .material-icons {
        color: #4CF485;
    }

    .delay-input {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.5em;
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 0.5em;
        padding: 0.5em;
    }

    .delay-input .material-icons {
        color: #4CF485;
    }

    .delay-input input {
        width: 60px;
        background: none;
        border: none;
        color: #4CF485;
        font-family: 'DM Sans', sans-serif;
        text-align: center;
    }

    .delay-input input:focus {
        outline: none;
    }

    .delay-input .unit {
        color: #8b8b8b;
        font-size: 0.9em;
    }

    .step-actions {
        display: flex;
        gap: 0.5em;
    }

    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2em;
        height: 2em;
        background: none;
        border: 1px solid #39A04D;
        border-radius: 0.5em;
        color: #4CF485;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .icon-button:hover:not(:disabled) {
        background: rgba(76, 244, 133, 0.1);
        transform: translateY(-2px);
    }

    .icon-button.delete:hover {
        background: rgba(255, 0, 0, 0.1);
        color: #ff4444;
        border-color: rgba(255, 0, 0, 0.3);
    }

    .icon-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .add-step-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        padding: 1em;
        background: rgba(76, 244, 133, 0.1);
        border: 2px dashed #39A04D;
        border-radius: 0.8em;
        color: #4CF485;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .add-step-button:hover {
        background: rgba(76, 244, 133, 0.2);
        border-color: #4CF485;
        transform: translateY(-2px);
    }

    .form-actions {
        display: flex;
        gap: 1em;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        padding: 0.8em 1.5em;
        border-radius: 0.8em;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    button.primary {
        flex: 2;
        background: #39A04D;
        border: none;
        color: #32322C;
    }

    button.primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(76, 244, 133, 0.4);
        background: #4CF485;
    }

    button.secondary {
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #39A04D;
        color: #4CF485;
    }

    button.secondary:hover {
        background: #1a1a1a;
        border-color: #4CF485;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .presets-container {
        display: flex;
        flex-direction: column;
        gap: 1em;
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 0.5em;
    }

    .preset-card {
        background: rgba(76, 244, 133, 0.1);
        border: 1px solid #39A04D;
        border-radius: 0.8em;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .preset-card:hover {
        transform: translateY(-2px);
        border-color: #4CF485;
        box-shadow: 0 4px 20px rgba(76, 244, 133, 0.2);
    }

    .preset-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1em;
        background: #1a1a1a;
        border-bottom: 1px solid #39A04D;
    }

    .preset-info {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .preset-info h4 {
        margin: 0;
        color: #4CF485;
        font-weight: 500;
    }

    .preset-info .material-icons {
        color: #4CF485;
    }

    .preset-steps {
        padding: 1em;
        display: flex;
        flex-direction: column;
        gap: 0.8em;
    }

    .preset-step {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.8em;
        background: #1a1a1a;
        border: 1px solid #39A04D;
        border-radius: 0.5em;
    }

    .step-info {
        display: flex;
        align-items: center;
        gap: 0.8em;
    }

    .step-info .material-icons {
        color: #4CF485;
        font-size: 1.2em;
    }

    .step-name {
        color: #4CF485;
    }

    .step-delay {
        display: flex;
        align-items: center;
        gap: 0.4em;
        color: #8b8b8b;
        font-size: 0.9em;
    }

    .step-delay .material-icons {
        font-size: 1em;
    }

    /* Scrollbar Styling */
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(76, 244, 133, 0.3);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(76, 244, 133, 0.5);
    }
</style>
