import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

interface MeetingHistoryProps {
  meetings: any[]
  currentUser: any
}

export default function MeetingHistory({ meetings, currentUser }: MeetingHistoryProps) {
  if (!meetings.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
        还没有贴贴记录哦~
      </div>
    )
  }

  // 按日期分组
  const groupedMeetings = meetings.reduce((groups: any, meeting: any) => {
    const date = format(new Date(meeting.met_at), 'yyyy年MM月dd日', { locale: zhCN })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(meeting)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groupedMeetings).map(([date, dayMeetings]: [string, any]) => (
        <div key={date} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-medium text-gray-900">{date}</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dayMeetings.map((meeting: any) => {
              const otherUser = meeting.connection.user_a_id === currentUser.id
                ? meeting.connection.user_b
                : meeting.connection.user_a

              return (
                <div key={meeting.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={otherUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.username}`}
                        alt={otherUser.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <Link
                          href={`/user/${otherUser.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-gray-700"
                        >
                          {otherUser.username}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {format(new Date(meeting.met_at), 'HH:mm', { locale: zhCN })}
                        </p>
                      </div>
                    </div>
                    {meeting.location && (
                      <div className="text-sm text-gray-500">
                        📍 {meeting.location}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
} 