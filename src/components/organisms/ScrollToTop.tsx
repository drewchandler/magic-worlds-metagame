import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Scroll restoration component that:
 * - Scrolls to top on new navigation (PUSH/REPLACE)
 * - Restores scroll position on back/forward navigation (POP)
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const scrollPositions = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    // On back/forward navigation, restore scroll position
    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current.get(pathname)
      if (savedPosition !== undefined) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, savedPosition)
        }, 0)
        return
      }
    }

    // On new navigation, scroll to top
    if (navigationType === 'PUSH' || navigationType === 'REPLACE') {
      window.scrollTo(0, 0)
    }
  }, [pathname, navigationType])

  useEffect(() => {
    // Save scroll position before navigation
    const saveScrollPosition = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }

    // Save on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        scrollPositions.current.set(pathname, window.scrollY)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
      // Save final position before unmount
      saveScrollPosition()
    }
  }, [pathname])

  return null
}

