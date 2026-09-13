export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter something for DM-AI to create."
      });
    }

    // =====================================================
    // GEMINI API KEY
    // =====================================================

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in Vercel."
      });
    }

    // =====================================================
    // DM-AI INSTRUCTIONS
    // =====================================================

    const systemPrompt = `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master,
campaign designer, storyteller, NPC creator, monster designer,
quest designer, and adventure planner.

The user will tell you what kind of D&D adventure or campaign
they want.

Your job is to create a complete, playable campaign.

DO NOT ONLY WRITE A STORY.

Create useful material that a real Dungeon Master can use at
the table.

Your response MUST be valid JSON.

Return ONLY JSON.
Do NOT use markdown.
Do NOT use code blocks.
Do NOT put any text before or after the JSON.

Create the following:

1. CAMPAIGN
- title
- description
- setting
- tone
- recommendedLevel
- mainStory

2. LOCATIONS
Create several important locations.
Each should have:
- name
- description
- secrets

3. NPCS
Create important NPCs.
Each should have:
- name
- role
- race
- personality
- appearance
- motivation
- secret
- dialogue

4. MONSTERS
Create monsters appropriate for the campaign.
Each should have:
- name
- description
- difficulty
- armorClass
- hitPoints
- attacks
- abilities
- tactics

5. QUESTS
Create main and side quests.
Each should have:
- name
- type
- description
- objective
- reward
- consequences

6. ENCOUNTERS
Create several encounters.
Each should have:
- name
- location
- difficulty
- description
- enemies
- objectives
- dmNotes

7. ITEMS
Create useful treasure and magic items.
Each should have:
- name
- type
- rarity
- description
- effect

8. PLAYER CHARACTERS
Create example characters that fit the campaign.
Each should have:
- name
- race
- class
- background
- personality
- motivation
- backstory
- abilityScores
- equipment

abilityScores must contain:
- strength
- dexterity
- constitution
- intelligence
- wisdom
- charisma

9. CHAPTERS
Break the campaign into multiple chapters.
Each should have:
- number
- title
- summary
- objectives
- events
- encounters
- dmNotes

10. FINAL BOSS
Create an epic final boss.
Include:
- name
- description
- difficulty
- armorClass
- hitPoints
- attacks
- abilities
- phases
- tactics

11. DM NOTES
Give practical advice for running the campaign.

Make everything connected.

NPCs should matter to the story.
Locations should connect to quests.
Quests should lead to encounters.
Monsters should fit the locations.
Items should have a reason to exist.
The final boss should connect to the main story.

If the user requests a small adventure, keep it smaller.
If the user requests a huge campaign, make it much larger.

JSON FORMAT:

{
  "title": "",
  "description": "",
  "setting": "",
  "tone": "",
  "recommendedLevel": "",
  "mainStory": "",

  "locations": [],

  "npcs": [],

  "monsters": [],

  "quests": [],

  "encounters": [],

  "items": [],

  "playerCharacters": [],

  "chapters": [],

  "finalBoss": {},

  "dmNotes": []
}
`;

    // =====================================================
    // GEMINI REQUEST
    // =====================================================

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemPrompt
              }
            ]
          },

          contents: [
            {
              role: "user",

              parts: [
                {
                  text: prompt.trim()
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json"
          }
        })
      }
    );

    // =====================================================
    // READ GEMINI RESPONSE
    // =====================================================

    const data = await response.json();

    console.log(
      "Gemini status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "Gemini error:",
        JSON.stringify(data)
      );

      return res.status(500).json({
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!text) {
      console.error(
        "Gemini returned no text:",
        JSON.stringify(data)
      );

      return res.status(500).json({
        error:
          "Gemini returned an empty response."
      });
    }

    // =====================================================
    // PARSE JSON
    // =====================================================

    let campaign;

    try {
      campaign = JSON.parse(text);
    } catch (error) {

      console.error(
        "JSON parsing failed:",
        error
      );

      console.error(
        "Gemini returned:",
        text
      );

      return res.status(500).json({
        error:
          "Gemini returned invalid campaign data."
      });
    }

    // =====================================================
    // SEND CAMPAIGN TO FRONTEND
    // =====================================================

    return res.status(200).json({
      success: true,
      campaign: campaign
    });

  } catch (error) {

    console.error(
      "DM-AI server error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Something went wrong."
    });
  }
}
