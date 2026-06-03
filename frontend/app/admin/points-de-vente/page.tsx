'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PointsDeVentePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/points-de-vente')
  }, [router])

  return null
}
