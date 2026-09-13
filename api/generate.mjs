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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing"
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `You are DM-AI, an expert Dungeons & Dragons campaign assistant.

The user wants:
${prompt}

Create a useful D&D campaign response. Include:
- Campaign title
- Campaign overview
- Main storyline
- Quests
- NPCs
- Locations
- Monsters
- Encounters
- Rewards
- Final boss

Write the result in clear, organized Markdown.
`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API request failed"
      });
    }

    const text =
      data.output_text ||
      data.output?.flatMap(item =>
        item.content?.filter(c => c.type === "output_text").map(c => c.text) || []
      ).join("") ||
      "The AI returned no content.";

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
