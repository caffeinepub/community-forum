import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import type { ForumCategory } from "../backend";

interface CategoryCardProps {
  category: ForumCategory;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to="/category/$id"
        params={{ id: category.id.toString() }}
        data-ocid={`category.item.${index + 1}`}
      >
        <Card className="group hover:shadow-card hover:border-primary/30 transition-all duration-200 cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display font-semibold text-base text-card-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h2>
              <Badge
                variant="secondary"
                className="shrink-0 flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3" />
                {category.postCount.toString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
