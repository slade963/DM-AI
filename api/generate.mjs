export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

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
                  text: `You are DM-AI, an expert Dungeons & Dragons campaign assistant.

The user wants:
${prompt}

Create a detailed D&D campaign that a Dungeon Master can actually use.

Include:

# Campaign
- Title
- Overview
- Main storyline
- Setting
- Tone

# Quests
- Main quests
- Side quests
- Objectives
- Rewards

# NPCs
- Name
- Race
- Role
- Personality
- Motivation
- Description

# Locations
- Name
- Type
- Description
- Important details

# Monsters
- Name
- Type
- Description
- Abilities
- Challenge level

# Encounters
- Encounter description
- Enemies
- Difficulty
- Environment
- Possible rewards

# Final Boss
- Name
- Description
- Abilities
- Weaknesses
- Battle setup

Make everything creative, detailed, and easy for a DM to use during a game.`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API request failed"
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") ||
      "Gemini returned no content.";

    return res.status(200).json({
      text
    });

  } catch (error) {
    console.error("DM-AI error:", error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
