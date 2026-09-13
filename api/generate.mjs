export default async function handler(req, res) {
  try {
    // --------------------------------------------------
    // METHOD CHECK
    // --------------------------------------------------

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "POST required"
      });
    }

    // --------------------------------------------------
    // GET PROMPT
    // --------------------------------------------------

    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        error: "No valid prompt received"
      });
    }

    // --------------------------------------------------
    // GEMINI KEY
    // --------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is missing from Vercel"
      });
    }

    // --------------------------------------------------
    // MASTER DM INSTRUCTION
    // --------------------------------------------------

    const systemPrompt = `
You are DM-AI, an advanced Dungeons & Dragons campaign generator.

The user will describe an adventure, campaign, character, NPC, monster, dungeon,
quest, encounter, or other D&D idea.

You MUST generate structured campaign information.

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not include explanations outside the JSON.

Build the response with these fields:

{
  "title": "Campaign title",
  "summary": "Short campaign summary",
  "setting": "Detailed setting",
  "tone": "Tone and atmosphere",

  "story": {
    "premise": "Main premise",
    "opening": "Opening scene",
    "act1": "First act",
    "act2": "Second act",
    "act3": "Third act",
    "climax": "Major climax",
    "ending": "Possible ending"
  },

  "characters": [
    {
      "name": "Character name",
      "race": "Race",
      "class": "Class",
      "level": 1,
      "alignment": "Alignment",
      "background": "Background",
      "personality": "Personality",
      "appearance": "Appearance",
      "abilities": [
        "Ability 1",
        "Ability 2"
      ],
      "equipment": [
        "Item 1",
        "Item 2"
      ],
      "backstory": "Backstory"
    }
  ],

  "npcs": [
    {
      "name": "NPC name",
      "role": "Role",
      "race": "Race",
      "description": "Description",
      "personality": "Personality",
      "motivation": "Motivation",
      "secret": "Secret",
      "dialogue": "Example dialogue",
      "location": "Where they can be found"
    }
  ],

  "monsters": [
    {
      "name": "Monster",
      "type": "Creature type",
      "description": "Description",
      "challenge": "Challenge rating",
      "abilities": [
        "Ability 1",
        "Ability 2"
      ],
      "weakness": "Weakness",
      "tactics": "Combat tactics"
    }
  ],

  "locations": [
    {
      "name": "Location",
      "description": "Description",
      "secrets": [
        "Secret 1",
        "Secret 2"
      ],
      "encounters": [
        "Encounter 1"
      ],
      "treasure": [
        "Treasure 1"
      ]
    }
  ],

  "quests": [
    {
      "name": "Quest",
      "description": "Quest description",
      "objective": "Objective",
      "steps": [
        "Step 1",
        "Step 2",
        "Step 3"
      ],
      "reward": "Reward"
    }
  ],

  "encounters": [
    {
      "name": "Encounter",
      "location": "Location",
      "description": "Description",
      "enemies": [
        "Enemy 1"
      ],
      "difficulty": "Easy, Medium, Hard, or Deadly",
      "terrain": "Terrain",
      "specialRules": "Special rules"
    }
  ],

  "loot": [
    {
      "name": "Item",
      "type": "Weapon, armor, magic item, consumable, treasure, etc.",
      "rarity": "Rarity",
      "description": "Description",
      "effect": "Effect"
    }
  ],

  "factions": [
    {
      "name": "Faction",
      "description": "Description",
      "goal": "Goal",
      "leader": "Leader",
      "relationship": "Relationship to the players"
    }
  ],

  "boss": {
    "name": "Boss name",
    "description": "Description",
    "motivation": "Motivation",
    "abilities": [
      "Ability 1",
      "Ability 2",
      "Ability 3"
    ],
    "phases": [
      "Phase 1",
      "Phase 2",
      "Phase 3"
    ],
    "arena": "Boss arena",
    "reward": "Final reward"
  },

  "dmNotes": [
    "Useful DM note 1",
    "Useful DM note 2",
    "Useful DM note 3"
  ],

  "choices": [
    {
      "label": "Choice 1",
      "description": "What this choice does"
    },
    {
      "label": "Choice 2",
      "description": "What this choice does"
    },
    {
      "label": "Choice 3",
      "description": "What this choice does"
    },
    {
      "label": "Choice 4",
      "description": "What this choice does"
    }
  ]
}

IMPORTANT:

Generate information appropriate to the user's prompt.

If the user asks for a full campaign, generate EVERYTHING.

If the user asks for a character, heavily populate the characters section.

If the user asks for NPCs, heavily populate the NPC section.

If the user asks for a dungeon, heavily populate locations, encounters,
monsters, traps, treasure, and the boss.

If the user asks for a monster, heavily populate monsters.

Always provide four choices when choices make sense.

Make the content creative, detailed, playable, and interconnected.

The user request is:

${prompt}
`;

    // --------------------------------------------------
    // ABORT SLOW REQUESTS
    // --------------------------------------------------

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 45000);

    // --------------------------------------------------
    // CALL GEMINI
    // --------------------------------------------------

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: systemPrompt
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8,
            maxOutputTokens: 12000,

            responseSchema: {
              type: "OBJECT",

              properties: {
                title: { type: "STRING" },
                summary: { type: "STRING" },
                setting: { type: "STRING" },
                tone: { type: "STRING" },

                story: {
                  type: "OBJECT",
                  properties: {
                    premise: { type: "STRING" },
                    opening: { type: "STRING" },
                    act1: { type: "STRING" },
                    act2: { type: "STRING" },
                    act3: { type: "STRING" },
                    climax: { type: "STRING" },
                    ending: { type: "STRING" }
                  }
                },

                characters: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      race: { type: "STRING" },
                      class: { type: "STRING" },
                      level: { type: "INTEGER" },
                      alignment: { type: "STRING" },
                      background: { type: "STRING" },
                      personality: { type: "STRING" },
                      appearance: { type: "STRING" },
                      abilities: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      },
                      equipment: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      },
                      backstory: { type: "STRING" }
                    }
                  }
                },

                npcs: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      role: { type: "STRING" },
                      race: { type: "STRING" },
                      description: { type: "STRING" },
                      personality: { type: "STRING" },
                      motivation: { type: "STRING" },
                      secret: { type: "STRING" },
                      dialogue: { type: "STRING" },
                      location: { type: "STRING" }
                    }
                  }
                },

                monsters: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      type: { type: "STRING" },
                      description: { type: "STRING" },
                      challenge: { type: "STRING" },
                      abilities: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      },
                      weakness: { type: "STRING" },
                      tactics: { type: "STRING" }
                    }
                  }
                },

                locations: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      description: { type: "STRING" },
                      secrets: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      },
                      encounters: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      },
                      treasure: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      }
                    }
                  }
                },

                quests: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      description: { type: "STRING" },
                      objective: { type: "STRING" },
                      steps: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                      },
                      reward: { type: "STRING" }
                    }
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
                      difficulty: { type: "STRING" },
                      terrain: { type: "STRING" },
                      specialRules: { type: "STRING" }
                    }
                  }
                },

                loot: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      type: { type: "STRING" },
                      rarity: { type: "STRING" },
                      description: { type: "STRING" },
                      effect: { type: "STRING" }
                    }
                  }
                },

                factions: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      description: { type: "STRING" },
                      goal: { type: "STRING" },
                      leader: { type: "STRING" },
                      relationship: { type: "STRING" }
                    }
                  }
                },

                boss: {
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
                    arena: { type: "STRING" },
                    reward: { type: "STRING" }
                  }
                },

                dmNotes: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },

                choices: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      label: { type: "STRING" },
                      description: { type: "STRING" }
                    }
                  }
                }
              }
            }
          }
        }),

        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    // --------------------------------------------------
    // READ RESPONSE
    // --------------------------------------------------

    const raw = await response.text();

    console.log("GEMINI STATUS:", response.status);

    if (!response.ok) {
      console.error("GEMINI ERROR:", raw);

      return res.status(response.status).json({
        success: false,
        error: "Gemini API error",
        details: raw
      });
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Gemini returned invalid API JSON",
        details: raw
      });
    }

    // --------------------------------------------------
    // GET GEMINI TEXT
    // --------------------------------------------------

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) {
      console.error("NO GEMINI ANSWER:", JSON.stringify(data));

      return res.status(500).json({
        success: false,
        error: "Gemini returned no campaign data",
        details: data
      });
    }

    // --------------------------------------------------
    // PARSE CAMPAIGN JSON
    // --------------------------------------------------

    let campaign;

    try {
      campaign = JSON.parse(answer);
    } catch (error) {
      console.error("INVALID CAMPAIGN JSON:", answer);

      return res.status(500).json({
        success: false,
        error: "Gemini generated invalid campaign data",
        raw: answer
      });
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      result: campaign
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Gemini took too long to respond. Try again."
      });
    }

    return res.status(500).json({
      success: false,
      error: "SERVER ERROR",
      details: error.message
    });
  }
}
