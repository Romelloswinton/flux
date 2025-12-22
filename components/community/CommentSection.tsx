'use client'

import { useState } from 'react'
import { MessageSquare, Send, Loader2, Trash2, Edit2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  useComments,
  useCommentReplies,
  useCreateComment,
  useDeleteComment,
  type Comment,
} from '@/lib/hooks/useSocial'
import { LikeButton } from './LikeButton'

interface CommentSectionProps {
  entityType: 'project' | 'asset' | 'model_3d'
  entityId: string
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { data: comments = [], isLoading } = useComments(entityType, entityId)
  const createComment = useCreateComment()
  const [newComment, setNewComment] = useState('')

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await createComment.mutateAsync({
        entityType,
        entityId,
        content: newComment,
      })
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || createComment.isPending}
            size="sm"
          >
            {createComment.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              entityType={entityType}
              entityId={entityId}
            />
          ))
        )}
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  entityType,
  entityId,
  isReply = false,
}: {
  comment: Comment
  entityType: 'project' | 'asset' | 'model_3d'
  entityId: string
  isReply?: boolean
}) {
  const { data: replies = [] } = useCommentReplies(comment.id)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showReplies, setShowReplies] = useState(false)

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    try {
      await createComment.mutateAsync({
        entityType,
        entityId,
        content: replyContent,
        parentCommentId: comment.id,
      })
      setReplyContent('')
      setShowReplyForm(false)
      setShowReplies(true)
    } catch (error) {
      console.error('Failed to create reply:', error)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment.mutateAsync(comment.id)
      } catch (error) {
        console.error('Failed to delete comment:', error)
      }
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

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author?.avatar_url ? (
            <img
              src={comment.author.avatar_url}
              alt={comment.author.full_name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(comment.author?.full_name || null)}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 space-y-2">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {comment.author?.full_name || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {comment.is_edited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LikeButton
              entityType="comment"
              entityId={comment.id}
              showCount={true}
              size="sm"
              variant="ghost"
            />
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
            {!isReply && comment.reply_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="resize-none text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyContent.trim() || createComment.isPending}
                >
                  Reply
                </Button>
              </div>
            </form>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  entityType={entityType}
                  entityId={entityId}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
