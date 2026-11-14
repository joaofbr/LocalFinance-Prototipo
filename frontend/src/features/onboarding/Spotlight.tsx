import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { GuideStep } from './guide'

interface SpotlightProps {
  step: GuideStep
  position?: { index: number; total: number }
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
  onTargetClick?: () => void
  onMissing: () => void
}

interface Box {
  top: number
  left: number
  width: number
  height: number
  radius: number
}

const PAD = 8
const GAP = 14
const MARGIN = 16
const MAX_BUBBLE_WIDTH = 340
const SEARCH_TIMEOUT_MS = 3000

function findTarget(id: string): HTMLElement | null {
  for (const node of document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`)) {
    const rect = node.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return node
  }
  return null
}

function sameBox(a: Box | null, b: Box): boolean {
  return (
    a !== null &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

function useTargetBox(id: string, onMissing: () => void) {
  const [box, setBox] = useState<Box | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const missingRef = useRef(onMissing)
  useLayoutEffect(() => {
    missingRef.current = onMissing
  })

  useEffect(() => {
    let frame = 0
    let found: HTMLElement | null = null
    const startedAt = performance.now()
    const tick = () => {
      if (!found || !found.isConnected) {
        found = findTarget(id)
        if (found) {
          const rect = found.getBoundingClientRect()
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            found.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }
          setElement(found)
        } else if (performance.now() - startedAt > SEARCH_TIMEOUT_MS) {
          missingRef.current()
          return
        }
      }
      if (found) {
        const rect = found.getBoundingClientRect()
        const next = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          radius: parseFloat(getComputedStyle(found).borderTopLeftRadius) || 0,
        }
        setBox((current) => (sameBox(current, next) ? current : next))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [id])

  return { box, element }
}

export function Spotlight({
  step,
  position,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onTargetClick,
  onMissing,
}: SpotlightProps) {
  const { box, element } = useTargetBox(step.target, onMissing)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [bubbleHeight, setBubbleHeight] = useState(170)

  useLayoutEffect(() => {
    if (bubbleRef.current) setBubbleHeight(bubbleRef.current.offsetHeight)
  }, [step, box?.width])

  useEffect(() => {
    if (!element || !onTargetClick) return
    element.addEventListener('click', onTargetClick)
    return () => element.removeEventListener('click', onTargetClick)
  }, [element, onTargetClick])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSecondary()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onSecondary])

  if (!box) return null

  const vw = window.innerWidth
  const vh = window.innerHeight
  const round = box.radius >= Math.min(box.width, box.height) / 2 - 1
  const hole = {
    top: box.top - PAD,
    left: box.left - PAD,
    width: box.width + PAD * 2,
    height: box.height + PAD * 2,
    borderRadius: round ? 9999 : Math.max(box.radius + PAD, 14),
  }
  const holeBottom = hole.top + hole.height
  const holeRight = hole.left + hole.width
  const centerX = hole.left + hole.width / 2
  const centerY = hole.top + hole.height / 2
  const bubbleWidth = Math.min(MAX_BUBBLE_WIDTH, vw - MARGIN * 2)
  const clampX = (x: number) => Math.min(Math.max(x, MARGIN), vw - bubbleWidth - MARGIN)
  const clampY = (y: number) => Math.min(Math.max(y, MARGIN), vh - bubbleHeight - MARGIN)

  let bubble: CSSProperties
  let arrow: CSSProperties | null
  if (vh - holeBottom >= bubbleHeight + GAP + MARGIN) {
    const left = clampX(centerX - bubbleWidth / 2)
    bubble = { top: holeBottom + GAP, left }
    arrow = { top: -6, left: Math.min(Math.max(centerX - left - 6, 18), bubbleWidth - 30) }
  } else if (hole.top >= bubbleHeight + GAP + MARGIN) {
    const left = clampX(centerX - bubbleWidth / 2)
    bubble = { top: hole.top - GAP - bubbleHeight, left }
    arrow = { bottom: -6, left: Math.min(Math.max(centerX - left - 6, 18), bubbleWidth - 30) }
  } else if (vw - holeRight >= bubbleWidth + GAP + MARGIN) {
    const top = clampY(centerY - bubbleHeight / 2)
    bubble = { top, left: holeRight + GAP }
    arrow = { left: -6, top: Math.min(Math.max(centerY - top - 6, 18), bubbleHeight - 30) }
  } else {
    bubble = { top: vh - bubbleHeight - MARGIN, left: (vw - bubbleWidth) / 2 }
    arrow = null
  }

  const blockers: CSSProperties[] = [
    { top: 0, left: 0, width: '100%', height: Math.max(hole.top, 0) },
    { top: holeBottom, left: 0, width: '100%', bottom: 0 },
    { top: hole.top, left: 0, width: Math.max(hole.left, 0), height: hole.height },
    { top: hole.top, left: holeRight, right: 0, height: hole.height },
  ]

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="spotlight-title">
      {blockers.map((style, index) => (
        <div key={index} className="fixed z-[70]" style={style} />
      ))}
      {!onTargetClick && <div className="fixed z-[70]" style={hole} />}
      <div
        className="pointer-events-none fixed z-[70] ring-2 ring-primary transition-[top,left,width,height] duration-300"
        style={{ ...hole, boxShadow: '0 0 0 9999px rgba(4, 14, 11, 0.62)' }}
      />
      <div
        className="pointer-events-none fixed z-[70] animate-pulse ring-4 ring-primary/40"
        style={hole}
      />
      <div
        ref={bubbleRef}
        className="fixed z-[71] rounded-2xl bg-surface p-4 text-text shadow-card-lg ring-1 ring-primary/35 transition-[top,left] duration-300"
        style={{ ...bubble, width: bubbleWidth }}
      >
        {arrow && (
          <span
            aria-hidden="true"
            className="absolute h-3 w-3 rotate-45 bg-surface"
            style={arrow}
          />
        )}
        {position && (
          <div className="text-[12px] font-semibold text-text-3">
            {position.index + 1} de {position.total}
          </div>
        )}
        <h3 id="spotlight-title" className="text-[16px] font-extrabold tracking-tight">
          {step.title}
        </h3>
        <p className="mt-1 text-[13.5px] leading-relaxed text-text-2">{step.text}</p>
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSecondary}
            className="rounded-lg px-2 py-2 text-[13px] font-semibold text-text-3 hover:bg-surface-2"
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            className="rounded-xl bg-primary px-4 py-2.5 text-[14px] font-bold text-primary-fg"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
