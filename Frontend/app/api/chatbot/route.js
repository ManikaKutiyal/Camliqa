import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin"
import { upsertChatSession, getChatSession } from "@/services/supabase/chatSessions"
import { getStorefrontProducts } from "@/services/supabase/products"
import { getGeminiEnv, hasGeminiEnv } from "@/lib/server/env"
import { cookies } from "next/headers"

const SYSTEM_PROMPT = `You are a helpful, expert skincare consultant for Camliqa Luxury Skincare.
Your goal is to provide personalized skincare advice and recommend Camliqa products based on the user's specific skin type, concerns, and goals.
Tone: Professional, empathetic, luxurious, and knowledgeable.
Do not recommend products from other brands. If a product recommendation is appropriate, format it clearly and mention why it helps their specific concern based on key benefits and ingredients.`

export async function POST(request) {
  try {
    const body = await request.json()
    const { message, sessionId: clientSessionId } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!hasGeminiEnv()) {
      return NextResponse.json(
        { error: "Chatbot is temporarily unavailable (missing API keys)" },
        { status: 503 }
      )
    }

    const { apiKey } = getGeminiEnv()
    const supabase = getSupabaseAdminClient()
    
    // Get user session if logged in
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("sb-access-token")?.value
    let userId = null
    
    if (sessionToken) {
      const { data: { user } } = await supabase.auth.getUser(sessionToken)
      userId = user?.id || null
    }

    // Generate or use existing sessionId
    const sessionId = clientSessionId || crypto.randomUUID()

    // Fetch existing chat history
    let messages = []
    const { data: session } = await getChatSession(supabase, sessionId)
    if (session && session.messages) {
      messages = session.messages
    }

    // Add new user message
    messages.push({ role: "user", content: message, timestamp: new Date().toISOString() })

    // Build context for Gemini
    // 1. Fetch active products to use as context
    const { data: products } = await getStorefrontProducts(supabase)
    let productContext = ""
    if (products && products.length > 0) {
      productContext = "\n\nAvailable Camliqa Products:\n" + products.map(p => 
        `- ${p.title}: ${p.short_description || p.description}. Good for: ${p.skin_type?.join(", ")}. Concerns: ${p.concern?.join(", ")}.`
      ).join("\n")
    }

    // 2. Format history for Gemini API
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + productContext }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to help." }]
      }
    ]

    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      })
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    })

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text()
      console.error("Gemini API error:", err)
      throw new Error("Failed to generate response from AI")
    }

    const geminiData = await geminiResponse.json()
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request right now."

    // Add AI response to history
    messages.push({ role: "assistant", content: aiResponseText, timestamp: new Date().toISOString() })

    // Save updated session to Supabase
    await upsertChatSession(supabase, { sessionId, userId, messages })

    return NextResponse.json({
      sessionId,
      message: aiResponseText
    })

  } catch (error) {
    console.error("Chatbot API error:", error)
    return NextResponse.json(
      { error: "Internal server error processing chat" },
      { status: 500 }
    )
  }
}
