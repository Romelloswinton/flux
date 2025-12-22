'use client'

import { Bell, BellOff, Check, Loader2, Heart, MessageSquare, UserPlus, Users, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from '@/lib/hooks/useSocial'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NotificationCenterProps {
  isOpen?: boolean
  onClose?: () => void
}

export function NotificationCenter({ isOpen = true, onClose }: NotificationCenterProps) {
  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const router = useRouter()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markRead.mutateAsync(notification.id)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
      onClose?.()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'collaboration_invite':
      case 'collaboration_accepted':
        return <Users className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isOpen) return null

  return (
    <Card className="w-full max-w-md">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 px-6">
            <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-gray-500">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Actor Avatar */}
                  <div className="flex-shrink-0">
                    {notification.actor?.avatar_url ? (
                      <img
                        src={notification.actor.avatar_url}
                        alt={notification.actor.full_name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(notification.actor?.full_name || null)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </div>

                    <p className="font-medium text-sm mb-1">{notification.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {notification.actor?.full_name || 'Someone'}
                      </span>{' '}
                      {notification.message}
                    </p>

                    {notification.action_url && (
                      <div className="flex items-center gap-1 text-xs text-primary mt-2">
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function formatNotificationTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return time.toLocaleDateString()
}

/**
 * Notification Bell Icon with Badge
 */
export function NotificationBell({ onClick }: { onClick?: () => void }) {
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
