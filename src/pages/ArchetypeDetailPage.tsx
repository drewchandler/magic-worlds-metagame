import ArchetypeDetailComponent from '@organisms/ArchetypeDetail'
import { useData } from '@/App'

export function ArchetypeDetailPage() {
  const data = useData()
  return <ArchetypeDetailComponent data={data} />
}
