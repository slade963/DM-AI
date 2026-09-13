export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Please describe what you want to create."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing."
      });
    }

    const systemPrompt = `
You are DM-AI, an expert Dungeons & Dragons campaign creator.

The user will describe an adventure they want.

Create a COMPLETE playable D&D campaign.

Return ONLY valid JSON.

The JSON must have exactly these top-level properties:

{
  "title": "",
  "summary": "",
  "setting": "",
  "recommended_level": "",
  "story": "",
  "locations": [],
  "npcs": [],
  "monsters": [],
  "quests": [],
  "encounters": [],
  "items": [],
  "characters": [],
  "chapters": [],
  "final_boss": {},
  "dm_notes": []
}

IMPORTANT:

locations:
Create 4-8 locations.

Each location must contain:
name
description
secrets

npcs:
Create 5-10 NPCs.

Each NPC must contain:
name
role
personality
appearance
motivation
secret
dialogue

monsters:
Create 4-8 monsters.

Each monster must contain:
name
description
abilities
tactics
difficulty

quests:
Create 4-8 quests.

Each quest must contain:
name
description
objective
reward

encounters:
Create 4-8 encounters.

Each encounter must contain:
name
location
description
enemies
difficulty
dm_notes

items:
Create 4-8 items.

Each item must contain:
name
type
rarity
description
ability

characters:
Create 4 example player characters.

Each character must contain:
name
race
class
background
personality
backstory
ability_scores
equipment

ability_scores must contain:
strength
dexterity
constitution
intelligence
wisdom
charisma

chapters:
Create 4-8 campaign chapters.

Each chapter must contain:
number
title
summary
objectives
events

final_boss must contain:
name
description
abilities
phases
tactics
difficulty

dm_notes:
Create useful tips for running the campaign.

Make everything connected to the user's idea.

Do NOT return Markdown.
Do NOT return code fences.
Do NOT explain the JSON.
Return ONLY the JSON object.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    systemPrompt +
                    "\n\nUSER REQUEST:\n" +
                    prompt
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

    const data = await response.json();

    console.log("Gemini response:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    let campaign;

    try {
      campaign = JSON.parse(text);
    } catch (error) {
      console.error("JSON parse error:", error);
      console.error("Gemini text:", text);

      return res.status(500).json({
        error: "Gemini returned invalid campaign data."
      });
    }

    return res.status(200).json({
      success: true,
      campaign: campaign
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message || "Something went wrong."
    });
  }
}
