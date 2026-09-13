export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const prompt = body.prompt;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a campaign idea."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing."
      });
    }

    const systemPrompt = `
You are DM-AI, a professional Dungeons & Dragons campaign creation engine.

The user will give you an idea for a D&D campaign.

DO NOT ONLY WRITE A STORY.

You must create an entire playable campaign package.

Return the campaign as JSON ONLY.

Do not use markdown.
Do not use code fences.
Do not write anything before or after the JSON.

Use exactly this structure:

{
  "campaign": {
    "title": "",
    "overview": "",
    "setting": "",
    "tone": "",
    "recommendedLevel": "",
    "mainStory": "",
    "openingHook": ""
  },

  "chapters": [
    {
      "number": 1,
      "title": "",
      "summary": "",
      "objectives": [],
      "events": []
    }
  ],

  "mainQuests": [
    {
      "name": "",
      "description": "",
      "objectives": [],
      "rewards": []
    }
  ],

  "sideQuests": [
    {
      "name": "",
      "description": "",
      "objectives": [],
      "rewards": []
    }
  ],

  "npcs": [
    {
      "name": "",
      "race": "",
      "role": "",
      "appearance": "",
      "personality": "",
      "motivation": "",
      "secret": "",
      "relationshipToPlayers": "",
      "dialogue": ""
    }
  ],

  "playerCharacters": [
    {
      "name": "",
      "race": "",
      "class": "",
      "level": 1,
      "background": "",
      "alignment": "",
      "strength": 10,
      "dexterity": 10,
      "constitution": 10,
      "intelligence": 10,
      "wisdom": 10,
      "charisma": 10,
      "hitPoints": 10,
      "armorClass": 10,
      "speed": 30,
      "skills": [],
      "savingThrows": [],
      "weapons": [],
      "spells": [],
      "equipment": [],
      "features": [],
      "backstory": ""
    }
  ],

  "locations": [
    {
      "name": "",
      "type": "",
      "description": "",
      "importantDetails": [],
      "secrets": [],
      "encounters": []
    }
  ],

  "monsters": [
    {
      "name": "",
      "type": "",
      "size": "",
      "challengeRating": "",
      "description": "",
      "armorClass": 10,
      "hitPoints": 10,
      "speed": "",
      "abilities": [],
      "attacks": [],
      "specialAbilities": [],
      "tactics": []
    }
  ],

  "encounters": [
    {
      "name": "",
      "location": "",
      "difficulty": "",
      "description": "",
      "enemies": [],
      "environment": "",
      "objectives": [],
      "rewards": []
    }
  ],

  "loot": [
    {
      "name": "",
      "type": "",
      "description": "",
      "value": "",
      "specialEffect": ""
    }
  ],

  "factions": [
    {
      "name": "",
      "description": "",
      "goals": "",
      "members": [],
      "relationshipToPlayers": ""
    }
  ],

  "lore": [
    {
      "topic": "",
      "information": ""
    }
  ],

  "finalBoss": {
    "name": "",
    "description": "",
    "motivation": "",
    "location": "",
    "armorClass": 10,
    "hitPoints": 100,
    "abilities": [],
    "attacks": [],
    "phases": [],
    "weaknesses": [],
    "rewards": []
  },

  "dmNotes": [
    ""
  ]
}

IMPORTANT RULES:

1. Generate a COMPLETE campaign, not just a summary.

2. Create multiple quests, NPCs, locations, monsters and encounters.

3. Make the NPCs relevant to the story.

4. Make locations connect to quests and NPCs.

5. Make monsters appropriate for the recommended level.

6. Make encounters use the monsters and locations.

7. Make the final boss connected to the main story.

8. Make rewards appropriate for the campaign.

9. Create enough content that a DM could actually run multiple sessions.

10. If the user asks for a specific number of NPCs, quests, characters, locations, monsters, etc., follow their requested number.

11. If they do not specify numbers, create:
   - 5 main quests
   - 5 side quests
   - 8 NPCs
   - 5 locations
   - 8 monsters
   - 6 encounters
   - 8 loot items
   - 3 factions
   - 5 lore entries
   - 4 chapters

12. Player characters should only be generated when the user asks for them or asks for a party.

13. Keep the campaign internally consistent.

14. Make everything usable by a Dungeon Master.

USER REQUEST:
${prompt}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
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
                  text: systemPrompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 20000,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const result =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!result) {
      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    let campaign;

    try {
      campaign = JSON.parse(result);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Gemini result:", result);

      return res.status(500).json({
        error: "Gemini generated invalid campaign data."
      });
    }

    return res.status(200).json({
      result: campaign
    });

  } catch (error) {
    console.error("DM-AI error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while creating your campaign."
    });
  }
}
