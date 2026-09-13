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

        const openAIResponse = await fetch(
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

The user is asking you to create or develop a D&D campaign.

Create useful material that a Dungeon Master can actually use at the table.

Depending on the request, include:
- Campaign premise
- Main storyline
- Villains
- NPCs
- Locations
- Quests
- Side quests
- Encounters
- Monsters
- Rewards
- Plot twists
- Final boss
- Future adventure ideas

Make everything creative, organized and easy to run.

Do not talk about being an AI unless the user asks.
`,

                    input: prompt
                })
            }
        );

        const data = await openAIResponse.json();

        if (!openAIResponse.ok) {
            return res.status(openAIResponse.status).json({
                error:
                    data?.error?.message ||
                    "OpenAI request failed"
            });
        }

        return res.status(200).json({
            result:
                data.output_text ||
                "No campaign was generated."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
}
