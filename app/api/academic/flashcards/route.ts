import { NextResponse } from "next/server"
import { requireProfile } from "@/lib/auth"
import {
  listFlashcardDecks,
  getFlashcardDeckById,
  generateFlashcardsFromMaterial,
  getFlashcardProgress,
  updateFlashcardProgress,
} from "@/lib/academic/service"

export async function GET(request: Request) {
  try {
    const profile = await requireProfile()
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get("id")
    const courseId = searchParams.get("course_id") || undefined

    if (deckId) {
      const deck = await getFlashcardDeckById(deckId)
      if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 })
      const progress = await getFlashcardProgress(deckId, profile.id)
      return NextResponse.json({ deck, progress })
    }

    const decks = await listFlashcardDecks(courseId)
    return NextResponse.json({ decks })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load flashcard decks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireProfile()
    const body = await request.json()

    // Action 1: Auto-generate flashcards from slides/material
    if (body.action === "generate") {
      if (!body.material_id) {
        return NextResponse.json({ error: "material_id is required" }, { status: 400 })
      }
      const deck = await generateFlashcardsFromMaterial(body.material_id, body.count || 5)
      return NextResponse.json({ deck }, { status: 201 })
    }

    // Action 2: Update student revision progress
    if (body.action === "update_progress") {
      if (!body.deck_id) {
        return NextResponse.json({ error: "deck_id is required" }, { status: 400 })
      }
      const progress = await updateFlashcardProgress(
        body.deck_id,
        profile.id,
        body.mastered_card_ids || [],
        body.reviewing_card_ids || [],
      )
      return NextResponse.json({ progress })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Flashcard operation failed" }, { status: 500 })
  }
}
