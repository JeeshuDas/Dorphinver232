import { useState } from 'react';
import { Comment } from '../types';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion } from 'motion/react';

interface CommentThreadProps {
  comment: Comment;
  level?: number;
  maxLevel?: number;
  onReply?: (parentId: string, text: string) => void;
}

export function CommentThread({ 
  comment, 
  level = 0, 
  maxLevel = 3,
  onReply 
}: CommentThreadProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handlePostReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  const indentPadding = level > 0 ? `${level * 12}px` : '0px';
  const canReply = level < maxLevel;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="w-full">
      {/* Main Comment */}
      <motion.div 
        className="flex gap-2 mb-2"
        style={{ paddingLeft: indentPadding }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Vertical line for nested comments */}
        {level > 0 && (
          <div className="w-0.5 bg-white/10 -ml-3 mr-3" />
        )}
        
        <div 
          className="w-7 h-7 rounded-full shrink-0"
          style={{ backgroundColor: comment.avatar }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white text-xs truncate">{comment.user}</p>
            <span className="text-white/40 text-[10px]">{comment.time}</span>
          </div>
          <p className="text-white/70 text-xs leading-relaxed mb-1.5">{comment.text}</p>
          
          {/* Reply button */}
          <div className="flex items-center gap-3">
            {canReply && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReplyBox(!showReplyBox);
                }}
                className="text-white/50 hover:text-white/80 text-[10px] transition-colors"
              >
                Reply
              </button>
            )}
            
            {hasReplies && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReplies(!showReplies);
                }}
                className="text-white/50 hover:text-white/80 text-[10px] transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                <span className="ml-0.5">{showReplies ? '▼' : '▶'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reply Input Box */}
      {showReplyBox && canReply && (
        <motion.div 
          className="flex gap-2 mb-2"
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-7 shrink-0" /> {/* Spacer for alignment */}
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder={`Reply to ${comment.user}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 min-h-[35px] max-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/40 text-xs resize-none"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePostReply(e as any);
                }
                if (e.key === 'Escape') {
                  setShowReplyBox(false);
                  setReplyText('');
                }
              }}
              autoFocus
            />
            <Button 
              size="sm" 
              onClick={handlePostReply}
              disabled={!replyText.trim()}
              className="shrink-0 self-end h-[35px] text-xs px-3"
            >
              Reply
            </Button>
          </div>
        </motion.div>
      )}

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="space-y-2">
          {comment.replies!.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              level={level + 1}
              maxLevel={maxLevel}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
