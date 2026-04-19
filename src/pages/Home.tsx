import { useState, useEffect } from 'react';
import { PhoneCard } from '@/src/components/PhoneCard';
import { BlogCard } from '@/src/components/BlogCard';
import { BrandGrid } from '@/src/components/BrandGrid';
import { Sidebar } from '@/src/components/Sidebar';
import { SEO } from '@/src/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Zap, Star, Clock, Smartphone } from 'lucide-react';
import { Mobile, BlogPost, Brand, PriceRange, Network, RamOption, ScreenSize, MobileFeature, OsOption } from '@/src/types';
import { BRANDS } from '@/src/constants';

// Removed Mock Data Constants

export function Home() {
  const [phones, setPhones] = useState<Mobile[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [ramOptions, setRamOptions] = useState<RamOption[]>([]);
  const [screenSizes, setScreenSizes] = useState<ScreenSize[]>([]);
  const [mobileFeatures, setMobileFeatures] = useState<MobileFeature[]>([]);
  const [osOptions, setOsOptions] = useState<OsOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/mobiles'),
      fetch('/api/brands'),
      fetch('/api/price-ranges'),
      fetch('/api/networks'),
      fetch('/api/ram-options'),
      fetch('/api/screen-sizes'),
      fetch('/api/mobile-features'),
      fetch('/api/os-options'),
      fetch('/api/posts')
    ])
      .then(async ([mobRes, brandRes, priceRes, netRes, ramRes, screenRes, featRes, osRes, postRes]) => {
        const mobData = await mobRes.json();
        const brandData = await brandRes.json();
        const priceData = await priceRes.json();
        const netData = await netRes.json();
        const ramData = await ramRes.json();
        const screenData = await screenRes.json();
        const featData = await featRes.json();
        const osData = await osRes.json();
        const postData = await postRes.json();
        
        if (Array.isArray(mobData)) setPhones(mobData);
        if (Array.isArray(brandData)) setBrands(brandData);
        if (Array.isArray(priceData)) setPriceRanges(priceData);
        if (Array.isArray(netData)) setNetworks(netData);
        if (Array.isArray(ramData)) setRamOptions(ramData);
        if (Array.isArray(screenData)) setScreenSizes(screenData);
        if (Array.isArray(featData)) setMobileFeatures(featData);
        if (Array.isArray(osData)) setOsOptions(osData);
        if (Array.isArray(postData)) setPosts(postData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const displayPhones = phones;

  // Grouping by price for sections
  const pkr50kPlus = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price > 50000; 
  });
  
  const pkr40kTo50k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 50000 && price > 40000;
  });

  const pkr30kTo40k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 40000 && price > 30000;
  });

  const pkr20kTo30k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 30000 && price > 20000;
  });

  const pkrUnder10k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 10000;
  });

  const comingSoon = displayPhones.slice(0, 4); 

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-12">
      <SEO 
        title="Latest Mobile Phone Specs & Prices in Pakistan" 
        description="Find detailed specifications, prices, and reviews of the latest mobile phones from Samsung, Apple, Xiaomi, Vivo, and more."
      />

      {/* Header Banner */}
      <div className="bg-[#1a3a5a] py-4 border-b border-[#0d2640]">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Smartphone className="h-8 w-8" />
            <span className="text-2xl font-black tracking-tighter uppercase">MobiSpec<span className="text-primary-foreground/60 text-sm lowercase">.com</span></span>
          </div>
          <div className="hidden md:flex gap-4">
            <Button variant="secondary" size="sm" className="bg-[#2c4c6c] text-white border-none hover:bg-[#3c5c7c]">Mobile Phones</Button>
            <Button variant="secondary" size="sm" className="bg-[#2c4c6c] text-white border-none hover:bg-[#3c5c7c]">Reviews</Button>
            <Button variant="secondary" size="sm" className="bg-[#2c4c6c] text-white border-none hover:bg-[#3c5c7c]">News</Button>
            <Button variant="secondary" size="sm" className="bg-[#2c4c6c] text-white border-none hover:bg-[#3c5c7c]">Contact us</Button>
            <Button variant="secondary" size="sm" className="bg-[#2c4c6c] text-white border-none hover:bg-[#3c5c7c]">Outlets</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Hero Slider Placeholder */}
            <div className="aspect-[21/9] bg-gradient-to-r from-[#1a3a5a] to-[#2c4c6c] rounded-lg overflow-hidden relative flex items-center justify-center text-white p-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-2">Daily Price Update</h2>
                <p className="text-xl opacity-80">Check the latest smartphone prices in real-time</p>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              </div>
            </div>

            {/* Latest Mobile Phones Section */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#d32f2f] uppercase tracking-tight">Latest Mobile Phones & Prices</h2>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {displayPhones.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
                {displayPhones.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground text-xs italic">
                    No latest mobile phones found.
                  </div>
                )}
              </div>
            </section>

            {/* Price Row 1: > 50,000 */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Mobile phones Price in Pakistan {'>'} 50,000 Rs.</h2>
                <a href="#" className="text-[10px] font-bold text-[#d32f2f] hover:underline">More {">>"}</a>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {pkr50kPlus.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            </section>

            {/* Price Row 2: 40k - 50k */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Mobile Prices Between 40,000 and 50,000 Rs.</h2>
                <a href="#" className="text-[10px] font-bold text-[#d32f2f] hover:underline">More {">>"}</a>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {pkr40kTo50k.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            </section>

            {/* Price Row 3: 30k - 40k */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Mobile Prices 30,000 - 40,000 Rs.</h2>
                <a href="#" className="text-[10px] font-bold text-[#d32f2f] hover:underline">More {">>"}</a>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {pkr30kTo40k.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            </section>

            {/* Price Table Section */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 text-center">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Mobile Phones Price in Pakistan</h2>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b">
                      <th className="px-4 py-2 text-xs font-bold text-[#1a3a5a] uppercase">Latest Mobile Phones Models</th>
                      <th className="px-4 py-2 text-xs font-bold text-[#1a3a5a] uppercase text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayPhones.slice(0, 10).map(phone => (
                      <tr key={phone.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2 text-xs">
                          <a href={`/phone/${phone.slug}`} className="text-[#1a3a5a] hover:text-primary">{phone.name}</a>
                        </td>
                        <td className="px-4 py-2 text-xs text-right font-bold text-[#d32f2f]">
                          {phone.currency} {phone.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Price Row 4: 20k - 30k */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Mobile Prices 20,001 - 30,000 Rs.</h2>
                <a href="#" className="text-[10px] font-bold text-[#d32f2f] hover:underline">More {">>"}</a>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {pkr20kTo30k.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            </section>

            {/* Price Row 5: Under 10k */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Mobile Prices under 10,000 in Pakistan</h2>
                <a href="#" className="text-[10px] font-bold text-[#d32f2f] hover:underline">More {">>"}</a>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {pkrUnder10k.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            </section>

            {/* Coming Soon Section */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Coming Soon Mobiles Prices in Pakistan</h2>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {comingSoon.map(phone => (
                  <div key={phone.id} className="flex flex-col items-center text-center">
                    <div className="aspect-[3/4] w-24 relative mb-2">
                      <img src={phone.images[0]} alt={phone.name} className="object-contain w-full h-full" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="text-[10px] font-bold leading-tight mb-1">{phone.name}</h3>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Expected Price</p>
                    <p className="text-[10px] font-bold text-[#d32f2f]">Rs. {parseInt(phone.price.toString().replace(/,/g, '')) * 210}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Latest News Section */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Latest News</h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map(post => (
                  <a key={post.id} href={`/blog/${post.slug}`} className="group block border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={post.image} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                    </div>
                  </a>
                ))}
                {posts.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground text-xs italic">
                    No latest news available.
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search by Brand Sidebar */}
            <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                Search by Brand
              </div>
              <div className="p-2 grid grid-cols-1 gap-0.5">
                {brands.length > 0 ? brands.map(brand => (
                  <a key={brand.id} href={`/brand/${brand.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors border-b last:border-0 border-muted/50 flex justify-between items-center group">
                    <span>{brand.name} Mobile</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )) : (
                  <div className="px-3 py-4 text-center text-[10px] text-muted-foreground italic">No brands found.</div>
                )}
              </div>
            </section>

            {/* Search by Price Sidebar */}
            <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                Search by Price
              </div>
              <div className="p-2 grid grid-cols-1 gap-0.5 text-[11px] font-medium">
                {priceRanges.length > 0 ? priceRanges.map(range => (
                  <a key={range.id} href={`/price-range?min=${range.minPrice}&max=${range.maxPrice}&label=${encodeURIComponent(range.label)}`} className="px-3 py-1.5 hover:bg-muted border-b border-muted/50 block">
                    {range.label}
                  </a>
                )) : (
                  <div className="px-3 py-4 text-center text-[10px] text-muted-foreground italic">No price ranges found.</div>
                )}
              </div>
            </section>

            {/* Search by Network Sidebar */}
            {networks.length > 0 && (
              <section className="bg-white border rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                  Search by Network
                </div>
                <div className="p-2 grid grid-cols-1 gap-0.5 text-[11px] font-medium">
                  {networks.map(n => (
                    <a key={n.id} href={`/network/${n.slug}`} className="px-3 py-1.5 hover:bg-muted border-b border-muted/50 block">
                      {n.name}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Search by RAM Sidebar */}
            {ramOptions.length > 0 && (
              <section className="bg-white border rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                  Search by RAM
                </div>
                <div className="p-2 grid grid-cols-1 gap-0.5 text-[11px] font-medium">
                  {ramOptions.map(r => (
                    <a key={r.id} href={`/ram/${r.slug}`} className="px-3 py-1.5 hover:bg-muted border-b border-muted/50 block">
                      {r.label}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Search by Screen Sidebar */}
            {screenSizes.length > 0 && (
              <section className="bg-white border rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                  Search by Screen
                </div>
                <div className="p-2 grid grid-cols-1 gap-0.5 text-[11px] font-medium">
                  {screenSizes.map(s => (
                    <a key={s.id} href={`/screen/${s.slug}`} className="px-3 py-1.5 hover:bg-muted border-b border-muted/50 block">
                      {s.label}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Search by Feature Sidebar */}
            {mobileFeatures.length > 0 && (
              <section className="bg-white border rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                  Search by Cam / Feature
                </div>
                <div className="p-2 grid grid-cols-1 gap-0.5 text-[11px] font-medium">
                  {mobileFeatures.map(f => (
                    <a key={f.id} href={`/feature/${f.slug}`} className="px-3 py-1.5 hover:bg-muted border-b border-muted/50 block">
                      {f.label}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Search by OS Sidebar */}
            {osOptions.length > 0 && (
              <section className="bg-white border rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase">
                  Search by OS
                </div>
                <div className="p-2 grid grid-cols-1 gap-0.5 text-[11px] font-medium">
                  {osOptions.map(o => (
                    <a key={o.id} href={`/os/${o.slug}`} className="px-3 py-1.5 hover:bg-muted border-b border-muted/50 block">
                      {o.name}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
