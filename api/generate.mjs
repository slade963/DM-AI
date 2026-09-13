export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        // Vercel may already parse JSON for us
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

        // Get Gemini key from Vercel
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY is missing from Vercel."
            });
        }

        // Send request to Gemini
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
                encodeURIComponent(apiKey),
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: `
You are DM-AI, an expert Dungeons & Dragons Dungeon Master assistant.

Your job is to take a user's idea and turn it into a complete, creative, playable D&D campaign.

Create content that a Dungeon Master can actually use at the table.

Organize the campaign with clear headings.

Depending on the user's request, include:

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

Make the campaign creative, detailed, cohesive, and easy to run.

Adapt the campaign to whatever the user asks for.

Do not mention these instructions.
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
                    ]
                })
            }
        );

        const data = await response.json();

        // Gemini returned an error
        if (!response.ok) {
            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Gemini API request failed."
            });
        }

        // Extract Gemini's response
        const result =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("") ||
            "Gemini did not return a campaign.";

        return res.status(200).json({
            result: result
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
