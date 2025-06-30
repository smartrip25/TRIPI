// lib/openai.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: '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' });

export async function askGPT(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Puedes usar también 'gpt-3.5-turbo'
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content || 'Sin respuesta.';
  } catch (error) {
    console.error('Error llamando a OpenAI:', error);
    return 'Ocurrió un error al obtener la respuesta del bot.';
  }
}