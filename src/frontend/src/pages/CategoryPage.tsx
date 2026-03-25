import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, MessagesSquare } from "lucide-react";
import { motion } from "motion/react";
import { NewThreadDialog } from "../components/NewThreadDialog";
import { ThreadRow } from "../components/ThreadRow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useListCategories,
  useListThreadsByCategory,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"];

export function CategoryPage() {
  const { id } = useParams({ from: "/category/$id" });
  const categoryId = BigInt(id);

  const { data: categories } = useListCategories();
  const { data: threads, isLoading } = useListThreadsByCategory(categoryId);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const category = categories?.find((c) => c.id === categoryId);

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        data-ocid="nav.link"
      >
        <ChevronLeft className="h-4 w-4" />
        All Categories
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              {category?.name ?? "Category"}
            </h1>
            {category?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            )}
          </div>
          {isAuthenticated && <NewThreadDialog categoryId={categoryId} />}
        </div>
      </motion.div>

      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-accent rounded-lg text-sm text-accent-foreground">
          Sign in to create a thread.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2" data-ocid="thread.loading_state">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : !threads || threads.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="thread.empty_state"
        >
          <MessagesSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No threads yet</p>
          <p className="text-sm mt-1">Be the first to start a conversation!</p>
          {isAuthenticated && <NewThreadDialog categoryId={categoryId} />}
        </div>
      ) : (
        <div className="space-y-2" data-ocid="thread.list">
          {threads.map((thread, i) => (
            <motion.div
              key={thread.id.toString()}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <ThreadRow thread={thread} index={i} />
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
