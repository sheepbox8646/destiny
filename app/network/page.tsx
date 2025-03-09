'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
import NetworkGraph from '@/components/NetworkGraph'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function NetworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [networkData, setNetworkData] = useState<any>(null)
  const [selectedMeetings, setSelectedMeetings] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadNetworkData(user.id)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    }
  }

  async function loadNetworkData(userId: string) {
    try {
      // 获取所有确认的连接
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          *,
          user_a:profiles!connections_user_a_id_fkey (id, username, avatar_url),
          user_b:profiles!connections_user_b_id_fkey (id, username, avatar_url),
          meetings (
            id,
            met_at,
            location
          )
        `)
        .eq('status', 'confirmed')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)

      if (connectionsError) throw connectionsError

      // 转换数据为网络图所需格式
      const nodes = new Set()
      const edges = []
      
      connections?.forEach(connection => {
        const userA = connection.user_a
        const userB = connection.user_b
        
        // 添加节点
        nodes.add(JSON.stringify({
          id: userA.id,
          label: userA.username,
          image: userA.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userA.username}`
        }))
        nodes.add(JSON.stringify({
          id: userB.id,
          label: userB.username,
          image: userB.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userB.username}`
        }))

        // 添加边
        edges.push({
          from: userA.id,
          to: userB.id,
          value: connection.meetings.length, // 边的粗细代表贴贴次数
          title: `贴贴次数: ${connection.meetings.length}`,
          meetings: connection.meetings
        })
      })

      setNetworkData({
        nodes: Array.from(nodes).map(node => JSON.parse(node)),
        edges
      })
    } catch (error) {
      console.error('Error loading network data:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleEdgeClick(meetings: any[]) {
    setSelectedMeetings(meetings.sort((a, b) => 
      new Date(b.met_at).getTime() - new Date(a.met_at).getTime()
    ))
  }

  if (loading) return <Loading />

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">关系网络</h1>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-4" style={{ height: '600px' }}>
                <NetworkGraph 
                  data={networkData} 
                  currentUserId={user?.id}
                  onNodeClick={(nodeId) => router.push(`/user/${nodeId}`)}
                  onEdgeClick={handleEdgeClick}
                />
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedMeetings.length > 0 ? '贴贴记录' : '使用说明'}
                </h2>
                {selectedMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMeetings.map(meeting => (
                      <div key={meeting.id} className="border-b pb-3">
                        <div className="text-sm text-gray-600">
                          {format(new Date(meeting.met_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                        </div>
                        {meeting.location && (
                          <div className="text-sm text-gray-500 mt-1">
                            📍 {meeting.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 space-y-2">
                    <p>• 点击用户头像查看详情</p>
                    <p>• 点击连线查看贴贴记录</p>
                    <p>• 双击节点以聚焦</p>
                    <p>• 滚轮缩放，拖拽移动</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 