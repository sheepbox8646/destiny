'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface MeetingRequestProps {
  currentUser: any
  targetUser: any
  existingConnection: any
  todayMeeting: any
  onUpdate: () => void
}

export default function MeetingRequest({
  currentUser,
  targetUser,
  existingConnection,
  todayMeeting,
  onUpdate
}: MeetingRequestProps) {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')

  // 处理贴贴请求
  async function handleMeetingRequest() {
    try {
      setLoading(true)
      setMessage('')

      if (!existingConnection) {
        // 创建新连接
        const { data: connection, error: connectionError } = await supabase
          .from('connections')
          .insert({
            user_a_id: currentUser.id,
            user_b_id: targetUser.id,
            status: 'pending'
          })
          .select()
          .single()

        if (connectionError) throw connectionError

        // 创建贴贴记录
        const { error: meetingError } = await supabase
          .from('meetings')
          .insert({
            connection_id: connection.id,
            location: location || null
          })

        if (meetingError) throw meetingError

        // 发送通知
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUser.id,
            type: 'meeting_request',
            content: {
              user_id: currentUser.id,
              username: currentUser.user_metadata?.username || '某人'
            }
          })

        if (notificationError) throw notificationError
        
        setMessage('贴贴请求已发送！等待对方确认~')
      } else if (existingConnection.status === 'pending') {
        if (existingConnection.user_b_id === currentUser.id) {
          // 确认贴贴请求
          const { error: updateError } = await supabase
            .from('connections')
            .update({ status: 'confirmed' })
            .eq('id', existingConnection.id)

          if (updateError) throw updateError

          // 更新贴贴记录
          const { error: meetingError } = await supabase
            .from('meetings')
            .update({ met_at: new Date().toISOString() })
            .eq('connection_id', existingConnection.id)

          if (meetingError) throw meetingError

          // 发送确认通知
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: existingConnection.user_a_id,
              type: 'meeting_confirmed',
              content: {
                user_id: currentUser.id,
                username: currentUser.user_metadata?.username || '某人'
              }
            })

          if (notificationError) throw notificationError
          
          setMessage('贴贴成功！')
        } else {
          setMessage('已发送贴贴请求，等待对方确认~')
        }
      } else if (existingConnection.status === 'confirmed' && !todayMeeting) {
        // 已有连接，创建新的贴贴记录
        const { error: meetingError } = await supabase
          .from('meetings')
          .insert({
            connection_id: existingConnection.id,
            location: location || null
          })

        if (meetingError) throw meetingError
        setMessage('今日贴贴成功！')
      }

      onUpdate()
    } catch (error: any) {
      setMessage('操作失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 如果今天已经贴贴过了
  if (todayMeeting) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">今天已经贴贴过啦！</p>
        <p className="text-sm text-gray-500 mt-2">
          地点：{todayMeeting.location || '未记录'}
        </p>
      </div>
    )
  }

  // 根据连接状态显示不同的按钮文本
  const getButtonText = () => {
    if (loading) return '处理中...'
    if (!existingConnection) return '发起贴贴！'
    if (existingConnection.status === 'pending') {
      return existingConnection.user_b_id === currentUser.id
        ? '确认贴贴！'
        : '等待确认...'
    }
    return '再次贴贴！'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {!existingConnection ? '发起贴贴' : 
         existingConnection.status === 'pending' ? 
           (existingConnection.user_b_id === currentUser.id ? '确认贴贴' : '等待确认') :
           '再次贴贴'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            地点（可选）
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
            placeholder="输入你们相遇的地点"
          />
        </div>

        {message && (
          <p className={`text-sm ${
            message.includes('失败') ? 'text-red-600' : 'text-green-600'
          }`}>
            {message}
          </p>
        )}

        <button
          onClick={handleMeetingRequest}
          disabled={loading || (existingConnection?.status === 'pending' && existingConnection.user_a_id === currentUser.id)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
} 