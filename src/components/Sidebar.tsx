import { CATEGORIES, FEATURE_CATEGORIES } from '@/src/constants';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Filter, Smartphone } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="space-y-8">
      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold uppercase tracking-wider text-sm">Trending Now</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <a key={i} href="#" className="flex gap-3 group">
              <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={`https://picsum.photos/seed/phone${i}/100/100`} 
                  alt="Trending phone" 
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">Samsung Galaxy S25 Ultra</h4>
                <p className="text-xs text-muted-foreground mt-1">$1,199</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-bold uppercase tracking-wider text-sm">Browse by Price</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <a key={cat.id} href={`/category/${cat.id}`}>
              <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer py-1 px-3">
                {cat.name}
              </Badge>
            </a>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-primary" />
          <h3 className="font-bold uppercase tracking-wider text-sm">Special Features</h3>
        </div>
        <div className="space-y-2">
          {FEATURE_CATEGORIES.map(cat => (
            <a 
              key={cat.id} 
              href={`/feature/${cat.id}`}
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}
