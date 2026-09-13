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
        error: "Prompt is required"
      });
    }

    // Your Vercel environment variable
    const apiKey = process.env.OPEN_AI_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPEN_AI_KEY is missing from Vercel Environment Variables"
      });
    }

    const systemPrompt = `
You are DM-AI, an advanced Dungeons & Dragons campaign generator.

The user will describe the kind of campaign they want.

You MUST return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not add explanations outside the JSON.

Create a complete playable D&D campaign.

The JSON MUST have this exact structure:

{
  "title": "",
  "description": "",
  "setting": "",
  "tone": "",
  "recommendedLevel": "",
  "story": {
    "mainPlot": "",
    "act1": "",
    "act2": "",
    "act3": "",
    "ending": ""
  },
  "locations": [
    {
      "name": "",
      "description": "",
      "secrets": []
    }
  ],
  "npcs": [
    {
      "name": "",
      "role": "",
      "description": "",
      "personality": "",
      "motivation": "",
      "secret": "",
      "stats": {
        "armorClass": 10,
        "hitPoints": 10,
        "speed": "30 ft",
        "attacks": [],
        "abilities": []
      }
    }
  ],
  "monsters": [
    {
      "name": "",
      "description": "",
      "armorClass": 10,
      "hitPoints": 10,
      "speed": "30 ft",
      "attacks": [],
      "abilities": []
    }
  ],
  "encounters": [
    {
      "name": "",
      "location": "",
      "difficulty": "",
      "description": "",
      "enemies": [],
      "objectives": []
    }
  ],
  "quests": [
    {
      "name": "",
      "description": "",
      "objective": "",
      "reward": ""
    }
  ],
  "items": [
    {
      "name": "",
      "type": "",
      "description": "",
      "effect": ""
    }
  ],
  "boss": {
    "name": "",
    "description": "",
    "armorClass": 10,
    "hitPoints": 100,
    "attacks": [],
    "abilities": [],
    "phases": []
  },
  "playerCharacters": [
    {
      "name": "",
      "class": "",
      "race": "",
      "background": "",
      "personality": "",
      "motivation": ""
    }
  ]
}

Generate enough content to make the campaign actually playable.

If the user asks for a horror campaign, make it scary.
If they ask for fantasy, make it epic.
If they ask for comedy, make it funny.
If they ask for a specific theme, follow it.

Do not invent fields outside the structure above.
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
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    console.log("Gemini status:", response.status);
    console.log("Gemini response:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.error?.message ||
          "Gemini API request failed"
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned an empty response"
      });
    }

    let campaign;

    try {
      campaign = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Gemini text:", text);

      return res.status(500).json({
        error: "Gemini returned invalid campaign JSON"
      });
    }

    return res.status(200).json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error("DM-AI error:", error);

    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
}
