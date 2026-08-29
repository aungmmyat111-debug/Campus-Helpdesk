import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TicketAnalysis {
  category: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export const analyzeTicket = async (description: string): Promise<TicketAnalysis> => {
  const prompt = `You are an automated campus IT triage assistant. Analyze this issue description:
"${description}"

Return ONLY a valid JSON object matching this schema:
{
  "category": "HARDWARE" | "SOFTWARE" | "NETWORK" | "GENERAL",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}

Priority rules:
- URGENT: Affects whole classes/labs, safety hazards, severe outages.
- HIGH: Multiple users impacted, critical exam/lecture disruption.
- MEDIUM: Single user issue with partial workaround.
- LOW: Minor glitch, cosmetic issue, general inquiry.

Output strictly raw JSON without markdown code blocks.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content?.trim();
    if (content) {
      const parsed = JSON.parse(content);
      const validCategories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'GENERAL'];
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

      const category = validCategories.includes(parsed.category?.toUpperCase())
        ? parsed.category.toUpperCase()
        : 'GENERAL';

      const priority = validPriorities.includes(parsed.priority?.toUpperCase())
        ? parsed.priority.toUpperCase()
        : 'MEDIUM';

      console.log(`🤖 AI Analysis -> Category: ${category}, Priority: ${priority}`);
      return { category, priority };
    }
  } catch (error) {
    console.error('❌ AI Analysis Error:', error);
  }

  return { category: 'GENERAL', priority: 'MEDIUM' };
};