'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
import UserProfile from '@/components/UserProfile'
import MeetingRequest from '@/components/MeetingRequest'

export default function UserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [connection, setConnection] = useState<any>(null)
  const [todayMeeting, setTodayMeeting] = useState<any>(null)

  useEffect(() => {
    checkUser()
    loadProfile()
    loadConnection()
  }, [params.id])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    }
  }

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadConnection() {
    if (!currentUser) return

    try {
      // 检查是否已经存在连接
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          meetings (
            *
          )
        `)
        .or(`user_a_id.eq.${currentUser.id},user_b_id.eq.${currentUser.id}`)
        .or(`user_a_id.eq.${params.id},user_b_id.eq.${params.id}`)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setConnection(data)
        // 检查今天是否已经有贴贴记录
        const today = new Date()
        const todayMeeting = data.meetings?.find((meeting: any) => {
          const meetingDate = new Date(meeting.met_at)
          return meetingDate.toDateString() === today.toDateString()
        })
        setTodayMeeting(todayMeeting)
      }
    } catch (error) {
      console.error('Error loading connection:', error)
    }
  }

  if (loading) return <Loading />

  if (!profile) return <div>用户不存在</div>

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <UserProfile profile={profile} />
          {currentUser && currentUser.id !== params.id && (
            <MeetingRequest
              currentUser={currentUser}
              targetUser={profile}
              existingConnection={connection}
              todayMeeting={todayMeeting}
              onUpdate={loadConnection}
            />
          )}
        </div>
      </div>
    </main>
  )
} 