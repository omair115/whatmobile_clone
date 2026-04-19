import React, { useState, useEffect } from 'react';
import { Comment, User } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  mobileId: string;
  currentUser: User | null;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmit: (parentId?: string) => void;
  isSubmitting: boolean;
}

const CommentItem = ({ 
  comment, 
  depth = 0, 
  replyingTo, 
  setReplyingTo, 
  replyContent, 
  setReplyContent, 
  handleSubmit, 
  isSubmitting 
}: CommentItemProps) => (
  <div className={cn("space-y-4", depth > 0 ? "ml-8 mt-4 border-l pl-4" : "mt-6")}>
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user?.avatar} />
        <AvatarFallback>{comment.user?.name?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#1a3a5a]">{comment.user?.name}</h4>
          <span className="text-[10px] text-muted-foreground italic">
            {comment.created_at ? formatDistanceToNow(new Date(comment.created_at)) : ''} ago
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        <div className="pt-1">
          <button 
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-[10px] font-bold text-[#d32f2f] hover:underline flex items-center"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </button>
        </div>
        
        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea 
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="text-sm min-h-[80px]"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
              <Button size="sm" onClick={() => handleSubmit(comment.id)} disabled={isSubmitting}>
                Post Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {comment.replies && comment.replies.length > 0 && (
      <div className="space-y-4">
        {comment.replies.map(reply => (
          <CommentItem 
            key={reply.id} 
            comment={reply} 
            depth={depth + 1}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    )}
  </div>
);

export function CommentSection({ mobileId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [mobileId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments/${mobileId}`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('TRIGGER_LOGIN'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_id: mobileId,
          content: content.trim(),
          parent_id: parentId
        })
      });

      if (res.ok) {
        if (parentId) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
        fetchComments();
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-sm font-bold text-[#1a3a5a] uppercase flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          Community Discussion
        </h3>
        <span className="text-xs text-muted-foreground font-medium">
          {comments.length} Discussion{comments.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Textarea 
            placeholder={currentUser ? "Share your thoughts on this device..." : "Please login to join the discussion"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!currentUser}
            className="min-h-[100px] text-sm"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isSubmitting || !newComment.trim()}
              className="bg-[#1a3a5a] hover:bg-[#2a4a6a]"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground animate-pulse">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground italic text-sm">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
