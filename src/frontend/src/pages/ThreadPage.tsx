import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Loader2,
  MessageSquare,
  Send,
  ThumbsUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreatePost,
  useThreadWithPosts,
  useUpvoteThread,
} from "../hooks/useQueries";
import {
  formatDate,
  formatRelativeTime,
  truncatePrincipal,
} from "../utils/format";

function PostCard({
  body,
  author,
  timestamp,
  index,
}: {
  body: string;
  author: { toString(): string };
  timestamp: bigint;
  index: number;
}) {
  const initials = author.toString().slice(0, 2).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex gap-3 p-4 rounded-lg bg-card border border-border"
      data-ocid={`reply.item.${index + 1}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">
            {truncatePrincipal({ toString: () => author.toString() })}
          </span>
          <span
            className="text-xs text-muted-foreground"
            title={formatDate(timestamp)}
          >
            {formatRelativeTime(timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap">{body}</p>
      </div>
    </motion.div>
  );
}

export function ThreadPage() {
  const { id } = useParams({ from: "/thread/$id" });
  const threadId = BigInt(id);

  const { data, isLoading } = useThreadWithPosts(threadId);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const createPost = useCreatePost();
  const upvoteThread = useUpvoteThread();

  const [replyBody, setReplyBody] = useState("");

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    try {
      await createPost.mutateAsync({ threadId, body: replyBody.trim() });
      toast.success("Reply posted!");
      setReplyBody("");
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleUpvote = async () => {
    try {
      await upvoteThread.mutateAsync(threadId);
      toast.success("Upvoted!");
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const thread = data?.thread;
  const posts = data?.posts ?? [];
  const categoryId = thread?.categoryId;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to={categoryId !== undefined ? "/category/$id" : "/"}
        params={categoryId !== undefined ? { id: categoryId.toString() } : {}}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        data-ocid="nav.link"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Category
      </Link>

      {isLoading ? (
        <div className="space-y-4" data-ocid="thread.loading_state">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32" />
        </div>
      ) : !thread ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="thread.error_state"
        >
          <p>Thread not found.</p>
        </div>
      ) : (
        <>
          {/* Original Post */}
          <motion.article
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-5 rounded-xl bg-card border border-border"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs bg-primary/15 text-primary">
                  {thread.author.toString().slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-xl text-foreground mb-2">
                  {thread.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="font-medium">
                    {truncatePrincipal(thread.author)}
                  </span>
                  <span title={formatDate(thread.timestamp)}>
                    {formatRelativeTime(thread.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {thread.body}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUpvote}
                disabled={!isAuthenticated || upvoteThread.isPending}
                className="gap-1.5"
                data-ocid="thread.toggle"
              >
                {upvoteThread.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ThumbsUp className="h-3.5 w-3.5" />
                )}
                {thread.upvotes.toString()} Upvotes
              </Button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {thread.replyCount.toString()} replies
              </span>
            </div>
          </motion.article>

          {/* Replies */}
          {posts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {posts.length} {posts.length === 1 ? "Reply" : "Replies"}
              </h2>
              <div className="space-y-3">
                {posts.map((post, i) => (
                  <PostCard
                    key={post.id.toString()}
                    body={post.body}
                    author={post.author}
                    timestamp={post.timestamp}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {posts.length === 0 && (
            <div
              className="text-center py-8 text-muted-foreground mb-8"
              data-ocid="reply.empty_state"
            >
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No replies yet. Be the first to respond!
              </p>
            </div>
          )}

          {/* Reply Form */}
          {isAuthenticated ? (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-border pt-6"
            >
              <h2 className="text-sm font-semibold mb-3">Leave a Reply</h2>
              <form onSubmit={handleReply} className="space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={4}
                  required
                  data-ocid="reply.textarea"
                />
                <Button
                  type="submit"
                  disabled={createPost.isPending || !replyBody.trim()}
                  className="gap-1.5"
                  data-ocid="reply.submit_button"
                >
                  {createPost.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {createPost.isPending ? "Posting..." : "Post Reply"}
                </Button>
              </form>
            </motion.section>
          ) : (
            <div className="border-t border-border pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in to leave a reply.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
