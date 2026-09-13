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
        error: "GEMINI_API_KEY is missing from Vercel"
      });
    }

    const systemPrompt = `
You are DM-AI, an advanced tabletop RPG Dungeon Master.

Create a complete playable campaign from the user's request.

RETURN ONLY VALID JSON.
NO MARKDOWN.
NO CODE BLOCKS.
NO TEXT OUTSIDE THE JSON.

Use this exact structure:

{
  "title": "Campaign title",
  "summary": "Campaign summary",
  "setting": "Setting",
  "tone": "Tone",

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

  "characters": [],
  "npcs": [],
  "monsters": [],
  "locations": [],
  "quests": [],
  "encounters": [],
  "loot": [],
  "factions": [],

  "boss": {
    "name": "Boss",
    "description": "Description",
    "motivation": "Motivation",
    "abilities": [],
    "phases": [],
    "arena": "Arena",
    "reward": "Reward"
  },

  "dmNotes": [],

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

For characters use:

{
  "name": "Name",
  "race": "Race",
  "class": "Class",
  "level": 1,
  "alignment": "Alignment",
  "background": "Background",
  "personality": "Personality",
  "appearance": "Appearance",
  "abilities": [],
  "equipment": [],
  "backstory": "Backstory"
}

For NPCs use:

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

For monsters use:

{
  "name": "Name",
  "type": "Type",
  "challenge": "Challenge",
  "description": "Description",
  "abilities": [],
  "weakness": "Weakness",
  "tactics": "Tactics"
}

For locations use:

{
  "name": "Name",
  "description": "Description",
  "secrets": [],
  "encounters": [],
  "treasure": []
}

For quests use:

{
  "name": "Quest",
  "description": "Description",
  "objective": "Objective",
  "steps": [],
  "reward": "Reward"
}

For encounters use:

{
  "name": "Encounter",
  "description": "Description",
  "difficulty": "Difficulty",
  "enemies": [],
  "terrain": "Terrain",
  "specialRules": "Rules"
}

For loot use:

{
  "name": "Item",
  "type": "Type",
  "rarity": "Rarity",
  "description": "Description",
  "effect": "Effect"
}

For factions use:

{
  "name": "Faction",
  "description": "Description",
  "goal": "Goal",
  "leader": "Leader",
  "relationship": "Relationship"
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
- Choices must be meaningful.
- Everything should connect to the same story.
- Make the campaign feel like a real tabletop RPG.

USER REQUEST:

${prompt}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
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
            maxOutputTokens: 12000
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
        error: "Gemini API response was not JSON",
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

    // Remove accidental markdown fences.
    answer = answer
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    // Find the JSON object if Gemini added extra text.
    const first = answer.indexOf("{");
    const last = answer.lastIndexOf("}");

    if (first !== -1 && last !== -1) {
      answer = answer.substring(first, last + 1);
    }

    let campaign;

    try {
      campaign = JSON.parse(answer);
    } catch (error) {
      console.error("CAMPAIGN JSON ERROR:", error);
      console.error("CAMPAIGN RESPONSE:", answer);

      return res.status(500).json({
        success: false,
        error: "Campaign JSON could not be parsed",
        details: answer
      });
    }

    // Make sure arrays exist.
    campaign.characters = Array.isArray(campaign.characters)
      ? campaign.characters
      : [];

    campaign.npcs = Array.isArray(campaign.npcs)
      ? campaign.npcs
      : [];

    campaign.monsters = Array.isArray(campaign.monsters)
      ? campaign.monsters
      : [];

    campaign.locations = Array.isArray(campaign.locations)
      ? campaign.locations
      : [];

    campaign.quests = Array.isArray(campaign.quests)
      ? campaign.quests
      : [];

    campaign.encounters = Array.isArray(campaign.encounters)
      ? campaign.encounters
      : [];

    campaign.loot = Array.isArray(campaign.loot)
      ? campaign.loot
      : [];

    campaign.factions = Array.isArray(campaign.factions)
      ? campaign.factions
      : [];

    campaign.dmNotes = Array.isArray(campaign.dmNotes)
      ? campaign.dmNotes
      : [];

    campaign.choices = Array.isArray(campaign.choices)
      ? campaign.choices
      : [];

    // Always give the UI four choices.
    campaign.choices = campaign.choices.slice(0, 4);

    while (campaign.choices.length < 4) {
      campaign.choices.push({
        label: "Continue",
        description: "Continue the adventure."
      });
    }

    return res.status(200).json({
      success: true,
      result: campaign
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message
    });
  }
}
