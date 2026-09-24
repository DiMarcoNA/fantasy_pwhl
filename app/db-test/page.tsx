'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseTest() {
  const [teams, setTeams] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeams() {
      const { data, error } = await supabase
        .from('pwhl_team')
        .select('*')
        .order('id')

      if (error) {
        console.error(error)
        setError(error.message)
      } else {
        console.log(data)
        setTeams(data)
      }

      setLoading(false)
    }

    loadTeams()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return (
      <div>
        <h1>Database Error</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Database Test</h1>

      <h2>PWHL Teams</h2>

      {teams.map((team) => (
        <div key={team.id}>
          <p>
            <strong>{team.city}</strong> ({team.abbreviation})
          </p>
        </div>
      ))}
    </div>
  )
}