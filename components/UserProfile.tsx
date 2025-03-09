export default function UserProfile({ profile }: { profile: any }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-4">
        <img
          className="h-20 w-20 rounded-full object-cover"
          src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username || 'Guest'}`}
          alt={profile.username}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
          {profile.location && (
            <p className="text-gray-600">{profile.location}</p>
          )}
        </div>
      </div>
      {profile.bio && (
        <p className="mt-4 text-gray-600">{profile.bio}</p>
      )}
      {profile.social_links && Object.keys(profile.social_links).length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">社交账号</h2>
          <div className="space-y-2">
            {Object.entries(profile.social_links).map(([platform, link]: [string, any]) => (
              <a
                key={platform}
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800"
              >
                {platform}: {link}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 