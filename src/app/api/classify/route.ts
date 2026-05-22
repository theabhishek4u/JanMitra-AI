import { NextResponse } from "next/server";
import { classifyComplaint } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { text, image, imageName } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to local keyword classifier.");
      const localResult = classifyComplaint(text || "");
      return NextResponse.json({ ...localResult, isFallback: true });
    }

    // Build parts for Gemini API
    const parts: any[] = [];

    // System prompt instructing structured JSON output
    const systemPrompt = `You are the JanMitra AI Smart Governance Classifier for Uttar Pradesh's Jansunwai system. 
Analyze the user's grievance report (text and optional image) and categorize it under one of these exact categories:
1. "Garbage / Sanitation" -> routed to department "Lucknow Nagar Nigam" (Hindi: "लखनऊ नगर निगम")
2. "Water Supply" -> routed to department "Jal Nigam" (Hindi: "उत्तर प्रदेश जल निगम")
3. "Road Damage" -> routed to department "Public Works Department" (Hindi: "लोक निर्माण विभाग (PWD)")
4. "Electricity" -> routed to department "Power Department (UPPCL)" (Hindi: "विद्युत विभाग (UPPCL)")
5. "Street Light" -> routed to department "Municipal Authority" (Hindi: "नगर पालिका प्राधिकरण") or "Lucknow Municipal Corporation" (Hindi: "लखनऊ नगर निगम (LMC)")
6. "Illegal Construction" -> routed to department "Municipal Authority" (Hindi: "नगर पालिका प्राधिकरण")
7. "Encroachment" -> routed to department "Municipal Authority" (Hindi: "नगर पालिका प्राधिकरण")
8. "Corruption" -> routed to department "Anti-Corruption Bureau" (Hindi: "भ्रष्टाचार निरोधक ब्यूरो")
9. "Public Health" -> routed to department "Health Department" (Hindi: "स्वास्थ्य विभाग (CMO)")

You MUST return a JSON object with the following fields:
{
  "category": "One of the English category names exactly as listed above",
  "categoryHi": "The exact Hindi translation of the category as listed above",
  "priority": "low" | "medium" | "high",
  "urgency": "Short statement e.g. 'Requires immediate attention' or 'Should be resolved in 48 hours'",
  "department": "One of the exact English department names listed above",
  "departmentHi": "One of the exact Hindi department names listed above",
  "summary": "1-2 sentence English summary of the issue. Focus on technical and location details if present.",
  "summaryHi": "1-2 sentence Hindi summary of the issue.",
  "confidence": A float between 0.85 and 0.99,
  "predictedResolutionDays": An integer between 1 and 14 representing expected time to resolve (SLA)
}

Be intelligent. If there is an image, combine the image features (e.g. visible pothole, overflowing garbage, broken pole, leakages) with any text provided to make a precise decision.
The user text might be in Hindi, Hinglish (Hindi written in Latin script), Urdu, or English. Please read and comprehend it correctly.
Return ONLY valid JSON matching this schema. No extra text, no markdown block wrappers.`;

    parts.push({ text: systemPrompt });

    // User prompt
    const userText = text || "Analyze this civic issue report.";
    parts.push({ text: `User Grievance Report: "${userText}"` });

    // Include base64 image if uploaded
    if (image) {
      // image format is usually "data:image/jpeg;base64,..."
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    // Call Gemini API via standard fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts,
            },
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API returned an error:", errorText);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No response text generated from Gemini");
    }

    // Parse the JSON output safely
    let classification = JSON.parse(generatedText.trim());

    // Validation/Fallback checks in case model did not output expected fields
    if (!classification.category || !classification.department) {
      throw new Error("Invalid classification JSON fields from Gemini response");
    }

    return NextResponse.json({ ...classification, isFallback: false });

  } catch (error: any) {
    console.error("Error in API classify route:", error);
    // If anything fails, fallback to local classifier
    try {
      const body = await request.json().catch(() => ({}));
      const localResult = classifyComplaint(body.text || "");
      return NextResponse.json({ ...localResult, isFallback: true, error: error.message });
    } catch {
      return NextResponse.json({ error: "Failed to classify complaint", isFallback: true }, { status: 500 });
    }
  }
}
