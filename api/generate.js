export default async function handler(request) {
    // Only allow POST requests
    if (request.method !== "POST") {
        return Response.json(
            { error: "Method not allowed" },
            { status: 405 }
        );
    }

    try {
        // Get the user's prompt
        const body = await request.json();
        const prompt = body.prompt;

        if (!prompt || !prompt.trim()) {
            return Response.json(
                { error: "Please provide a campaign idea." },
                { status: 400 }
            );
        }

        // Make sure our secret exists
        if (!process.env.OPENAI_API_KEY) {
            return Response.json(
                { error: "OpenAI API key is not configured." },
                { status: 500 }
            );
        }

        // Ask OpenAI to build the campaign
        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },

                body: JSON.stringify({
                    model: "gpt-5.6",
                    instructions: `
You are DM-AI, an expert Dungeons & Dragons
campaign designer and Dungeon Master assistant.

Your job is to help DMs create exciting,
playable D&D campaigns.

When a user gives you a campaign idea,
expand it into useful D&D material.

Include, when appropriate:

- Campaign title
- Campaign overview
- Setting
- Main storyline
- Main villain
- Villain motivation
- Important NPCs
- Important locations
- Main quests
- Side quests
- Secrets
- Plot twists
- Encounters
- Possible campaign endings

Make the content creative, coherent, and
easy for a Dungeon Master to actually use
at the table.

Do not overwhelm the DM with unnecessary
information. Organize your response using
clear headings and readable sections.

If the user's request is vague, make
reasonable creative decisions rather than
refusing to create the campaign.
                    `,
                    input: prompt
                })
            }
        );

        const data = await response.json();

        // OpenAI returned an error
        if (!response.ok) {
            console.error("OpenAI error:", data);

            return Response.json(
                {
                    error:
                        data.error?.message ||
                        "OpenAI request failed."
                },
                { status: response.status }
            );
        }

        // Send the generated campaign back to DM-AI
        return Response.json({
            result: data.output_text
        });

    } catch (error) {

        console.error("Server error:", error);

        return Response.json(
            {
                error: "Something went wrong generating the campaign."
            },
            { status: 500 }
        );
    }
}
