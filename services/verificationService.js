const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure you have your Gemini API key in the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Verifies a historical fact about Namibia using the Gemini API and Wikipedia as a source.
 * @param {string} factText The historical fact to verify.
 * @returns {Promise<boolean>} A promise that resolves to true if the fact is verified, otherwise false.
 */
async function verifyHistoricalFact(factText) {
  if (!factText || factText.trim() === '') {
    return false;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    // Construct a very specific prompt for fact-checking
    const prompt = `
      Please act as a historical fact-checker. Your only source of information is Wikipedia.
      Analyze the following statement about Namibian history.
      Respond with "Yes" if the statement is verifiably true according to Wikipedia.
      Respond with "No" if the statement is verifiably false or cannot be confirmed by Wikipedia.
      Do not provide any explanation or additional text, only "Yes" or "No".

      Statement: "${factText}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Check if the AI's response is a confirmation
    return text.toLowerCase() === 'yes';

  } catch (error)
  {
    console.error("Gemini API Error during fact verification:", error);
    // In case of an API error, we default to not verifying the fact
    return false;
  }
}

module.exports = { verifyHistoricalFact };