interface MeetingStatsProps {
  locations: Array<{
    location: string
    count: number
  }>
  timeDistribution: Array<{
    hour: number
    count: number
  }>
}

export default function MeetingStats({ locations = [], timeDistribution = [] }: MeetingStatsProps) {
  const topLocations = locations.slice(0, 5)
  const maxCount = Math.max(...timeDistribution.map(t => t.count || 0), 1)

  if (!locations.length && !timeDistribution.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
        暂无统计数据
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">常去地点</h2>
        <div className="space-y-3">
          {topLocations.map(({ location, count }) => (
            <div key={location} className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {location || '未记录地点'}
                </div>
                <div className="mt-1 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${(count / topLocations[0].count) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"
                    />
                  </div>
                </div>
              </div>
              <div className="ml-4 text-sm text-gray-600">{count}次</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">时间分布</h2>
        <div className="h-40 flex items-end justify-between">
          {timeDistribution.map(({ hour, count }) => (
            <div
              key={hour}
              className="w-6 bg-gray-500 rounded-t"
              style={{
                height: `${(count / maxCount) * 100}%`,
                minHeight: count > 0 ? '4px' : '0'
              }}
              title={`${hour}时: ${count}次`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0时</span>
          <span>6时</span>
          <span>12时</span>
          <span>18时</span>
          <span>24时</span>
        </div>
      </div>
    </div>
  )
} 