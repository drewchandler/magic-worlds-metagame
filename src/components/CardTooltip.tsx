import { useState, useEffect, useRef } from 'react'
import { useFloating, autoUpdate, offset, flip, shift, arrow, useHover, useFocus, useDismiss, useRole, useInteractions, Placement } from '@floating-ui/react'

interface CardTooltipProps {
  cardName: string
  children: React.ReactNode
}

function CardTooltip({ cardName, children }: CardTooltipProps) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const arrowRef = useRef<HTMLDivElement | null>(null)

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'right' as Placement,
    middleware: [offset(10), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, { delay: { open: 300 } })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  useEffect(() => {
    if (open && !imageUrl && !loading) {
      setLoading(true)
      const searchName = cardName.replace(/\/\/.*$/, '').trim()
      fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(searchName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.image_uris && data.image_uris.normal) {
            setImageUrl(data.image_uris.normal)
          } else if (data.card_faces && data.card_faces[0]?.image_uris?.normal) {
            setImageUrl(data.card_faces[0].image_uris.normal)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [open, cardName, imageUrl, loading])

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline"
      >
        {children}
      </span>
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-[1000] pointer-events-none"
        >
          {loading ? (
            <div className="px-5 py-4 bg-black bg-opacity-90 text-white rounded-lg whitespace-nowrap">
              Loading...
            </div>
          ) : imageUrl ? (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt={cardName} 
                className="w-[223px] rounded-lg shadow-xl bg-white"
                style={{ aspectRatio: '223/311' }}
              />
              <div
                ref={arrowRef}
                className="absolute w-3 h-3 bg-black"
                style={{
                  left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
                  top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                }}
              />
            </div>
          ) : (
            <div className="px-5 py-4 bg-black bg-opacity-90 text-white rounded-lg whitespace-nowrap">
              Image not found
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default CardTooltip
