import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryCard } from "../components/CategoryCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCategory,
  useIsAdmin,
  useListCategories,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d"];

const SEED_CATEGORIES = [
  {
    id: BigInt(0),
    name: "General Discussion",
    description: "Talk about anything and everything with the community.",
    postCount: BigInt(0),
  },
  {
    id: BigInt(1),
    name: "Announcements",
    description: "Official announcements, updates, and news from the team.",
    postCount: BigInt(0),
  },
  {
    id: BigInt(2),
    name: "Help & Support",
    description:
      "Ask questions and get help from experienced community members.",
    postCount: BigInt(0),
  },
  {
    id: BigInt(3),
    name: "Showcase",
    description: "Share your projects, creations, and achievements.",
    postCount: BigInt(0),
  },
  {
    id: BigInt(4),
    name: "Off-Topic",
    description:
      "Casual conversations, memes, and fun stuff not related to the main topic.",
    postCount: BigInt(0),
  },
];

export function HomePage() {
  const { data: categories, isLoading } = useListCategories();
  const { data: isAdmin } = useIsAdmin();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const createCategory = useCreateCategory();

  const [adminOpen, setAdminOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const displayCategories =
    categories && categories.length > 0
      ? categories
      : !isLoading
        ? SEED_CATEGORIES
        : [];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync({
        name: newName.trim(),
        description: newDesc.trim(),
      });
      toast.success("Category created!");
      setAdminOpen(false);
      setNewName("");
      setNewDesc("");
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Community Forum
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse categories and join the conversation
            </p>
          </div>
          {isAuthenticated && isAdmin && (
            <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-ocid="category.open_modal_button">
                  <Plus className="h-4 w-4 mr-1" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="category.dialog">
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cat-name">Name</Label>
                    <Input
                      id="cat-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Category name"
                      required
                      data-ocid="category.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cat-desc">Description</Label>
                    <Textarea
                      id="cat-desc"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What is this category about?"
                      rows={3}
                      required
                      data-ocid="category.textarea"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAdminOpen(false)}
                      data-ocid="category.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCategory.isPending}
                      data-ocid="category.submit_button"
                    >
                      {createCategory.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : null}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="category.loading_state">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : displayCategories.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="category.empty_state"
        >
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No categories yet</p>
          <p className="text-sm mt-1">
            An admin needs to create the first category.
          </p>
        </div>
      ) : (
        <div className="grid gap-3" data-ocid="category.list">
          {displayCategories.map((cat, i) => (
            <CategoryCard key={cat.id.toString()} category={cat} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
