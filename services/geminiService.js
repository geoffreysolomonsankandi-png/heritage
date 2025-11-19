const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAiSummaryAndSuggestions(story) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite"});
    const prompt = `Summarize the following historical story in one paragraph. Then, suggest three other types of related historical sites. Story: "${story}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI summary could not be generated at this time.";
  }
}

module.exports = { getAiSummaryAndSuggestions };