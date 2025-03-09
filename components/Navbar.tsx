'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiClock, FiBarChart2, FiShare2 } from 'react-icons/fi'
import Link from 'next/link'
import NotificationBell from './NotificationBell'

interface NavbarProps {
  user: any
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                Destiny
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <NotificationBell user={user} />
            <Link
              href="/history"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiClock className="mr-2" />
              贴贴历史
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiSettings className="mr-2" />
              个人资料
            </Link>
            <Link
              href="/stats"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiBarChart2 className="mr-2" />
              贴贴统计
            </Link>
            <Link
              href="/network"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiShare2 className="mr-2" />
              关系网络
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FiLogOut className="mr-2" />
              退出登录
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="px-4 py-2 border-b border-gray-200">
            <NotificationBell user={user} />
          </div>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/history"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FiClock className="mr-2" />
                贴贴历史
              </div>
            </Link>
            <Link
              href="/profile"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FiSettings className="mr-2" />
                个人资料
              </div>
            </Link>
            <Link
              href="/stats"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-2" />
                贴贴统计
              </div>
            </Link>
            <Link
              href="/network"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FiShare2 className="mr-2" />
                关系网络
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FiLogOut className="mr-2" />
                退出登录
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
} 