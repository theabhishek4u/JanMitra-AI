import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const simulatedText =
    "Solid waste dump near Mithai Chauraha in Gomti Nagar. Overflowing containers causing extreme stink, blocking pedestrian pathway, and attracting stray animals. Needs urgent sanitation cleaning and department intervention.";

  try {
    const { audio, mimeType } = await request.json();

    if (!audio || !mimeType) {
      return NextResponse.json({ error: "Missing audio data or mimeType" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to simulated transcription.");
      return NextResponse.json({ text: simulatedText, isFallback: true });
    }

    // Clean up base64 prefix if present
    let base64Data = audio;
    const match = audio.match(/^data:audio\/\w+;base64,(.+)$/);
    if (match) {
      base64Data = match[1];
    }

    // Call Gemini API via fetch with safe timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Transcription request timed out")), 6000)
    );

    const fetchPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a precise, elite speech-to-text transcriber for a citizen grievance system (JanMitra AI) in Uttar Pradesh, India.
Accurately transcribe the provided audio clip into plain text exactly as spoken.
- If spoken in Hindi, transcribe it in Devanagari Hindi script.
- If spoken in English, transcribe it in English.
- If spoken in Hinglish (Hindi written in Latin script or mixed Hindi/English), transcribe it in Hinglish exactly as spoken.
- Preserve names of locations (e.g., Gomti Nagar, Mithai Chauraha, Hazratganj, etc.) and names of complaints exactly as spoken.
- Do NOT translate, rewrite, summarize, or edit the text. Output ONLY the raw spoken words.
- Do NOT add any preamble, greeting, markdown backticks, conversational remarks, or metadata.
- If the audio contains only silence or ambient background noise with no discernable speech, return an empty string.`,
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const response: Response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Transcription API returned an error:", errorText);
      return NextResponse.json({ text: simulatedText, isFallback: true });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const transcript = generatedText ? generatedText.trim() : "";

    return NextResponse.json({ text: transcript, isFallback: false });
  } catch (error: any) {
    console.warn("Transcribe error or timeout, returning fallback text:", error?.message || error);
    return NextResponse.json({
      text: simulatedText,
      isFallback: true,
    });
  }
}
