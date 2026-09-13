\export default async function handler(req, res) {
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
                error: "GEMINI_API_KEY is missing."
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({
                    model: "gemini-3.7-flash",

                    system_instruction: `
You are DM-AI, an expert Dungeons & Dragons
Dungeon Master assistant.

Turn the user's idea into a complete,
creative and playable D&D campaign.

Make it easy for a Dungeon Master to use.

Include appropriate sections such as:

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

Make everything cohesive, detailed,
creative and fun.

Adapt everything to the user's request.
`,

                    input: prompt,

                    generation_config: {
                        max_output_tokens: 6000,
                        thinking_level: "low"
                    },

                    store: false
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Gemini API request failed."
            });
        }

        const result =
            data?.steps
                ?.filter(step => step.type === "model_output")
                ?.flatMap(step => step.content || [])
                ?.filter(item => item.type === "text")
                ?.map(item => item.text)
                ?.join("") ||
            "DM-AI didn't receive a campaign response.";

        return res.status(200).json({
            result
        });

    } catch (error) {
        console.error("DM-AI error:", error);

        return res.status(500).json({
            error: error.message || "Something went wrong."
        });
    }
}
