import PlayerDetailComponent from '@organisms/PlayerDetail'
import { useData } from '@/App'

export function PlayerDetailPage() {
  const data = useData()
  return <PlayerDetailComponent data={data} />
}
