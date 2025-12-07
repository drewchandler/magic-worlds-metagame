import { Box } from '@atoms/Box'
import { Link } from '@atoms/Link'
import { Text } from '@atoms/Text'
import { VStack } from '@atoms/VStack'
import { HStack } from '@atoms/HStack'

interface PageHeaderProps {
  title: string
  backLink?: string
  subtitle?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  backLink = '/',
  subtitle,
  className = '',
}: PageHeaderProps) {
  return (
    <Box
      padding="lg"
      background="gradient-slate-blue"
      roundedTop="3xl"
      className={`-mx-4 -mt-4 -mb-0 ${className}`}
    >
      <VStack spacing="sm" align="start">
        <Link to={backLink} variant="nav">
          ← Back to Dashboard
        </Link>
        {subtitle ? (
          <HStack spacing="md" align="center">
            <Text variant="h1" color="inverse">{title}</Text>
            {subtitle}
          </HStack>
        ) : (
          <Text variant="h1" color="inverse">{title}</Text>
        )}
      </VStack>
    </Box>
  )
}

