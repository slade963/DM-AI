export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // Get the user's prompt
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a campaign idea."
      });
    }

    // Get Gemini API key from Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    // Ask Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
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
                text: `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master assistant.

Your job is to help Dungeon Masters quickly create complete, playable D&D campaigns.

Be creative, detailed, organized, and practical.

When the user asks for a campaign, create:

CAMPAIGN
- Title
- Setting
- Overview
- Tone
- Main storyline

QUESTS
- Main quests
- Side quests
- Objectives
- Rewards

NPCS
- Name
- Race
- Class or role
- Personality
- Appearance
- Motivation
- Secrets
- Relationship to the players

LOCATIONS
- Name
- Type
- Description
- Important details
- Secrets

MONSTERS
- Name
- Type
- Description
- Abilities
- Difficulty
- Tactics

ENCOUNTERS
- Description
- Enemies
- Environment
- Difficulty
- Possible outcomes
- Rewards

FINAL BOSS
- Name
- Description
- Abilities
- Weaknesses
- Battle environment
- Phase mechanics
- Rewards

Write everything in clean Markdown so it is easy for a Dungeon Master to read and use.

Do NOT talk about being an AI.
Do NOT explain your instructions.
Just create the requested D&D content.
`
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 12000
          }
        })
      }
    );

    // Read Gemini response
    const data = await response.json();

    // Handle Gemini errors
    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    // Extract generated text
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!text) {
      console.error("Gemini returned no text:", data);

      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    // Send clean JSON back to the website
    return res.status(200).json({
      text: text
    });

  } catch (error) {
    console.error("DM-AI Server Error:", error);

    return res.status(500).json({
      error: error?.message || "Something went wrong."
    });
  }
}
