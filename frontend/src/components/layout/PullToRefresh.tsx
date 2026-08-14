import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const THRESHOLD = 70
const MAX_PULL = 110
const RESISTANCE = 0.5

function usePullGesture(onRefresh: () => Promise<unknown>) {
  const [distance, setDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const startY = useRef<number | null>(null)
  const distanceRef = useRef(0)
  const busyRef = useRef(false)
  const refreshRef = useRef(onRefresh)

  useEffect(() => {
    refreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    const previous = document.body.style.overscrollBehaviorY
    document.body.style.overscrollBehaviorY = 'contain'
    return () => {
      document.body.style.overscrollBehaviorY = previous
    }
  }, [])

  const update = useCallback((value: number) => {
    distanceRef.current = value
    setDistance(value)
  }, [])

  useEffect(() => {
    const handleStart = (event: TouchEvent) => {
      if (busyRef.current || window.scrollY > 0 || event.touches.length !== 1) {
        return
      }
      const target = event.target as HTMLElement | null
      if (target?.closest('.fixed')) return
      startY.current = event.touches[0].clientY
    }

    const handleMove = (event: TouchEvent) => {
      if (startY.current === null) return

      if (window.scrollY > 0) {
        startY.current = null
        update(0)
        return
      }

      const delta = event.touches[0].clientY - startY.current
      if (delta <= 0) {
        update(0)
        return
      }

      event.preventDefault()
      update(Math.min(delta * RESISTANCE, MAX_PULL))
    }

    const handleEnd = () => {
      if (startY.current === null) return
      startY.current = null

      if (distanceRef.current < THRESHOLD) {
        update(0)
        return
      }

      busyRef.current = true
      setRefreshing(true)
      update(THRESHOLD)

      void Promise.resolve(refreshRef.current()).finally(() => {
        busyRef.current = false
        setRefreshing(false)
        update(0)
      })
    }

    window.addEventListener('touchstart', handleStart, { passive: true })
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)
    window.addEventListener('touchcancel', handleEnd)

    return () => {
      window.removeEventListener('touchstart', handleStart)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
      window.removeEventListener('touchcancel', handleEnd)
    }
  }, [update])

  return { distance, refreshing }
}

export function PullToRefresh() {
  const queryClient = useQueryClient()

  const refresh = useCallback(
    () => queryClient.refetchQueries({ type: 'active' }),
    [queryClient],
  )

  const { distance, refreshing } = usePullGesture(refresh)
  const active = refreshing || distance > 0

  if (!active) return null

  const ready = refreshing || distance >= THRESHOLD

  return (
    <div
      aria-hidden={!refreshing}
      role={refreshing ? 'status' : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center lg:hidden"
      style={{ transform: `translateY(${distance}px)` }}
    >
      <span
        className="mt-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface shadow-card-md"
        style={{ opacity: Math.min(distance / THRESHOLD, 1) }}
      >
        <span
          className={`inline-block h-[17px] w-[17px] rounded-full border-[2.5px] border-border-strong border-t-primary ${
            refreshing ? 'animate-spin' : ''
          }`}
          style={
            refreshing
              ? undefined
              : { transform: `rotate(${(distance / THRESHOLD) * 270}deg)` }
          }
        />
      </span>
      <span className="sr-only">{ready ? 'Solte para atualizar' : 'Puxe para atualizar'}</span>
    </div>
  )
}
