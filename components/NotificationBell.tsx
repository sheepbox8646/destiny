'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiBell } from 'react-icons/fi'
import Link from 'next/link'

export default function NotificationBell({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
      // 订阅实时通知
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  async function loadNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.read).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  async function markAsRead(notificationId?: string) {
    try {
      const query = supabase
        .from('notifications')
        .update({ read: true })
        
      if (notificationId) {
        await query.eq('id', notificationId)
      } else {
        await query.eq('user_id', user.id)
      }
      
      await loadNotifications()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  function formatNotification(notification: any) {
    const content = notification.content
    switch (notification.type) {
      case 'meeting_request':
        return {
          message: `${content.username} 向你发起了贴贴请求`,
          link: `/user/${content.user_id}`
        }
      case 'meeting_confirmed':
        return {
          message: `${content.username} 确认了你的贴贴请求`,
          link: `/user/${content.user_id}`
        }
      default:
        return {
          message: '新通知',
          link: '#'
        }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                全部标为已读
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                暂无通知
              </div>
            ) : (
              notifications.map(notification => {
                const { message, link } = formatNotification(notification)
                return (
                  <Link
                    key={notification.id}
                    href={link}
                    onClick={() => {
                      markAsRead(notification.id)
                      setShowDropdown(false)
                    }}
                    className={`block px-4 py-3 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-900">{message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString('zh-CN')}
                    </p>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
} 