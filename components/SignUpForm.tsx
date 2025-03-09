'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FiMail, FiPhone, FiLock, FiUser } from 'react-icons/fi'

type SignUpMethod = 'email' | 'phone'

export default function SignUpForm() {
  const [method, setMethod] = useState<SignUpMethod>('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    username: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (method === 'email') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            }
          }
        })

        if (error) throw error

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user?.id,
            username: formData.username,
            updated_at: new Date().toISOString()
          })

        if (profileError) throw profileError
        setMessage('验证邮件已发送，请查收邮箱完成注册')
      } else {
        const { data, error } = await supabase.auth.signUp({
          phone: formData.phone,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            }
          }
        })

        if (error) throw error
        setMessage('验证码已发送到您的手机')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            method === 'email'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setMethod('email')}
        >
          邮箱注册
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            method === 'phone'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setMethod('phone')}
        >
          手机注册
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="请输入用户名"
            />
          </div>
        </div>

        {method === 'email' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              邮箱地址
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                placeholder="请输入邮箱地址"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              手机号码
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                placeholder="请输入手机号码"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            密码
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="请输入密码"
              minLength={6}
            />
          </div>
        </div>

        {message && (
          <div className={`text-sm ${
            message.includes('错误') ? 'text-red-600' : 'text-green-600'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
    </div>
  )
} 