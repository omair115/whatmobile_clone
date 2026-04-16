import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mobile } from '@/src/types';
import { PhoneCard } from '@/src/components/PhoneCard';
import { SEO } from '@/src/components/SEO';
import { Smartphone, ChevronRight } from 'lucide-react';

export function PriceRangePage() {
  const [searchParams] = useSearchParams();
  const min = searchParams.get('min');
  const max = searchParams.get('max');
  const label = searchParams.get('label') || 'Price Range';
  
  const [mobiles, setMobiles] = useState<Mobile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!min || !max) return;
    
    setIsLoading(true);
    fetch(`/api/mobiles?minPrice=${min}&maxPrice=${max}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMobiles(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [min, max]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-12">
      <SEO 
        title={`Mobile Phone Prices ${label} in Pakistan`} 
        description={`Find the best mobile phones in the price range of ${label} in Pakistan. Compare specs and find your next smartphone.`}
      />

      <div className="bg-[#1a3a5a] py-4 border-b border-[#0d2640]">
        <div className="container mx-auto px-4 flex items-center gap-2 text-white">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Smartphone className="h-6 w-6" />
            <span className="text-xl font-black tracking-tighter uppercase">MobiSpec</span>
          </a>
          <ChevronRight className="h-4 w-4 opacity-50" />
          <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-[#f8f9fa] border-b px-6 py-4">
            <h1 className="text-xl font-bold text-[#1a3a5a] uppercase tracking-tight">
              Mobile Phone Prices {label} in Pakistan
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {mobiles.length} smartphones in this range
            </p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : mobiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mobiles.map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No mobiles found in this price range yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
