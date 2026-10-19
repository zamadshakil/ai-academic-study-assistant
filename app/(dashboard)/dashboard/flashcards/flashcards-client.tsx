"use client"

import { useState } from "react"
import {
  Layers,
  Sparkles,
  RotateCw,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
} from "lucide-react"
import type {
  FlashcardDeck,
  Flashcard,
  AcademicCourse,
  AcademicMaterial,
} from "@/lib/academic/types"
import type { Profile, UserRole } from "@/lib/types"

interface FlashcardsClientProps {
  initialDecks: FlashcardDeck[]
  courses: AcademicCourse[]
  materials: AcademicMaterial[]
  userRole: UserRole
  studentProfile: Profile
}

export function FlashcardsClientView({
  initialDecks,
  courses,
  materials,
  userRole,
}: FlashcardsClientProps) {
  const [decks, setDecks] = useState<FlashcardDeck[]>(initialDecks)
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredIds, setMasteredIds] = useState<string[]>([])
  const [reviewingIds, setReviewingIds] = useState<string[]>([])
  const [isDeckCompleted, setIsDeckCompleted] = useState(false)
  const [isGenModalOpen, setIsGenModalOpen] = useState(false)
  const [genMaterialId, setGenMaterialId] = useState(materials[0]?.id || "")
  const [generating, setGenerating] = useState(false)

  const canGenerate = userRole === "main_admin" || userRole === "manager" || userRole === "member"

  function startDeck(deck: FlashcardDeck) {
    setActiveDeck(deck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setMasteredIds([])
    setReviewingIds([])
    setIsDeckCompleted(false)
  }

  async function persistProgress(mIds: string[], rIds: string[]) {
    if (!activeDeck) return
    try {
      await fetch("/api/academic/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_progress",
          deck_id: activeDeck.id,
          mastered_card_ids: mIds,
          reviewing_card_ids: rIds,
        }),
      })
    } catch (err) {
      console.error("Failed to persist flashcard progress", err)
    }
  }

  function handleNextCard() {
    if (!activeDeck) return
    if (currentCardIndex < activeDeck.cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setIsFlipped(false)
    } else {
      setIsDeckCompleted(true)
    }
  }

  function handlePrevCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
      setIsFlipped(false)
    }
  }

  function markMastered(cardId: string) {
    const nextMastered = masteredIds.includes(cardId) ? masteredIds : [...masteredIds, cardId]
    const nextReviewing = reviewingIds.filter((id) => id !== cardId)
    setMasteredIds(nextMastered)
    setReviewingIds(nextReviewing)
    persistProgress(nextMastered, nextReviewing)

    if (activeDeck && currentCardIndex >= activeDeck.cards.length - 1) {
      setIsDeckCompleted(true)
    } else {
      handleNextCard()
    }
  }

  function markReviewing(cardId: string) {
    const nextReviewing = reviewingIds.includes(cardId) ? reviewingIds : [...reviewingIds, cardId]
    const nextMastered = masteredIds.filter((id) => id !== cardId)
    setReviewingIds(nextReviewing)
    setMasteredIds(nextMastered)
    persistProgress(nextMastered, nextReviewing)

    if (activeDeck && currentCardIndex >= activeDeck.cards.length - 1) {
      setIsDeckCompleted(true)
    } else {
      handleNextCard()
    }
  }

  async function handleGenerateDeck(e: React.FormEvent) {
    e.preventDefault()
    if (!genMaterialId) return
    setGenerating(true)
    try {
      const res = await fetch("/api/academic/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          material_id: genMaterialId,
          count: 5,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.deck) {
          setDecks((prev) => [data.deck, ...prev])
          setIsGenModalOpen(false)
          startDeck(data.deck)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const currentCard = activeDeck?.cards[currentCardIndex]
  const masteryPercentage = activeDeck
    ? Math.round((masteredIds.length / activeDeck.cards.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Active Deck Study Player */}
      {activeDeck && isDeckCompleted ? (
        <div className="rounded-xl border border-border bg-card p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-primary px-2.5 py-1 rounded bg-primary/10">
              {activeDeck.course_code || "CS302"} Deck Complete
            </span>
            <h2 className="text-2xl font-bold">{activeDeck.title}</h2>
            <p className="text-xs text-muted-foreground">
              Revision session recorded. Your spaced repetition retention metrics have been saved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
              <p className="text-2xl font-extrabold text-emerald-600">{masteredIds.length}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">Mastered</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
              <p className="text-2xl font-extrabold text-amber-600">{reviewingIds.length}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">Need Review</p>
            </div>
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Retention Score</span>
              <span className="font-bold text-emerald-600">{masteryPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setCurrentCardIndex(0)
                setIsFlipped(false)
                setIsDeckCompleted(false)
              }}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Study Deck Again
            </button>
            <button
              onClick={() => setActiveDeck(null)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-sm"
            >
              Back to Course Decks
            </button>
          </div>
        </div>
      ) : activeDeck && currentCard ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-md space-y-6 animate-in fade-in duration-150 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {activeDeck.course_code || "CS302"}
              </span>
              <h2 className="text-lg font-bold mt-1">{activeDeck.title}</h2>
            </div>
            <button
              onClick={() => setActiveDeck(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
            >
              Exit Deck
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Card {currentCardIndex + 1} of {activeDeck.cards.length}
              </span>
              <span className="font-semibold text-emerald-600">
                {masteryPercentage}% Mastered ({masteredIds.length}/{activeDeck.cards.length})
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[260px] rounded-2xl border-2 border-border/80 bg-gradient-to-b from-background to-muted/20 p-8 shadow-md flex flex-col justify-between items-center text-center transition-all duration-200 hover:border-primary/50 relative select-none"
          >
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-bold px-2 py-0.5 rounded bg-muted">
                {currentCard.clo_code}
              </span>
              <span className="text-[11px] flex items-center gap-1 text-primary">
                <RotateCw className="h-3 w-3" /> Click card to flip
              </span>
            </div>

            <div className="my-auto space-y-3 px-4">
              {!isFlipped ? (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Question / Prompt
                  </span>
                  <h3 className="text-xl font-bold leading-snug">{currentCard.front}</h3>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                    {currentCard.key_term ? `Key Term: ${currentCard.key_term}` : "Answer & Explanation"}
                  </span>
                  <p className="text-base font-medium leading-relaxed text-foreground">
                    {currentCard.back}
                  </p>
                </>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground/60">
              {!isFlipped ? "Tap to reveal answer" : "Tap to see question"}
            </span>
          </div>

          {/* Action buttons (Mastered / Review Again & Navigation) */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => markReviewing(currentCard.id)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  reviewingIds.includes(currentCard.id)
                    ? "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                <span>Review Again</span>
              </button>

              <button
                onClick={() => markMastered(currentCard.id)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  masteredIds.includes(currentCard.id)
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Mastered</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-30 flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>

              <span className="text-xs text-muted-foreground">
                Card {currentCardIndex + 1} of {activeDeck.cards.length}
              </span>

              <button
                onClick={handleNextCard}
                disabled={currentCardIndex === activeDeck.cards.length - 1}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-30 flex items-center gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Decks directory list
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Course Revision Decks</h2>
              <p className="text-xs text-muted-foreground">
                Flashcards auto-generated directly from instructor slides, mapped to Course Learning Outcomes.
              </p>
            </div>

            {canGenerate && (
              <button
                onClick={() => setIsGenModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Auto-Generate Cards from Slides</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {deck.course_code || "CS302"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {deck.cards.length} Flashcards
                    </span>
                  </div>

                  <h3 className="text-base font-bold">{deck.title}</h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.from(new Set(deck.cards.map((c) => c.clo_code))).map((clo) => (
                      <span
                        key={clo}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      >
                        Mapped: {clo}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Interactive 3D Flip Card Deck
                  </span>

                  <button
                    onClick={() => startDeck(deck)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Study Deck</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Generate Flashcard Deck Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Auto-Generate Revision Deck</span>
              </h3>
              <button
                onClick={() => setIsGenModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateDeck} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Select Lecture Slides
                </label>
                <select
                  value={genMaterialId}
                  onChange={(e) => setGenMaterialId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.slide_or_page_count} Slides)
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                The generator extracts key algorithms, definitions, admissibility/consistency
                proofs, and Bloom's Level C1-C4 conceptual prompts from the lecture slides.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsGenModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {generating ? "Generating Cards..." : "Generate Deck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
