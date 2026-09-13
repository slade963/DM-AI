<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>DM-AI</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background:
        radial-gradient(circle at top, rgba(139,92,246,.22), transparent 35%),
        linear-gradient(135deg, #090714, #120c20 45%, #08060d);
    color: #fff;
    min-height: 100vh;
}

button,
input,
textarea {
    font: inherit;
}

button {
    cursor: pointer;
}

.app {
    min-height: 100vh;
    display: flex;
}

/* =========================
   SIDEBAR
========================= */

.sidebar {
    width: 270px;
    min-height: 100vh;
    background: rgba(10,8,18,.94);
    border-right: 1px solid rgba(139,92,246,.3);
    padding: 22px;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
}

.logo {
    font-size: 27px;
    font-weight: 900;
    color: #c4a7ff;
    margin-bottom: 5px;
}

.logo-sub {
    color: #8e849d;
    font-size: 13px;
    margin-bottom: 25px;
}

.new-campaign {
    width: 100%;
    border: 1px solid #8b5cf6;
    background: linear-gradient(135deg,#7c3aed,#5b21b6);
    color: white;
    padding: 13px;
    border-radius: 12px;
    font-weight: 800;
    margin-bottom: 20px;
}

.new-campaign:hover {
    filter: brightness(1.15);
}

.sidebar-title {
    color: #80758e;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1.5px;
    margin: 20px 0 10px;
}

.campaign-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.campaign-item {
    padding: 11px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,.025);
    border: 1px solid transparent;
    color: #cfc7d8;
    cursor: pointer;
    font-size: 13px;
}

.campaign-item:hover,
.campaign-item.active {
    background: rgba(139,92,246,.15);
    border-color: rgba(139,92,246,.4);
    color: white;
}

/* =========================
   MAIN
========================= */

.main {
    margin-left: 270px;
    width: calc(100% - 270px);
    min-height: 100vh;
    padding: 28px;
}

.topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.title-area h1 {
    margin: 0;
    font-size: 30px;
}

.title-area p {
    color: #958aa2;
    margin: 7px 0 0;
}

/* =========================
   CHAT
========================= */

.workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: 22px;
}

.panel {
    background: rgba(17,13,28,.86);
    border: 1px solid rgba(139,92,246,.25);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 15px 50px rgba(0,0,0,.25);
}

.panel-header {
    padding: 17px 20px;
    border-bottom: 1px solid rgba(255,255,255,.07);
    font-weight: 800;
}

.chat {
    min-height: 620px;
    display: flex;
    flex-direction: column;
}

.messages {
    flex: 1;
    padding: 22px;
    overflow-y: auto;
    max-height: 650px;
}

.message {
    margin-bottom: 18px;
}

.message.user {
    display: flex;
    justify-content: flex-end;
}

.message-bubble {
    max-width: 85%;
    padding: 13px 16px;
    border-radius: 14px;
    line-height: 1.55;
    white-space: pre-wrap;
}

