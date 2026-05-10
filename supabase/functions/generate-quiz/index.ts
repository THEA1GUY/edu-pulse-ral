import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

Deno.serve(async (req) => {
  const { topic, difficulty, language, isBilingual, questionType } = await req.json();

  const prompt = `
    You are an expert educator. Generate a quiz about "${topic}".
    Difficulty: ${difficulty}
    Question Type: ${questionType} (either 'objective' or 'essay')
    Target Language: ${language}
    Bilingual Mode: ${isBilingual ? 'Yes (Provide both English and ' + language + ')' : 'No (English only)'}

    Return the result strictly as a JSON array of 5 questions.
    Each question should have:
    - question_text (string)
    - translation_text (string, optional, only if isBilingual is true)
    - options (array of 4 strings, only if questionType is 'objective')
    - correct_answer_index (number, 0-3, only if questionType is 'objective')
    - model_answer (string, only if questionType is 'essay')

    Ensure the questions are challenging and accurate.
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates educational quizzes in JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    // Support both { questions: [] } and [] formats
    const questions = Array.isArray(content) ? content : (content.questions || []);

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
