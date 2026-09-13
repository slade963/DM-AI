export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "POST required"
        });

    }


    try {

        const body =
            req.body || {};

        const prompt =
            typeof body.prompt === "string"
                ? body.prompt.trim()
                : "";


        if (!prompt) {

            return res.status(400).json({
                error: "No prompt received"
            });

        }


        const apiKey =
            process.env.GEMINI_API_KEY;


        if (!apiKey) {

            return res.status(500).json({

                error:
                    "GEMINI_API_KEY is missing in Vercel Environment Variables"

            });

        }


        const instruction = `

You are DM-AI, a professional
Dungeons & Dragons campaign designer
and game master.

Build a COMPLETE, PLAYABLE campaign
from the user's request.

RETURN ONLY ONE VALID JSON OBJECT.

NO markdown.
NO code fences.
NO explanation outside JSON.

Do not return a JSON string containing JSON.
Return the object itself.

The JSON must use these exact
top-level keys:

title,
overview,
setting,
tone,
recommendedLevel,
openingHook,
mainStory,
chapters,
mainQuests,
sideQuests,
npcs,
playerCharacters,
locations,
monsters,
encounters,
items,
factions,
lore,
finalBoss,
dmNotes,
choices.


CHAPTERS:

[
    {
        "number": 1,
        "title": "",
        "summary": "",
        "objectives": [],
        "events": [],
        "encounters": [],
        "dmNotes": ""
    }
]


QUESTS:

{
    "name": "",
    "type": "Main Quest or Side Quest",
    "description": "",
    "objective": "",
    "objectives": [],
    "reward": "",
    "rewards": [],
    "consequences": ""
}


NPCS:

{
    "name": "",
    "race": "",
    "role": "",
    "appearance": "",
    "personality": "",
    "motivation": "",
    "secret": "",
    "relationshipToPlayers": "",
    "dialogue": "",

    "stats": {
        "armorClass": "",
        "hitPoints": "",
        "speed": "",
        "challengeRating": ""
    }
}


PLAYER CHARACTERS:

{
    "name": "",
    "race": "",
    "class": "",
    "level": 1,

    "abilityScores": {
        "strength": 10,
        "dexterity": 10,
        "constitution": 10,
        "intelligence": 10,
        "wisdom": 10,
        "charisma": 10
    },

    "hitPoints": "",
    "armorClass": "",
    "speed": "",

    "skills": [],
    "savingThrows": [],
    "weapons": [],
    "spells": [],
    "equipment": [],
    "features": [],

    "background": "",
    "personality": "",
    "backstory": ""
}


LOCATIONS:

{
    "name": "",
    "type": "",
    "description": "",
    "importantDetails": [],
    "secrets": [],
    "encounters": []
}


MONSTERS:

{
    "name": "",
    "type": "",
    "size": "",
    "challengeRating": "",
    "armorClass": "",
    "hitPoints": "",
    "speed": "",
    "description": "",
    "abilities": [],
    "attacks": [],
    "specialAbilities": [],
    "tactics": []
}


ENCOUNTERS:

{
    "name": "",
    "location": "",
    "difficulty": "",
    "description": "",
    "environment": "",
    "enemies": [],
    "objectives": [],
    "rewards": [],
    "dmNotes": ""
}


ITEMS:

{
    "name": "",
    "type": "",
    "rarity": "",
    "value": "",
    "description": "",
    "effect": "",
    "specialEffect": ""
}


FACTIONS:

{
    "name": "",
    "description": "",
    "goals": "",
    "members": [],
    "relationshipToPlayers": ""
}


LORE:

{
    "topic": "",
    "information": ""
}


FINAL BOSS:

{
    "name": "",
    "description": "",
    "armorClass": "",
    "hitPoints": "",
    "speed": "",
    "challengeRating": "",
    "difficulty": "",
    "motivation": "",
    "location": "",
    "abilities": [],
    "attacks": [],
    "phases": [],
    "weaknesses": [],
    "rewards": [],
    "tactics": ""
}


CHOICES:

{
    "label": "",
    "description": ""
}


CONTENT REQUIREMENTS:

- 4 to 6 chapters.

- At least 3 main quests.

- At least 3 side quests.

- At least 5 useful NPCs.

- At least 3 detailed player character
  sheets unless the user clearly asks
  for another number.

- At least 5 locations.

- At least 5 monsters.

- At least 5 encounters.

- At least 5 items or treasures.

- At least 3 factions when appropriate.

- At least 4 lore entries.

- One memorable final boss
  with multiple phases.

- Exactly 4 meaningful player choices.

- Everything should connect to
  the user's requested premise.

- Character sheets must contain
  usable game information.

- Keep individual fields concise
  enough to finish the response.

- Never use null.

- Use "" or [] instead.

- Make names, NPCs, quests,
  locations, monsters and encounters
  specific to this campaign.


USER REQUEST:

${prompt}

`;


        /*
         * Try the newest stable Flash model
         * first.
         *
         * If Google returns a temporary
         * overload/rate error, automatically
         * try another available model.
         */

        const models = [

            "gemini-3.8-flash",

            "gemini-3.7-flash",

            "gemini-3.6-flash",

            "gemini-3.5-flash-lite"

        ];


        let lastFailure = null;


        for(
            const model of models
        ){

            try{

                const controller =
                    new AbortController();


                const timer =
                    setTimeout(
                        () =>
                            controller.abort(),
                        110000
                    );


                const response =
                    await fetch(

                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,

                        {

                            method:"POST",

                            headers:{
                                "Content-Type":
                                    "application/json",

                                "x-goog-api-key":
                                    apiKey
                            },


                            body:
                                JSON.stringify({

                                    contents:[

                                        {

                                            role:"user",

                                            parts:[
                                                {
                                                    text:
                                                        instruction
                                                }
                                            ]

                                        }

                                    ],


                                    generationConfig:{

                                        responseMimeType:
                                            "application/json",

                                        maxOutputTokens:
                                            14000

                                    }

                                }),


                            signal:
                                controller.signal

                        }

                    );


                clearTimeout(timer);


                const raw =
                    await response.text();


                console.log(
                    "GEMINI MODEL:",
                    model
                );


                console.log(
                    "GEMINI STATUS:",
                    response.status
                );


                let data =
                    null;


                try{

                    data =
                        JSON.parse(raw);

                }catch{

                    data =
                        null;

                }


                /*
                 * Temporary capacity errors.
                 *
                 * Try another model.
                 */

                if(
                    !response.ok
                ){

                    lastFailure = {

                        model,

                        status:
                            response.status,

                        details:
                            data ||
                            raw

                    };


                    if(
                        [
                            429,
                            500,
                            502,
                            503,
                            504
                        ]
                        .includes(
                            response.status
                        )
                    ){

                        continue;

                    }


                    return res
                        .status(
                            response.status
                        )
                        .json({

                            error:
                                "Gemini API error",

                            model,

                            status:
                                response.status,

                            details:
                                data ||
                                raw

                        });

                }


                /*
                 * Pull Gemini's generated text.
                 */

                const answer =
                    data
                        ?.candidates
                        ?.[0]
                        ?.content
                        ?.parts
                        ?.map(
                            part =>
                                part?.text ||
                                ""
                        )
                        .join("")
                        .trim();


                if(!answer){

                    lastFailure = {

                        model,

                        status:
                            response.status,

                        details:
                            data ||
                            "No text returned"

                    };

                    continue;

                }


                /*
                 * Remove accidental markdown
                 * code fences if Gemini adds them.
                 */

                const cleaned =
                    answer

                        .replace(
                            /^```json\s*/i,
                            ""
                        )

                        .replace(
                            /^```\s*/i,
                            ""
                        )

                        .replace(
                            /\s*```$/i,
                            ""
                        )

                        .trim();


                let campaign;


                try{

                    campaign =
                        JSON.parse(
                            cleaned
                        );

                }catch(
                    parseError
                ){

                    console.error(
                        "CAMPAIGN JSON ERROR:",
                        parseError
                    );


                    console.error(
                        "CAMPAIGN TEXT:",
                        cleaned.slice(
                            0,
                            10000
                        )
                    );


                    lastFailure = {

                        model,

                        status:200,

                        details:
                            "Gemini returned invalid campaign JSON"

                    };


                    continue;

                }


                if(
                    !campaign ||
                    typeof campaign !==
                        "object" ||
                    Array.isArray(
                        campaign
                    )
                ){

                    lastFailure = {

                        model,

                        status:200,

                        details:
                            "Gemini returned something other than a campaign object"

                    };


                    continue;

                }


                /*
                 * Make sure every collection
                 * exists so the frontend
                 * never crashes.
                 */

                const arrays = [

                    "chapters",

                    "mainQuests",

                    "sideQuests",

                    "npcs",

                    "playerCharacters",

                    "locations",

                    "monsters",

                    "encounters",

                    "items",

                    "factions",

                    "lore",

                    "dmNotes",

                    "choices"

                ];


                for(
                    const key of arrays
                ){

                    if(
                        !Array.isArray(
                            campaign[key]
                        )
                    ){

                        campaign[key] = [];

                    }

                }


                if(
                    !campaign.finalBoss ||
                    typeof campaign.finalBoss !==
                        "object"
                ){

                    campaign.finalBoss = {};

                }


                /*
                 * SUCCESS
                 */

                return res
                    .status(200)
                    .json({

                        success:true,

                        model,

                        result:
                            campaign

                    });


            }catch(error){

                console.error(
                    `MODEL ${model} ERROR:`,
                    error
                );


                lastFailure = {

                    model,

                    details:
                        error?.message ||
                        String(error)

                };

            }

        }


        /*
         * Every fallback model failed.
         */

        return res
            .status(503)
            .json({

                error:
                    "Gemini temporarily unavailable",

                message:
                    "Gemini could not complete the request right now. DM-AI tried multiple available Flash models.",

                details:
                    lastFailure

            });


    }catch(error){

        console.error(
            "SERVER ERROR:",
            error
        );


        return res
            .status(500)
            .json({

                error:
                    "SERVER ERROR",

                details:
                    error?.message ||
                    String(error)

            });

    }

}