.message.user .message-bubble {
    background: linear-gradient(135deg,#7c3aed,#5b21b6);
}

.message.ai .message-bubble {
    background: rgba(255,255,255,.055);
    border: 1px solid rgba(255,255,255,.07);
}

.composer {
    padding: 15px;
    border-top: 1px solid rgba(255,255,255,.07);
}

.composer textarea {
    width: 100%;
    min-height: 85px;
    resize: vertical;
    background: #0b0911;
    color: white;
    border: 1px solid rgba(139,92,246,.3);
    border-radius: 12px;
    padding: 13px;
    outline: none;
}

.composer textarea:focus {
    border-color: #8b5cf6;
}

.composer-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.generate {
    background: linear-gradient(135deg,#8b5cf6,#6d28d9);
    border: none;
    color: white;
    padding: 12px 20px;
    border-radius: 11px;
    font-weight: 800;
}

.generate:disabled {
    opacity: .55;
    cursor: not-allowed;
}

/* =========================
   RIGHT PANEL
========================= */

.side-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.card {
    background: rgba(17,13,28,.86);
    border: 1px solid rgba(139,92,246,.25);
    border-radius: 18px;
    padding: 18px;
}

.card h3 {
    margin-top: 0;
    color: #d5c2ff;
}

.stat {
    display: flex;
    justify-content: space-between;
    padding: 9px 0;
    border-bottom: 1px solid rgba(255,255,255,.05);
    color: #bdb3c8;
}

.stat:last-child {
    border-bottom: none;
}

/* =========================
   CAMPAIGN OUTPUT
========================= */

.campaign-output {
    margin-top: 22px;
}

.hero {
    background:
        linear-gradient(135deg,rgba(124,58,237,.25),rgba(17,13,28,.95)),
        radial-gradient(circle at top right,rgba(139,92,246,.25),transparent 40%);
    border: 1px solid rgba(139,92,246,.35);
    border-radius: 18px;
    padding: 25px;
    margin-bottom: 18px;
}

.hero h2 {
    margin: 0 0 10px;
    font-size: 29px;
}

.hero p {
    color: #c0b5c9;
    line-height: 1.6;
}

.section {
    background: rgba(17,13,28,.8);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 18px;
}

.section h2 {
    margin-top: 0;
    color: #d4c1ff;
}

.section h3 {
    color: #b99cff;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
    gap: 13px;
}

.info-card {
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 13px;
    padding: 15px;
}

.info-card h3 {
    margin-top: 0;
    color: #d8c9ff;
}

.info-card p {
    color: #bdb4c5;
    line-height: 1.5;
}

.tag {
    display: inline-block;
    background: rgba(139,92,246,.16);
    border: 1px solid rgba(139,92,246,.3);
    color: #cbb5ff;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 11px;
    margin: 3px;
}

/* =========================
   CHOICES
========================= */

.choices {
    display: grid;
    grid-template-columns: repeat(2,1fr);
    gap: 12px;
}

.choice {
    background: rgba(139,92,246,.09);
    border: 1px solid rgba(139,92,246,.3);
    border-radius: 13px;
    padding: 15px;
    color: white;
    text-align: left;
    transition: .2s;
}

.choice:hover {
    transform: translateY(-2px);
    background: rgba(139,92,246,.18);
    border-color: #8b5cf6;
}

.choice strong {
    display: block;
    color: #d6c2ff;
    margin-bottom: 6px;
}

.choice span {
    color: #aaa0b2;
    font-size: 13px;
    line-height: 1.4;
}

/* =========================
   EMPTY
========================= */

.empty {
    padding: 55px 20px;
    text-align: center;
    color: #84798e;
}

.empty-icon {
    font-size: 55px;
    margin-bottom: 12px;
}

/* =========================
   RESPONSIVE
========================= */

@media(max-width:1000px) {
    .sidebar {
        width: 220px;
    }

    .main {
        margin-left: 220px;
        width: calc(100% - 220px);
    }

    .workspace {
        grid-template-columns: 1fr;
    }
}

@media(max-width:700px) {
    .sidebar {
        position: relative;
        width: 100%;
        min-height: auto;
    }

    .main {
        margin-left: 0;
        width: 100%;
        padding: 15px;
    }

    .app {
        display: block;
    }

    .choices {
        grid-template-columns: 1fr;
    }
}
</style>
</head>

<body>

<div class="app">

    <!-- SIDEBAR -->

    <aside class="sidebar">

        <div class="logo">
            ⚔️ DM-AI 🛡️
        </div>

        <div class="logo-sub">
            Your AI Dungeon Master
        </div>

        <button class="new-campaign" onclick="newCampaign()">
            + New Campaign
        </button>

        <div class="sidebar-title">
            Campaigns
        </div>

        <div id="campaignList" class="campaign-list"></div>

    </aside>


    <!-- MAIN -->

    <main class="main">

        <div class="topbar">

            <div class="title-area">
                <h1 id="campaignTitle">
                    DM-AI
                </h1>

                <p>
                    Build worlds. Create legends. Roll the dice.
                </p>
            </div>

        </div>


        <div class="workspace">

            <!-- CHAT -->

            <section class="panel chat">

                <div class="panel-header">
                    🧙 DM Chat
                </div>

                <div
                    id="messages"
                    class="messages"
                ></div>

                <div class="composer">

                    <textarea
                        id="prompt"
                        placeholder="Describe your adventure..."
                    ></textarea>

                    <div class="composer-row">

                        <button
                            id="generateButton"
                            class="generate"
                            onclick="generateCampaign()"
                        >
                            Generate ⚔️
                        </button>

                    </div>

                </div>

            </section>


            <!-- RIGHT SIDE -->

            <aside class="side-panel">

                <div class="card">

                    <h3>⚔️ Campaign Tools</h3>

                    <div class="stat">
                        <span>Characters</span>
                        <strong id="characterCount">0</strong>
                    </div>

                    <div class="stat">
                        <span>NPCs</span>
                        <strong id="npcCount">0</strong>
                    </div>

                    <div class="stat">
                        <span>Monsters</span>
                        <strong id="monsterCount">0</strong>
                    </div>

                    <div class="stat">
                        <span>Locations</span>
                        <strong id="locationCount">0</strong>
                    </div>

                    <div class="stat">
                        <span>Quests</span>
                        <strong id="questCount">0</strong>
                    </div>

                </div>


                <div class="card">

                    <h3>🛡️ Quick Start</h3>

                    <p style="color:#aaa0b2;line-height:1.5;">
                        Tell DM-AI what kind of adventure
                        you want and it will build the world
                        around your idea.
                    </p>

                    <button
                        class="choice"
                        style="width:100%;margin-top:8px;"
                        onclick="useExample('Create a dark fantasy campaign where an entire village mysteriously disappears.')"
                    >
                        <strong>🌑 Dark Fantasy</strong>
                        <span>Start a mysterious adventure.</span>
                    </button>

                    <button
                        class="choice"
                        style="width:100%;margin-top:8px;"
                        onclick="useExample('Create an epic fantasy campaign involving an ancient dragon and a forgotten kingdom.')"
                    >
                        <strong>🐉 Dragon Quest</strong>
                        <span>Build an epic fantasy campaign.</span>
                    </button>

                </div>

            </aside>

        </div>


        <!-- OUTPUT -->

        <div
            id="campaignOutput"
            class="campaign-output"
        ></div>

    </main>

</div>


<script>

/* =========================================
   STATE
========================================= */

let campaigns = [];

let currentCampaign = null;

let isGenerating = false;


/* =========================================
   STORAGE
========================================= */

function loadCampaigns() {

    try {

        const saved =
            localStorage.getItem("dm_ai_campaigns");

        campaigns =
            saved
                ? JSON.parse(saved)
                : [];

    } catch {

        campaigns = [];

    }

}


function saveCampaigns() {

    localStorage.setItem(
        "dm_ai_campaigns",
        JSON.stringify(campaigns)
    );

}


/* =========================================
   CAMPAIGN NAME
========================================= */

function createCampaignName(prompt) {

    const words =
        prompt
            .replace(/[^\w\s]/g,"")
            .split(/\s+/)
            .filter(Boolean)
            .slice(0,5);

    if (!words.length) {
        return "New Campaign";
    }

    return words
        .map(w =>
            w.charAt(0).toUpperCase() +
            w.slice(1)
        )
        .join(" ");

}


/* =========================================
   NEW CAMPAIGN
========================================= */

function createFirstCampaign() {

    currentCampaign = {

        id: Date.now(),

        name: "New Campaign",

        messages: []

    };

    campaigns.unshift(
        currentCampaign
    );

    saveCampaigns();

    updateSidebar();

}


function newCampaign() {

    createFirstCampaign();

    renderCampaign();

    document
        .getElementById("prompt")
        .focus();

}


/* =========================================
   SIDEBAR
========================================= */

function updateSidebar() {

    const list =
        document.getElementById(
            "campaignList"
        );

    list.innerHTML = "";

    campaigns.forEach(campaign => {

        const item =
            document.createElement("div");

        item.className =
            "campaign-item" +
            (
                currentCampaign &&
                campaign.id ===
                currentCampaign.id
                    ? " active"
                    : ""
            );

        item.textContent =
            campaign.name ||
            "New Campaign";

        item.onclick = () => {

            currentCampaign =
                campaign;

            renderCampaign();

            updateSidebar();

        };

        list.appendChild(item);

    });

}


/* =========================================
   EXAMPLE
========================================= */

function useExample(text) {

    document
        .getElementById("prompt")
        .value = text;

    document
        .getElementById("prompt")
        .focus();

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =========================================
   ARRAY HELPERS
========================================= */

function array(value) {

    return Array.isArray(value)
        ? value
        : [];

}


function text(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (typeof value === "object") {

        try {
            return JSON.stringify(value);
        } catch {
            return "";
        }

    }

    return String(value);

}


/* =========================================
   RENDER MESSAGES
========================================= */

function renderMessages() {

    const container =
        document.getElementById(
            "messages"
        );

    container.innerHTML = "";

    if (
        !currentCampaign ||
        !currentCampaign.messages.length
    ) {

        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">⚔️</div>
                <h2>Ready, Dungeon Master?</h2>
                <p>
                    Describe the adventure you want to create.
                </p>
            </div>
        `;

        return;

    }

    currentCampaign.messages.forEach(
        message => {

            const row =
                document.createElement("div");

            row.className =
                "message " +
                message.role;

            const bubble =
                document.createElement("div");

            bubble.className =
                "message-bubble";

            if (
                message.role === "ai" &&
                message.data
            ) {

                bubble.innerHTML =
                    "⚔️ Campaign generated below!";

            } else {

                bubble.textContent =
                    message.content || "";

            }

            row.appendChild(bubble);

            container.appendChild(row);

        }
    );

    container.scrollTop =
        container.scrollHeight;

}


/* =========================================
   RENDER CAMPAIGN
========================================= */

function renderCampaign() {

    if (!currentCampaign) {

        createFirstCampaign();

    }

    document.getElementById(
        "campaignTitle"
    ).textContent =
        currentCampaign.name ||
        "DM-AI";

    renderMessages();

    const output =
        document.getElementById(
            "campaignOutput"
        );

    const aiMessages =
        currentCampaign.messages
            .filter(m =>
                m.role === "ai" &&
                m.data
            );

    if (!aiMessages.length) {

        output.innerHTML = "";

        updateStats(null);

        return;

    }

    const campaign =
        aiMessages[
            aiMessages.length - 1
        ].data;

    renderCampaignData(
        campaign
    );

}


/* =========================================
   STATS
========================================= */

function updateStats(campaign) {

    document.getElementById(
        "characterCount"
    ).textContent =
        array(campaign?.characters).length;

    document.getElementById(
        "npcCount"
    ).textContent =
        array(campaign?.npcs).length;

    document.getElementById(
        "monsterCount"
    ).textContent =
        array(campaign?.monsters).length;

    document.getElementById(
        "locationCount"
    ).textContent =
        array(campaign?.locations).length;

    document.getElementById(
        "questCount"
    ).textContent =
        array(campaign?.quests).length;

}


/* =========================================
   CAMPAIGN DATA
========================================= */

function renderCampaignData(c) {

    updateStats(c);

    const output =
        document.getElementById(
            "campaignOutput"
        );

    let html = "";


    /* HERO */

    html += `
        <div class="hero">

            <h2>
                ${escapeHtml(
                    text(c.title) ||
                    currentCampaign.name ||
                    "Untitled Campaign"
                )}
            </h2>

            <p>
                ${escapeHtml(
                    text(c.summary)
                )}
            </p>

            <p>
                <strong>Setting:</strong>
                ${escapeHtml(
                    text(c.setting)
                )}
            </p>

            <p>
                <strong>Tone:</strong>
                ${escapeHtml(
                    text(c.tone)
                )}
            </p>

        </div>
    `;


    /* STORY */

    if (c.story) {

        html += `
            <div class="section">

                <h2>📖 Story</h2>

                <h3>Premise</h3>

                <p>
                    ${escapeHtml(
                        text(c.story.premise)
                    )}
                </p>

                <h3>Opening</h3>

                <p>
                    ${escapeHtml(
                        text(c.story.opening)
                    )}
                </p>
        `;

        array(c.story.acts)
            .forEach(act => {

                html += `
                    <h3>
                        ${escapeHtml(
                            text(act.title)
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            text(act.description)
                        )}
                    </p>
                `;

            });

        html += `
                <h3>Climax</h3>

                <p>
                    ${escapeHtml(
                        text(c.story.climax)
                    )}
                </p>

                <h3>Ending</h3>

                <p>
                    ${escapeHtml(
                        text(c.story.ending)
                    )}
                </p>

            </div>
        `;

    }


    /* CHARACTERS */

    if (array(c.characters).length) {

        html += `
            <div class="section">

                <h2>🧙 Character Sheets</h2>

                <div class="grid">
        `;

        c.characters.forEach(ch => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(ch.name)
                        )}
                    </h3>

                    <span class="tag">
                        ${escapeHtml(
                            text(ch.race)
                        )}
                    </span>

                    <span class="tag">
                        ${escapeHtml(
                            text(ch.class)
                        )}
                    </span>

                    <span class="tag">
                        Level ${escapeHtml(
                            text(ch.level)
                        )}
                    </span>

                    <p>
                        <strong>Background:</strong>
                        ${escapeHtml(
                            text(ch.background)
                        )}
                    </p>

                    <p>
                        <strong>Personality:</strong>
                        ${escapeHtml(
                            text(ch.personality)
                        )}
                    </p>

                    <p>
                        <strong>Appearance:</strong>
                        ${escapeHtml(
                            text(ch.appearance)
                        )}
                    </p>

                    <p>
                        <strong>Abilities:</strong><br>
                        ${array(ch.abilities)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Equipment:</strong><br>
                        ${array(ch.equipment)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Backstory:</strong>
                        ${escapeHtml(
                            text(ch.backstory)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* NPCS */

    if (array(c.npcs).length) {

        html += `
            <div class="section">

                <h2>🧑‍🤝‍🧑 NPCs</h2>

                <div class="grid">
        `;

        c.npcs.forEach(npc => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(npc.name)
                        )}
                    </h3>

                    <span class="tag">
                        ${escapeHtml(
                            text(npc.role)
                        )}
                    </span>

                    <p>
                        ${escapeHtml(
                            text(npc.description)
                        )}
                    </p>

                    <p>
                        <strong>Personality:</strong>
                        ${escapeHtml(
                            text(npc.personality)
                        )}
                    </p>

                    <p>
                        <strong>Motivation:</strong>
                        ${escapeHtml(
                            text(npc.motivation)
                        )}
                    </p>

                    <p>
                        <strong>Secret:</strong>
                        ${escapeHtml(
                            text(npc.secret)
                        )}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${escapeHtml(
                            text(npc.location)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* MONSTERS */

    if (array(c.monsters).length) {

        html += `
            <div class="section">

                <h2>👹 Monsters</h2>

                <div class="grid">
        `;

        c.monsters.forEach(monster => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(monster.name)
                        )}
                    </h3>

                    <span class="tag">
                        ${escapeHtml(
                            text(monster.type)
                        )}
                    </span>

                    <span class="tag">
                        CR ${escapeHtml(
                            text(monster.challenge)
                        )}
                    </span>

                    <p>
                        ${escapeHtml(
                            text(monster.description)
                        )}
                    </p>

                    <p>
                        <strong>Abilities:</strong><br>
                        ${array(monster.abilities)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Weakness:</strong>
                        ${escapeHtml(
                            text(monster.weakness)
                        )}
                    </p>

                    <p>
                        <strong>Tactics:</strong>
                        ${escapeHtml(
                            text(monster.tactics)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* LOCATIONS */

    if (array(c.locations).length) {

        html += `
            <div class="section">

                <h2>🗺️ Locations</h2>

                <div class="grid">
        `;

        c.locations.forEach(location => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(location.name)
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            text(location.description)
                        )}
                    </p>

                    <p>
                        <strong>Secrets:</strong><br>
                        ${array(location.secrets)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Encounters:</strong><br>
                        ${array(location.encounters)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Treasure:</strong><br>
                        ${array(location.treasure)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* QUESTS */

    if (array(c.quests).length) {

        html += `
            <div class="section">

                <h2>🎯 Quests</h2>

                <div class="grid">
        `;

        c.quests.forEach(q => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(q.name)
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            text(q.description)
                        )}
                    </p>

                    <p>
                        <strong>Objective:</strong>
                        ${escapeHtml(
                            text(q.objective)
                        )}
                    </p>

                    <p>
                        <strong>Steps:</strong><br>
                        ${array(q.steps)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Reward:</strong>
                        ${escapeHtml(
                            text(q.reward)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* ENCOUNTERS */

    if (array(c.encounters).length) {

        html += `
            <div class="section">

                <h2>⚔️ Encounters</h2>

                <div class="grid">
        `;

        c.encounters.forEach(e => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(e.name)
                        )}
                    </h3>

                    <span class="tag">
                        ${escapeHtml(
                            text(e.difficulty)
                        )}
                    </span>

                    <p>
                        ${escapeHtml(
                            text(e.description)
                        )}
                    </p>

                    <p>
                        <strong>Enemies:</strong><br>
                        ${array(e.enemies)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Terrain:</strong>
                        ${escapeHtml(
                            text(e.terrain)
                        )}
                    </p>

                    <p>
                        <strong>Special Rules:</strong>
                        ${escapeHtml(
                            text(e.specialRules)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* LOOT */

    if (array(c.loot).length) {

        html += `
            <div class="section">

                <h2>🎒 Loot & Items</h2>

                <div class="grid">
        `;

        c.loot.forEach(item => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(item.name)
                        )}
                    </h3>

                    <span class="tag">
                        ${escapeHtml(
                            text(item.rarity)
                        )}
                    </span>

                    <p>
                        ${escapeHtml(
                            text(item.description)
                        )}
                    </p>

                    <p>
                        <strong>Effect:</strong>
                        ${escapeHtml(
                            text(item.effect)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* FACTIONS */

    if (array(c.factions).length) {

        html += `
            <div class="section">

                <h2>🏰 Factions</h2>

                <div class="grid">
        `;

        c.factions.forEach(f => {

            html += `
                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(f.name)
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            text(f.description)
                        )}
                    </p>

                    <p>
                        <strong>Goal:</strong>
                        ${escapeHtml(
                            text(f.goal)
                        )}
                    </p>

                    <p>
                        <strong>Leader:</strong>
                        ${escapeHtml(
                            text(f.leader)
                        )}
                    </p>

                    <p>
                        <strong>Relationship:</strong>
                        ${escapeHtml(
                            text(f.relationship)
                        )}
                    </p>

                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    }


    /* BOSS */

    if (c.boss) {

        html += `
            <div class="section">

                <h2>👑 Final Boss</h2>

                <div class="info-card">

                    <h3>
                        ${escapeHtml(
                            text(c.boss.name)
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            text(c.boss.description)
                        )}
                    </p>

                    <p>
                        <strong>Motivation:</strong>
                        ${escapeHtml(
                            text(c.boss.motivation)
                        )}
                    </p>

                    <p>
                        <strong>Abilities:</strong><br>
                        ${array(c.boss.abilities)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Phases:</strong><br>
                        ${array(c.boss.phases)
                            .map(x =>
                                "• " +
                                escapeHtml(text(x))
                            )
                            .join("<br>")}
                    </p>

                    <p>
                        <strong>Arena:</strong>
                        ${escapeHtml(
                            text(c.boss.arena)
                        )}
                    </p>

                    <p>
                        <strong>Reward:</strong>
                        ${escapeHtml(
                            text(c.boss.reward)
                        )}
                    </p>

                </div>

            </div>
        `;

    }


    /* DM NOTES */

    if (array(c.dmNotes).length) {

        html += `
            <div class="section">

                <h2>📜 DM Notes</h2>

                <div class="info-card">

                    ${array(c.dmNotes)
                        .map(x =>
                            `<p>• ${escapeHtml(text(x))}</p>`
                        )
                        .join("")}

                </div>

            </div>
        `;

    }


    /* FOUR CHOICES */

    if (array(c.choices).length) {

        html += `
            <div class="section">

                <h2>🧭 What happens next?</h2>

                <div class="choices">
        `;

        c.choices
            .slice(0,4)
            .forEach((choice,index) => {

                html += `
                    <button
                        class="choice"
                        onclick="chooseAction(${index})"
                    >

                        <strong>
                            ${escapeHtml(
                                text(choice.label)
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                text(choice.description)
                            )}
                        </span>

                    </button>
                `;

            });

        html += `
                </div>
            </div>
        `;

    }


    output.innerHTML = html;

}


/* =========================================
   CHOICE
========================================= */

async function chooseAction(index) {

    const aiMessages =
        currentCampaign.messages
            .filter(m =>
                m.role === "ai" &&
                m.data
            );

    if (!aiMessages.length) {
        return;
    }

    const campaign =
        aiMessages[
            aiMessages.length - 1
        ].data;

    const choices =
        array(campaign.choices);

    if (!choices[index]) {
        return;
    }

    const choice =
        choices[index];

    const choiceText =
        `I choose: ${choice.label}\n\n${choice.description}`;

    document.getElementById(
        "prompt"
    ).value = choiceText;

    await generateCampaign();

}


/* =========================================
   GENERATE
========================================= */

async function generateCampaign() {

    if (isGenerating) {
        return;
    }

    const input =
        document.getElementById(
            "prompt"
        );

    const button =
        document.getElementById(
            "generateButton"
        );

    const prompt =
        input.value.trim();

    if (!prompt) {
        input.focus();
        return;
    }

    if (!currentCampaign) {
        createFirstCampaign();
    }

    currentCampaign.messages.push({
        role: "user",
        content: prompt
    });

    if (
        currentCampaign.name ===
        "New Campaign"
    ) {

        currentCampaign.name =
            createCampaignName(prompt);

    }

    input.value = "";

    saveCampaigns();
    updateSidebar();
    renderCampaign();

    isGenerating = true;

    button.disabled = true;

    button.textContent =
        "⚔️ Building...";

    currentCampaign.messages.push({
        role: "ai",
        content:
            "DM-AI is building your adventure..."
    });

    renderCampaign();

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {
            controller.abort();
        }, 90000);

    try {

        const response =
            await fetch(
                "/api/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            prompt: prompt
                        }),

                    signal:
                        controller.signal
                }
            );

        clearTimeout(timeout);

        const raw =
            await response.text();

        console.log(
            "DM-AI RESPONSE:",
            raw
        );

        let data;

        try {

            data =
                JSON.parse(raw);

        } catch {

            throw new Error(
                "The server returned invalid JSON."
            );

        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.details ||
                "Gemini API error."
            );

        }

        let campaign =
            data.result ||
            data.campaign;

        if (
            typeof campaign ===
            "string"
        ) {

            try {

                campaign =
                    JSON.parse(
                        campaign
                    );

            } catch {

                throw new Error(
                    "Gemini returned text instead of campaign JSON."
                );

            }

        }

        if (
            !campaign ||
            typeof campaign !== "object"
        ) {

            throw new Error(
                "DM-AI returned no campaign."
            );

        }

        currentCampaign.messages.pop();

        currentCampaign.messages.push({

            role: "ai",

            content:
                "Campaign generated.",

            data: campaign

        });

        saveCampaigns();

        updateSidebar();

        renderCampaign();

    }

    catch (error) {

        clearTimeout(timeout);

        console.error(
            "DM-AI ERROR:",
            error
        );

        currentCampaign.messages.pop();

        let message =
            error.message ||
            "Unknown error.";

        if (
            error.name ===
            "AbortError"
        ) {

            message =
                "Gemini timed out. Check your Vercel deployment and API key.";

        }

        currentCampaign.messages.push({

            role: "ai",

            content:
                "⚠️ DM-AI ERROR\n\n" +
                message

        });

        saveCampaigns();

        renderCampaign();

    }

    finally {

        isGenerating = false;

        button.disabled = false;

        button.textContent =
            "Generate ⚔️";

    }

}


/* =========================================
   ENTER KEY
========================================= */

document
    .getElementById("prompt")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                generateCampaign();

            }

        }
    );


/* =========================================
   START
========================================= */

loadCampaigns();

if (campaigns.length) {

    currentCampaign =
        campaigns[0];

} else {

    createFirstCampaign();

}

updateSidebar();

renderCampaign();

</script>

</body>
</html>
