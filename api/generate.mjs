export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "POST required"
      });
    }

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "No prompt received"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is missing"
      });
    }

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
              role: "user",
              parts: [
                {
                  text: `
You are DM-AI, an RPG campaign generator.

User request:

${prompt}

Create a complete tabletop RPG adventure.

You MUST return ONLY a JSON object.

Do NOT use markdown.
Do NOT use ```json.
Do NOT explain anything.
Do NOT put text before or after the JSON.

Use EXACTLY this structure:

{
  "title": "Campaign title",
  "summary": "Short summary",
  "setting": "Setting description",
  "tone": "Campaign tone",

  "story": {
    "premise": "Premise",
    "opening": "Opening scene",
    "acts": [
      {
        "title": "Act 1",
        "description": "Description"
      },
      {
        "title": "Act 2",
        "description": "Description"
      },
      {
        "title": "Act 3",
        "description": "Description"
      }
    ],
    "climax": "Climax",
    "ending": "Ending"
  },

  "characters": [
    {
      "name": "Name",
      "race": "Race",
      "class": "Class",
      "level": 1,
      "alignment": "Alignment",
      "background": "Background",
      "personality": "Personality",
      "appearance": "Appearance",
      "abilities": [
        "Ability 1",
        "Ability 2",
        "Ability 3"
      ],
      "equipment": [
        "Item 1",
        "Item 2"
      ],
      "backstory": "Backstory"
    }
  ],

  "npcs": [
    {
      "name": "Name",
      "role": "Role",
      "race": "Race",
      "description": "Description",
      "personality": "Personality",
      "motivation": "Motivation",
      "secret": "Secret",
      "dialogue": "Example dialogue",
      "location": "Location"
    }
  ],

  "monsters": [
    {
      "name": "Name",
      "type": "Type",
      "challenge": "Challenge rating",
      "description": "Description",
      "abilities": [
        "Ability 1",
        "Ability 2"
      ],
      "weakness": "Weakness",
      "tactics": "Tactics"
    }
  ],

  "locations": [
    {
      "name": "Name",
      "description": "Description",
      "secrets": [
        "Secret 1",
        "Secret 2"
      ],
      "encounters": [
        "Encounter 1",
        "Encounter 2"
      ],
      "treasure": [
        "Treasure 1",
        "Treasure 2"
      ]
    }
  ],

  "quests": [
    {
      "name": "Quest name",
      "description": "Description",
      "objective": "Objective",
      "steps": [
        "Step 1",
        "Step 2",
        "Step 3"
      ],
      "reward": "Reward"
    }
  ],

  "encounters": [
    {
      "name": "Encounter name",
      "description": "Description",
      "difficulty": "Difficulty",
      "enemies": [
        "Enemy 1",
        "Enemy 2"
      ],
      "terrain": "Terrain",
      "specialRules": "Special rules"
    }
  ],

  "loot": [
    {
      "name": "Item",
      "type": "Type",
      "rarity": "Rarity",
      "description": "Description",
      "effect": "Effect"
    }
  ],

  "factions": [
    {
      "name": "Faction",
      "description": "Description",
      "goal": "Goal",
      "leader": "Leader",
      "relationship": "Relationship"
    }
  ],

  "boss": {
    "name": "Boss name",
    "description": "Description",
    "motivation": "Motivation",
    "abilities": [
      "Ability 1",
      "Ability 2",
      "Ability 3"
    ],
    "phases": [
      "Phase 1",
      "Phase 2",
      "Phase 3"
    ],
    "arena": "Arena",
    "reward": "Reward"
  },

  "dmNotes": [
    "Note 1",
    "Note 2",
    "Note 3"
  ],

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

Requirements:

- At least 3 characters.
- At least 5 NPCs.
- At least 5 monsters.
- At least 4 locations.
- At least 3 quests.
- At least 4 encounters.
- At least 5 loot items.
- At least 2 factions.
- One major final boss.
- EXACTLY 4 choices.
- Make everything connected to the same story.
- Choices should affect what happens next.

REMEMBER:

Return ONLY valid JSON.
`
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 12000,

            responseMimeType: "application/json"
          }
        })
      }
    );

    const raw = await response.text();

    console.log("GEMINI STATUS:", response.status);
    console.log("GEMINI RAW:", raw);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Gemini API error",
        details: raw
      });
    }

    let apiData;

    try {
      apiData = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Gemini API response was not valid JSON",
        details: raw
      });
    }

    let answer =
      apiData?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) {
      return res.status(500).json({
        success: false,
        error: "Gemini returned no text",
        details: apiData
      });
    }

    /*
      Gemini occasionally adds markdown even when told not to.
      Clean it before parsing.
    */

    answer = answer
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    /*
      Find the actual JSON object if Gemini
      accidentally put text before/after it.
    */

    const firstBrace = answer.indexOf("{");
    const lastBrace = answer.lastIndexOf("}");

    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      answer = answer.slice(
        firstBrace,
        lastBrace + 1
      );
    }

    let campaign;

    try {
      campaign = JSON.parse(answer);
    } catch (jsonError) {
      console.error(
        "CAMPAIGN JSON PARSE ERROR:",
        jsonError
      );

      console.error(
        "CAMPAIGN TEXT:",
        answer
      );

      return res.status(500).json({
        success: false,
        error: "Gemini generated invalid campaign JSON",
        details: answer
      });
    }

    /*
      Make sure the important arrays always exist.
      This prevents the website from crashing if
      Gemini forgets one.
    */

    campaign.characters =
      Array.isArray(campaign.characters)
        ? campaign.characters
        : [];

    campaign.npcs =
      Array.isArray(campaign.npcs)
        ? campaign.npcs
        : [];

    campaign.monsters =
      Array.isArray(campaign.monsters)
        ? campaign.monsters
        : [];

    campaign.locations =
      Array.isArray(campaign.locations)
        ? campaign.locations
        : [];

    campaign.quests =
      Array.isArray(campaign.quests)
        ? campaign.quests
        : [];

    campaign.encounters =
      Array.isArray(campaign.encounters)
        ? campaign.encounters
        : [];

    campaign.loot =
      Array.isArray(campaign.loot)
        ? campaign.loot
        : [];

    campaign.factions =
      Array.isArray(campaign.factions)
        ? campaign.factions
        : [];

    campaign.dmNotes =
      Array.isArray(campaign.dmNotes)
        ? campaign.dmNotes
        : [];

    campaign.choices =
      Array.isArray(campaign.choices)
        ? campaign.choices
        : [];

    /*
      Guarantee exactly four choices for
      the frontend.
    */

    campaign.choices =
      campaign.choices.slice(0, 4);

    while (campaign.choices.length < 4) {
      campaign.choices.push({
        label: "Continue",
        description:
          "Continue the adventure and see what happens next."
      });
    }

    return res.status(200).json({
      success: true,
      result: campaign
    });

  } catch (error) {

    console.error(
      "DM-AI SERVER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message
    });
  }
}
