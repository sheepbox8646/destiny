'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
import StatsOverview from '@/components/StatsOverview'
import MeetingStats from '@/components/MeetingStats'

export default function StatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadStats(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    }
  }

  async function loadStats(userId: string) {
    try {
      console.log('Loading stats for user:', userId);
      
      // 获取总贴贴次数和好友数
      const overviewResult = await supabase
        .rpc('get_user_stats', { user_id: userId })
      
      console.log('Overview result:', overviewResult);
      
      if (overviewResult.error) {
        console.error('Overview error:', overviewResult.error);
        throw overviewResult.error;
      }

      // 获取贴贴地点统计
      const locationResult = await supabase
        .rpc('get_location_stats', { user_id: userId })
      
      console.log('Location result:', locationResult);
      
      if (locationResult.error) {
        console.error('Location error:', locationResult.error);
        throw locationResult.error;
      }

      // 获取贴贴时间分布
      const timeResult = await supabase
        .rpc('get_time_stats', { user_id: userId })
      
      console.log('Time result:', timeResult);
      
      if (timeResult.error) {
        console.error('Time error:', timeResult.error);
        throw timeResult.error;
      }

      setStats({
        overview: overviewResult.data?.[0] || {
          total_meetings: 0,
          total_friends: 0,
          streak_days: 0,
          last_meeting: null
        },
        locations: locationResult.data || [],
        timeDistribution: timeResult.data || Array(24).fill(0).map((_, hour) => ({ hour, count: 0 }))
      })
    } catch (error) {
      console.error('Error details:', error);
      // 设置默认空状态
      setStats({
        overview: {
          total_meetings: 0,
          total_friends: 0,
          streak_days: 0,
          last_meeting: null
        },
        locations: [],
        timeDistribution: Array(24).fill(0).map((_, hour) => ({ hour, count: 0 }))
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">贴贴统计</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <StatsOverview stats={stats?.overview} />
            <MeetingStats 
              locations={stats?.locations} 
              timeDistribution={stats?.timeDistribution}
            />
          </div>
        </div>
      </div>
    </main>
  )
} 