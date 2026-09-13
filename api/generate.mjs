export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "A campaign description is required."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing."
      });
    }

    const schema = {
      type: "OBJECT",
      properties: {
        title: {
          type: "STRING"
        },

        tagline: {
          type: "STRING"
        },

        setting: {
          type: "STRING"
        },

        tone: {
          type: "STRING"
        },

        difficulty: {
          type: "STRING"
        },

        recommended_level: {
          type: "STRING"
        },

        campaign_summary: {
          type: "STRING"
        },

        main_plot: {
          type: "STRING"
        },

        dm_intro: {
          type: "STRING"
        },

        player_hook: {
          type: "STRING"
        },

        locations: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              description: { type: "STRING" },
              important_npcs: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              secrets: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: [
              "name",
              "description",
              "important_npcs",
              "secrets"
            ]
          }
        },

        npcs: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              race: { type: "STRING" },
              role: { type: "STRING" },
              personality: { type: "STRING" },
              appearance: { type: "STRING" },
              motivation: { type: "STRING" },
              secret: { type: "STRING" },
              dialogue: { type: "STRING" }
            },
            required: [
              "name",
              "race",
              "role",
              "personality",
              "appearance",
              "motivation",
              "secret",
              "dialogue"
            ]
          }
        },

        monsters: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              type: { type: "STRING" },
              role: { type: "STRING" },
              description: { type: "STRING" },
              abilities: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              tactics: { type: "STRING" },
              suggested_cr: { type: "STRING" }
            },
            required: [
              "name",
              "type",
              "role",
              "description",
              "abilities",
              "tactics",
              "suggested_cr"
            ]
          }
        },

        quests: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              type: { type: "STRING" },
              description: { type: "STRING" },
              objective: { type: "STRING" },
              reward: { type: "STRING" },
              consequences: { type: "STRING" }
            },
            required: [
              "name",
              "type",
              "description",
              "objective",
              "reward",
              "consequences"
            ]
          }
        },

        encounters: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              location: { type: "STRING" },
              description: { type: "STRING" },
              enemies: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              environment: { type: "STRING" },
              tactics: { type: "STRING" },
              difficulty: { type: "STRING" },
              dm_notes: { type: "STRING" }
            },
            required: [
              "name",
              "location",
              "description",
              "enemies",
              "environment",
              "tactics",
              "difficulty",
              "dm_notes"
            ]
          }
        },

        items: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              rarity: { type: "STRING" },
              type: { type: "STRING" },
              description: { type: "STRING" },
              ability: { type: "STRING" },
              location_found: { type: "STRING" }
            },
            required: [
              "name",
              "rarity",
              "type",
              "description",
              "ability",
              "location_found"
            ]
          }
        },

        player_character_templates: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              race: { type: "STRING" },
              class: { type: "STRING" },
              background: { type: "STRING" },
              personality: { type: "STRING" },
              backstory: { type: "STRING" },
              motivation: { type: "STRING" },
              ability_scores: {
                type: "OBJECT",
                properties: {
                  strength: { type: "INTEGER" },
                  dexterity: { type: "INTEGER" },
                  constitution: { type: "INTEGER" },
                  intelligence: { type: "INTEGER" },
                  wisdom: { type: "INTEGER" },
                  charisma: { type: "INTEGER" }
                },
                required: [
                  "strength",
                  "dexterity",
                  "constitution",
                  "intelligence",
                  "wisdom",
                  "charisma"
                ]
              },
              starting_equipment: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: [
              "name",
              "race",
              "class",
              "background",
              "personality",
              "backstory",
              "motivation",
              "ability_scores",
              "starting_equipment"
            ]
          }
        },

        chapters: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              chapter_number: { type: "INTEGER" },
              title: { type: "STRING" },
              summary: { type: "STRING" },
              objectives: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              important_events: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              encounters: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              dm_guidance: { type: "STRING" }
            },
            required: [
              "chapter_number",
              "title",
              "summary",
              "objectives",
              "important_events",
              "encounters",
              "dm_guidance"
            ]
          }
        },

        final_boss: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            description: { type: "STRING" },
            motivation: { type: "STRING" },
            abilities: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            phases: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            tactics: { type: "STRING" },
            arena: { type: "STRING" },
            suggested_cr: { type: "STRING" }
          },
          required: [
            "name",
            "description",
            "motivation",
            "abilities",
            "phases",
            "tactics",
            "arena",
            "suggested_cr"
          ]
        },

        random_encounters: {
          type: "ARRAY",
          items: { type: "STRING" }
        },

        dm_tips: {
          type: "ARRAY",
          items: { type: "STRING" }
        },

        opening_scene: {
          type: "STRING"
        }
      },

      required: [
        "title",
        "tagline",
        "setting",
        "tone",
        "difficulty",
        "recommended_level",
        "campaign_summary",
        "main_plot",
        "dm_intro",
        "player_hook",
        "locations",
        "npcs",
        "monsters",
        "quests",
        "encounters",
        "items",
        "player_character_templates",
        "chapters",
        "final_boss",
        "random_encounters",
        "dm_tips",
        "opening_scene"
      ]
    };

    const systemPrompt = `
You are DM-AI, an expert Dungeons & Dragons campaign designer.

The user will describe the campaign they want.

Your job is to create a COMPLETE campaign package for a Dungeon Master.

Do NOT only write a story.

Create usable D&D material including:
- campaign premise
- setting
- locations
- NPCs
- monsters
- quests
- encounters
- treasure and magic items
- player character templates
- chapters
- final boss
- random encounters
- DM advice
- opening scene

Make everything connected to the user's idea.

The campaign should feel like a real playable D&D campaign.

Create enough detail that a DM could actually sit down and run the adventure.

Player character templates should be useful pre-generated characters that fit the campaign.

Monster abilities should be practical and understandable.

NPCs should have motivations, secrets and dialogue.

Encounters should explain what the DM should actually do.

The final boss should be memorable and have multiple phases.

IMPORTANT:
Return ONLY the requested structured JSON data.
Do not use Markdown.
Do not wrap the JSON in code fences.
Do not include commentary outside the JSON.
`;

    const userPrompt = `
Create a complete D&D campaign based on this request:

"${prompt}"

Make the campaign creative, coherent, playable and detailed.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt + "\n\n" + userPrompt
                }
              ]
            }
          ],

          generationConfig: {
            response_mime_type: "application/json",
            response_schema: schema,
            max_output_tokens: 30000
          }
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

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!text) {
      console.error("Gemini returned no text:", data);

      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    let campaign;

    try {
      campaign = JSON.parse(text);
    } catch (parseError) {
      console.error("Invalid Gemini JSON:", text);

      return res.status(500).json({
        error: "Gemini generated invalid campaign data.",
        details: parseError.message
      });
    }

    return res.status(200).json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Failed to generate campaign.",
      details: error.message
    });
  }
}
