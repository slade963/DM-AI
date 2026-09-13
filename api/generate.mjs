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

        if (!prompt) {
            return res.status(400).json({
                error: "No campaign prompt was provided."
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY is missing from Vercel."
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1/interactions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({
                    model: "gemini-3.6-flash",

                    input: `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master assistant.

Turn the user's idea into a complete, creative and playable D&D campaign.

Create content that a Dungeon Master can actually use at the table.

Organize the campaign with clear headings.

Include, when appropriate:

CAMPAIGN PREMISE
MAIN STORY
VILLAINS
IMPORTANT NPCs
LOCATIONS
MAIN QUESTS
SIDE QUESTS
ENCOUNTERS
MONSTERS
REWARDS
PLOT TWISTS
FINAL BOSS
FUTURE ADVENTURE IDEAS

Make everything cohesive, detailed, creative, and easy for a DM to run.

Adapt the campaign to exactly what the user requests.

USER'S CAMPAIGN REQUEST:

${prompt}
`
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Gemini request failed."
            });
        }

        const result =
            data?.output_text ||
            data?.steps
                ?.filter(step => step.type === "model_output")
                ?.flatMap(step => step.content || [])
                ?.filter(item => item.type === "text")
                ?.map(item => item.text)
                ?.join("") ||
            "Gemini did not return a campaign.";

        return res.status(200).json({
            result
        });

    } catch (error) {
        console.error("DM-AI Gemini error:", error);

        return res.status(500).json({
            error:
                error.message ||
                "Something went wrong while generating the campaign."
        });
    }
}
