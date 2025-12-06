import { Box } from '@atoms/Box'
import { Input } from '@atoms/Input'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <Box padding="none" margin="md">
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        fullWidth
      />
    </Box>
  )
}
