import { BlogPost } from '@/src/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <a href={`/blog/${post.slug}`} className="block group">
      <Card className="overflow-hidden border-muted/60 hover:border-primary/50 transition-all duration-300">
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={post.image || 'https://picsum.photos/seed/tech/800/450'} 
            alt={post.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{post.author}</span>
            </div>
          </div>
          <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
