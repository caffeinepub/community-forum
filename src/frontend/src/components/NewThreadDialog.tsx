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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "../backend";
import { useCreateThread } from "../hooks/useQueries";

interface NewThreadDialogProps {
  categoryId: Id;
}

export function NewThreadDialog({ categoryId }: NewThreadDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const createThread = useCreateThread();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      const thread = await createThread.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        categoryId,
      });
      toast.success("Thread created!");
      setOpen(false);
      setTitle("");
      setBody("");
      navigate({ to: "/thread/$id", params: { id: thread.id.toString() } });
    } catch {
      toast.error("Failed to create thread");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-ocid="thread.open_modal_button">
          <Plus className="h-4 w-4 mr-1.5" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="thread.dialog">
        <DialogHeader>
          <DialogTitle>Start a New Thread</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="thread-title">Title</Label>
            <Input
              id="thread-title"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-ocid="thread.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="thread-body">Body</Label>
            <Textarea
              id="thread-body"
              placeholder="Share more details..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
              data-ocid="thread.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="thread.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createThread.isPending || !title.trim() || !body.trim()}
              data-ocid="thread.submit_button"
            >
              {createThread.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : null}
              {createThread.isPending ? "Posting..." : "Post Thread"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
