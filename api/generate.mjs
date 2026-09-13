export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "POST required"
      });
    }

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "No prompt received"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY NOT FOUND IN VERCEL"
      });
    }

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

    const raw = await response.text();

    console.log("STATUS:", response.status);
    console.log("RAW:", raw);

    if (!response.ok) {
      return res.status(500).json({
        error: "GEMINI ERROR",
        status: response.status,
        details: raw
      });
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Gemini returned something that wasn't JSON",
        raw: raw
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.status(500).json({
        error: "Gemini returned no text",
        geminiResponse: data
      });
    }

    return res.status(200).json({
      success: true,
      result: answer
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: "SERVER ERROR",
      details: error.message
    });
  }
}
