exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Groq API Key — Netlify Environment Variable se aayegi
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  try {
    const { messages, system } = JSON.parse(event.body);

    // Groq ke liye messages format karo
    const formattedMessages = [
      { role: 'system', content: system },
      ...messages
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        messages: formattedMessages
      })
    });

    const data = await response.json();

    // Groq response ko Claude jaisa format karo (frontend same rahega)
    const reply = data.choices?.[0]?.message?.content || 'Kuch problem aayi.';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: [{ type: 'text', text: reply }]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
