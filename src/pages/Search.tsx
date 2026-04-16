import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '@/src/components/SEO';
import { PhoneCard } from '@/src/components/PhoneCard';
import { Sidebar } from '@/src/components/Sidebar';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { Mobile } from '@/src/types';

// Search page component
export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Mobile[]>([]);

  useEffect(() => {
    fetch('/api/mobiles')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const filtered = data.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.brand.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered);
        }
      })
      .catch(err => console.error(err));
  }, [query]);

  return (
    <div className="min-h-screen pb-12">
      <SEO 
        title={`Search results for "${query}"`} 
        description={`Find mobile phones matching your search for ${query}.`}
      />

      <div className="bg-muted/30 border-b py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black mb-6">Search Results</h1>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => setSearchParams({ q: e.target.value })}
              placeholder="Search phones, brands..." 
              className="pl-10 h-12 text-lg rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                Found <span className="font-bold text-foreground">{results.length}</span> results for "{query}"
              </p>
              <Button variant="outline" size="sm" className="rounded-full">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
              </Button>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {results.map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
                <p className="text-lg font-medium text-muted-foreground">No phones found matching your search.</p>
                <Button variant="link" onClick={() => setSearchParams({})}>Clear search</Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Button import needed
import { Button } from '@/components/ui/button';
