export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { prompt } = req.body || {};

        if (!prompt) {
            return res.status(400).json({
                error: "No campaign prompt was provided."
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is not configured in Vercel."
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
                    model: "gpt-5-mini",

                    instructions: `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master assistant.

Your job is to help DMs quickly create complete, fun and playable D&D campaigns.

When a user gives you a campaign idea, expand it into useful material for a Dungeon Master.

Include appropriate sections such as:

- Campaign premise
- Main story
- Major villains
- Important NPCs
- Locations
- Quests
- Side quests
- Encounters
- Monsters
- Rewards
- Plot twists
- Final boss
- Suggestions for continuing the campaign

Make the campaign easy for a DM to actually run.

Be creative, organized and detailed, but don't overwhelm the user with unnecessary filler.

If the user asks for something specific, prioritize their request.
                    `,

                    input: prompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "OpenAI API request failed."
            });
        }

        const result =
            data.output_text ||
            data.output
                ?.flatMap(item => item.content || [])
                ?.map(item => item.text || "")
                ?.join("") ||
            "The AI didn't return any campaign content.";

        return res.status(200).json({
            result: result
        });

    } catch (error) {

        console.error("DM-AI API error:", error);

        return res.status(500).json({
            error:
                error.message ||
                "Internal server error."
        });
    }
}
