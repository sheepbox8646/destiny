interface StatsOverviewProps {
  stats: {
    total_meetings: number
    total_friends: number
    streak_days: number
    last_meeting: string | null
  }
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">统计概览</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_meetings}
          </div>
          <div className="text-sm text-gray-600 mt-1">总贴贴次数</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_friends}
          </div>
          <div className="text-sm text-gray-600 mt-1">贴贴好友数</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-gray-900">
            {stats.streak_days}
          </div>
          <div className="text-sm text-gray-600 mt-1">连续贴贴天数</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900">
            上次贴贴
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.last_meeting ? 
              new Date(stats.last_meeting).toLocaleDateString('zh-CN') :
              '暂无记录'
            }
          </div>
        </div>
      </div>
    </div>
  )
} 