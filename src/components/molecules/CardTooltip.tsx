import { useState, useCallback } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

import { Box } from '@atoms/Box'
import { Image } from '@atoms/Image'
import { Text } from '@atoms/Text'

interface CardTooltipProps {
  cardName: string
  children: React.ReactNode
}

function CardTooltip({ cardName, children }: CardTooltipProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)
      if (newOpen && !imageUrl && !loading) {
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
    },
    [cardName, imageUrl, loading]
  )

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root open={open} onOpenChange={handleOpenChange}>
        <Tooltip.Trigger asChild>
          <Box className="inline cursor-pointer">{children}</Box>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="right" sideOffset={10} className="z-[1000] pointer-events-none">
            {loading ? (
              <Box
                padding="md"
                background="default"
                rounded="lg"
                whitespace="nowrap"
                className="bg-black bg-opacity-90"
              >
                <Text color="inverse">Loading...</Text>
              </Box>
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt={cardName}
                width="223px"
                aspectRatio="223/311"
                rounded="lg"
                shadow="xl"
                background="white"
              />
            ) : (
              <Box
                padding="md"
                background="default"
                rounded="lg"
                whitespace="nowrap"
                className="bg-black bg-opacity-90"
              >
                <Text color="inverse">Image not found</Text>
              </Box>
            )}
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default CardTooltip
