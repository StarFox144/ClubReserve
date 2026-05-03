import { useEffect } from 'react'

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} — ClubReserve` : 'ClubReserve'
    return () => { document.title = 'ClubReserve' }
  }, [title])
}
