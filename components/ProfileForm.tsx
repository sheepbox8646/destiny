'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLink } from 'react-icons/fi'
import { 
  FaWeixin, 
  FaWeibo, 
  FaGithub, 
  FaTwitter, 
  FaInstagram,
  FaLinkedin,
  FaPlus,
  FaTrash,
  FaTelegram,
  FaQq
} from 'react-icons/fa'
import { 
  SiBilibili,
  SiXiaohongshu
} from 'react-icons/si'

interface ProfileFormProps {
  user: any
}

interface Profile {
  username: string
  avatar_url: string | null
  bio: string
  location: string
  social_links: {
    [key: string]: string
  }
}

type SocialPlatform = 'telegram' | 'qq' | 'bilibili' | 'xiaohongshu' | 'github' | 'custom'

interface SocialPlatformConfig {
  label: string
  icon: React.ComponentType
  placeholder: string
  urlPrefix?: string
}

const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformConfig> = {
  wechat: {
    label: '微信',
    icon: FaWeixin,
    placeholder: '微信号'
  },
  weibo: {
    label: '微博',
    icon: FaWeibo,
    placeholder: '微博用户名或链接'
  },
  github: {
    label: 'GitHub',
    icon: FaGithub,
    placeholder: 'GitHub 用户名',
    urlPrefix: 'https://github.com/'
  },
  twitter: {
    label: 'Twitter',
    icon: FaTwitter,
    placeholder: 'Twitter 用户名'
  },
  instagram: {
    label: 'Instagram',
    icon: FaInstagram,
    placeholder: 'Instagram 用户名'
  },
  linkedin: {
    label: 'LinkedIn',
    icon: FaLinkedin,
    placeholder: 'LinkedIn 链接'
  },
  telegram: {
    label: 'Telegram',
    icon: FaTelegram,
    placeholder: 'Telegram 用户名',
    urlPrefix: 'https://t.me/'
  },
  qq: {
    label: 'QQ',
    icon: FaQq,
    placeholder: 'QQ 号码'
  },
  bilibili: {
    label: 'B站',
    icon: SiBilibili,
    placeholder: 'B站 UID 或空间链接',
    urlPrefix: 'https://space.bilibili.com/'
  },
  xiaohongshu: {
    label: '小红书',
    icon: SiXiaohongshu,
    placeholder: '小红书主页链接'
  },
  custom: {
    label: '自定义',
    icon: FiLink,
    placeholder: '请输入链接'
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<Profile>({
    username: '',
    avatar_url: null,
    bio: '',
    location: '',
    social_links: {}
  })

  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('custom')
  const [newLink, setNewLink] = useState('')
  const [showAddSocial, setShowAddSocial] = useState(false)

  useEffect(() => {
    getProfile()
  }, [user])

  async function getProfile() {
    try {
      setLoading(true)
      
      // 先尝试获取现有资料
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // 如果没有找到记录，创建一个新的
      if (error || !data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: user.user_metadata?.username || '',
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) throw insertError
        data = newProfile
      }

      // 更新状态
      if (data) {
        setProfile({
          username: data.username || '',
          avatar_url: data.avatar_url,
          bio: data.bio || '',
          location: data.location || '',
          social_links: data.social_links || {}
        })
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage('')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          social_links: profile.social_links,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      setMessage('个人资料已更新')
    } catch (error: any) {
      setMessage('更新失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setLoading(true)
      setMessage('')

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('请选择要上传的图片')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile(prev => ({
        ...prev,
        avatar_url: publicUrl
      }))

    } catch (error: any) {
      setMessage('上传失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSocial = () => {
    if (!newLink) return

    let finalLink = newLink.trim()
    const platform = SOCIAL_PLATFORMS[newPlatform]

    if (platform.urlPrefix && !finalLink.startsWith('http')) {
      finalLink = finalLink.replace(/^@/, '')
      finalLink = platform.urlPrefix + finalLink
    }

    setProfile(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [newPlatform]: finalLink
      }
    }))

    setNewLink('')
    setShowAddSocial(false)
  }

  const handleRemoveSocial = (platform: string) => {
    const newSocialLinks = { ...profile.social_links }
    delete newSocialLinks[platform]

    setProfile(prev => ({
      ...prev,
      social_links: newSocialLinks
    }))
  }

  return (
    <form onSubmit={updateProfile} className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="shrink-0">
          <img
            className="h-16 w-16 object-cover rounded-full"
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username || 'Guest'}`}
            alt="头像"
          />
        </div>
        <label className="block">
          <span className="sr-only">选择头像</span>
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-gray-900 file:text-white
              hover:file:bg-gray-800
            "
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          用户名
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FiUser className="text-gray-400" />
          </div>
          <input
            type="text"
            value={profile.username}
            onChange={e => setProfile({ ...profile, username: e.target.value })}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            placeholder="请输入用户名"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          个人简介
        </label>
        <div className="mt-1">
          <textarea
            rows={3}
            value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            placeholder="介绍一下你自己..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          所在地
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FiMapPin className="text-gray-400" />
          </div>
          <input
            type="text"
            value={profile.location}
            onChange={e => setProfile({ ...profile, location: e.target.value })}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            placeholder="你在哪里？"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          社交账号
        </label>
        
        <div className="space-y-3">
          {Object.entries(profile.social_links).map(([platform, link]) => {
            const config = SOCIAL_PLATFORMS[platform as SocialPlatform] || SOCIAL_PLATFORMS.custom
            const Icon = config.icon
            
            const displayText = (() => {
              if (platform === 'github') {
                return link.split('/').pop() || link
              }
              if (platform === 'telegram') {
                return '@' + link.split('/').pop() || link
              }
              if (platform === 'bilibili') {
                return 'UID: ' + link.split('/').pop() || link
              }
              return link
            })()

            return (
              <div key={platform} className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <a 
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-blue-600 hover:text-blue-800 truncate"
                >
                  {displayText}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveSocial(platform)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )
          })}

          {showAddSocial ? (
            <div className="space-y-3 p-4 border border-gray-200 rounded-md">
              <div className="flex space-x-3">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                  className="block w-1/3 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  {Object.entries(SOCIAL_PLATFORMS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder={SOCIAL_PLATFORMS[newPlatform].placeholder}
                  className="block flex-1 pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSocial(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddSocial}
                  disabled={!newLink}
                  className="px-3 py-1 text-sm text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSocial(true)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <FaPlus className="w-4 h-4 mr-1" />
              添加社交账号
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`text-sm ${
          message.includes('失败') ? 'text-red-600' : 'text-green-600'
        }`}>
          {message}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : '保存修改'}
        </button>
      </div>
    </form>
  )
} 