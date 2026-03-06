const functions = require('firebase-functions');
const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch@2 in functions folder
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const GEMINI_KEY = functions.config().gemini.key;

app.post('/generate', async (req, res) => {
  try {
    const { model = 'gemini-2.5-flash', prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Gemini error', raw: data });
    }

    // Return the generated text only (or the whole response if you want)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ text, raw: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

exports.api = functions.https.onRequest(app);