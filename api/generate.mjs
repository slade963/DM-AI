export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "POST required"
      });
    }

    const prompt = req.body?.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in Vercel"
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
                  text: `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master.

Create a complete playable D&D campaign based on:

${prompt}

Return a detailed campaign including:

CAMPAIGN
- title
- summary
- setting
- recommended level
- tone
- main story

LOCATIONS
Create several important locations.

NPCS
Create important NPCs with:
- name
- role
- personality
- motivation
- secret
- dialogue

MONSTERS
Create monsters with:
- name
- description
- abilities
- tactics
- difficulty

QUESTS
Create main and side quests.

ENCOUNTERS
Create combat and non-combat encounters.

ITEMS
Create weapons, armor, magic items and treasure.

CHARACTERS
Create several example player characters with:
- name
- race
- class
- background
- personality
- backstory
- ability scores
- equipment

CHAPTERS
Break the adventure into multiple playable chapters.

FINAL BOSS
Create an epic final boss with abilities, tactics and multiple phases.

DM NOTES
Give useful advice for running the adventure.

Return ONLY valid JSON.
`
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

    console.log("GEMINI STATUS:", response.status);
    console.log("GEMINI RESPONSE:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || "Gemini API error",
        geminiStatus: response.status
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned no text",
        raw: data
      });
    }

    let campaign;

    try {
      campaign = JSON.parse(text);
    } catch (error) {
      console.error("JSON ERROR:", error);
      console.error("RAW GEMINI:", text);

      return res.status(500).json({
        error: "Gemini returned invalid JSON",
        raw: text
      });
    }

    return res.status(200).json({
      success: true,
      campaign: campaign
    });

  } catch (error) {
    console.error("DM-AI SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
