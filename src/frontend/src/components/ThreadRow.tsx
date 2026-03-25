import { Link } from "@tanstack/react-router";
import { MessageSquare, ThumbsUp, User } from "lucide-react";
import type { Thread } from "../backend";
import { formatRelativeTime, truncatePrincipal } from "../utils/format";

interface ThreadRowProps {
  thread: Thread;
  index: number;
}

export function ThreadRow({ thread, index }: ThreadRowProps) {
  return (
    <Link
      to="/thread/$id"
      params={{ id: thread.id.toString() }}
      data-ocid={`thread.item.${index + 1}`}
      className="block"
    >
      <div className="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-all duration-150 cursor-pointer">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
            {thread.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {truncatePrincipal(thread.author)}
            </span>
            <span>{formatRelativeTime(thread.timestamp)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {thread.upvotes.toString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {thread.replyCount.toString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
