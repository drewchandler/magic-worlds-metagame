import CardDetailComponent from '@organisms/CardDetail'
import { useData } from '@/App'

export function CardDetailPage() {
  const data = useData()
  return <CardDetailComponent data={data} />
}
