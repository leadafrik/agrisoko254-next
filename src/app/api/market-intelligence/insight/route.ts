import Groq from "groq-sdk";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const maxDuration = 20;

type InsightRequest = {
  productKey: string;
  productName: string;
  unit: string;
  overallAverage: number;
  overallTrend: string;
  bestMarket: string;
  bestCounty: string;
  bestPrice: number;
  weakestMarket: string;
  weakestCounty: string;
  weakestPrice: number;
};

const getInsight = unstable_cache(
  async (req: InsightRequest): Promise<string | null> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const client = new Groq({ apiKey });

    const prompt = `You are a Kenyan agricultural market analyst writing for farmers and traders. In 1 to 2 sentences (60 words max), give the single most actionable insight about ${req.productName} prices right now. Be specific — use county names and KES prices. No preamble. No bullet points. No sign-off.

Current data:
- Board average: KES ${req.overallAverage.toLocaleString()} / ${req.unit} · ${req.overallTrend}
- Best market: ${req.bestMarket}, ${req.bestCounty} at KES ${req.bestPrice.toLocaleString()}
- Weakest market: ${req.weakestMarket}, ${req.weakestCounty} at KES ${req.weakestPrice.toLocaleString()}`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 120,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0]?.message?.content?.trim() ?? null;
  },
  ["market-brief"],
  { revalidate: 18000 } // 5 hours
);

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ brief: null }, { status: 200 });
  }

  let body: InsightRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const brief = await getInsight(body);
    return NextResponse.json(
      { brief },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=18000, stale-while-revalidate=3600" },
      }
    );
  } catch (err) {
    console.error("[market-intelligence/insight]", err);
    return NextResponse.json({ brief: null }, { status: 200 });
  }
}
