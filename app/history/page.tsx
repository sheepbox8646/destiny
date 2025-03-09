'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
import MeetingHistory from '@/components/MeetingHistory'

export default function HistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [meetings, setMeetings] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadMeetings(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    }
  }

  async function loadMeetings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          connection:connections (
            *,
            user_a:profiles!connections_user_a_id_fkey (*),
            user_b:profiles!connections_user_b_id_fkey (*)
          )
        `)
        .or(`connection.user_a_id.eq.${userId},connection.user_b_id.eq.${userId}`)
        .order('met_at', { ascending: false })
      setMeetings(data || [])
    } catch (error) {
      console.error('Error loading meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">贴贴历史</h1>
          <MeetingHistory meetings={meetings} currentUser={user} />
        </div>
      </div>
    </main>
  )
} 