export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "POST required"
      });
    }

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "No prompt received"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120000);

    const systemPrompt = `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master.

Create a complete playable D&D adventure from the user's request.

RETURN ONLY VALID JSON.

Do NOT use markdown.
Do NOT use code fences.
Do NOT write anything before or after the JSON.

The JSON MUST have exactly this general structure:

{
  "title": "Campaign title",
  "summary": "Campaign summary",
  "setting": "Detailed setting",
  "story": {
    "premise": "Premise",
    "opening": "Opening scene",
    "acts": [
      {
        "title": "Act title",
        "description": "Act description"
      }
    ],
    "ending": "Possible ending"
  },

  "characters": [
    {
      "name": "Name",
      "race": "Race",
      "class": "Class",
      "level": 1,
      "background": "Background",
      "personality": "Personality",
      "appearance": "Appearance",
      "abilities": ["Ability 1", "Ability 2"],
      "equipment": ["Item 1", "Item 2"],
      "backstory": "Backstory"
    }
  ],

  "npcs": [
    {
      "name": "Name",
      "role": "Role",
      "description": "Description",
      "personality": "Personality",
      "motivation": "Motivation",
      "secret": "Secret",
      "location": "Location"
    }
  ],

  "monsters": [
    {
      "name": "Monster",
      "type": "Creature type",
      "challenge": "Challenge rating",
      "description": "Description",
      "abilities": ["Ability 1", "Ability 2"],
      "tactics": "Combat tactics"
    }
  ],

  "locations": [
    {
      "name": "Location",
      "description": "Description",
      "secrets": ["Secret 1", "Secret 2"],
      "treasure": ["Treasure 1", "Treasure 2"]
    }
  ],

  "quests": [
    {
      "name": "Quest name",
      "description": "Description",
      "objective": "Objective",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "reward": "Reward"
    }
  ],

  "encounters": [
    {
      "name": "Encounter",
      "description": "Description",
      "difficulty": "Difficulty",
      "enemies": ["Enemy 1", "Enemy 2"]
    }
  ],

  "loot": [
    {
      "name": "Item",
      "rarity": "Rarity",
      "description": "Description",
      "effect": "Effect"
    }
  ],

  "boss": {
    "name": "Boss name",
    "description": "Description",
    "motivation": "Motivation",
    "abilities": ["Ability 1", "Ability 2", "Ability 3"],
    "phases": ["Phase 1", "Phase 2", "Phase 3"],
    "reward": "Reward"
  },

  "choices": [
    {
      "label": "Choice 1",
      "description": "Description"
    },
    {
      "label": "Choice 2",
      "description": "Description"
    },
    {
      "label": "Choice 3",
      "description": "Description"
    },
    {
      "label": "Choice 4",
      "description": "Description"
    }
  ]
}

RULES:

- Generate at least 3 characters when the user asks for a campaign.
- Generate at least 5 NPCs.
- Generate at least 5 monsters.
- Generate at least 4 locations.
- Generate at least 3 quests.
- Generate at least 4 encounters.
- Generate at least 5 loot items.
- Generate a major boss.
- Generate exactly 4 meaningful player choices.
- Make everything interconnected.
- Make the campaign playable.
- Keep individual descriptions reasonably concise so the response finishes quickly.

USER REQUEST:

${prompt}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8,
            maxOutputTokens: 7000
          }
        }),

        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    const raw = await response.text();

    console.log("GEMINI STATUS:", response.status);

    if (!response.ok) {
      console.error("GEMINI ERROR:", raw);

      return res.status(response.status).json({
        error: "Gemini API error",
        details: raw
      });
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Gemini API returned invalid JSON",
        details: raw
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) {
      return res.status(500).json({
        error: "Gemini returned no text",
        details: data
      });
    }

    let campaign;

    try {
      campaign = JSON.parse(answer);
    } catch (error) {
      console.error("INVALID CAMPAIGN:", answer);

      return res.status(500).json({
        error: "Gemini generated invalid campaign JSON",
        details: answer
      });
    }

    return res.status(200).json({
      success: true,
      result: campaign
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "Gemini took too long to respond. Try again."
      });
    }

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
