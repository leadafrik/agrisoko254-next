import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 30;

type MarketEntry = {
  name: string;
  price: number;
  unit: string;
  trend: string;
  bestMarket: string;
  bestCounty: string;
  bestPrice: number;
};

type InsightRequest = {
  category: "produce" | "livestock" | "inputs";
  products: MarketEntry[];
};

const categoryLabel: Record<string, string> = {
  produce: "agricultural produce",
  livestock: "livestock",
  inputs: "farm inputs (fertilizers)",
};

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ brief: null }, { status: 200 });
  }

  let body: InsightRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { category, products } = body;
  if (!products?.length) {
    return NextResponse.json({ brief: null }, { status: 200 });
  }

  const productLines = products
    .map(
      (p) =>
        `- ${p.name}: average KES ${p.price.toLocaleString()}/${p.unit}, trend ${p.trend}, strongest at ${p.bestMarket} (${p.bestCounty}) at KES ${p.bestPrice.toLocaleString()}`
    )
    .join("\n");

  const prompt = `You are a senior agricultural market analyst covering Kenya. Based on the following live market data for ${categoryLabel[category] ?? category}, write a concise, actionable market brief for Kenyan farmers and traders.

Current market data:
${productLines}

Write 3 short, sharp paragraphs:
1. What the current market conditions look like overall (2 sentences max)
2. The key opportunity or risk right now — where should farmers focus attention (2 sentences max)
3. One practical, specific action recommendation (1-2 sentences)

Write directly to the farmer/trader. Use plain language. Be specific about counties, prices, and commodities. Do not use bullet points. Do not add a title or header. Do not mention that this is AI-generated.`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : null;

    return NextResponse.json({ brief: text }, { status: 200 });
  } catch (err) {
    console.error("[market-intelligence/insight]", err);
    return NextResponse.json({ brief: null }, { status: 200 });
  }
}
