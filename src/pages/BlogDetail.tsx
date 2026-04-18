import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SEO } from '@/src/components/SEO';
import { Sidebar } from '@/src/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Tag, Clock } from 'lucide-react';
import { BlogPost } from '@/src/types';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPost(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-xl font-bold">Post not found.</p>
        <a href="/" className="text-primary hover:underline mt-4 inline-block">Back to home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-12">
      <SEO 
        title={post.seoTitle || post.title} 
        description={post.seoDescription || post.content.substring(0, 160)}
        ogImage={post.image}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            {/* Post Header */}
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="aspect-[21/9] relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <CardContent className="p-8">
                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.created_at), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-[#1a3a5a] mb-8 leading-tight">
                  {post.title}
                </h1>

                <div className="prose prose-slate max-w-none">
                  <div className="markdown-body">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t flex flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    {post.tags.map(tag => (
                      <span key={tag} className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
