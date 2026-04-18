import { useState, useEffect } from 'react';
import { ChevronRight, Filter, Smartphone, Wifi, Cpu, Monitor, Zap, Disc } from 'lucide-react';
import { Brand, PriceRange, Network, RamOption, ScreenSize, MobileFeature, OsOption } from '@/src/types';

interface SidebarProps {
  showPriceFilters?: boolean;
  showFeatureFilters?: boolean;
}

export function Sidebar({ showPriceFilters = true, showFeatureFilters = true }: SidebarProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [ramOptions, setRamOptions] = useState<RamOption[]>([]);
  const [screenSizes, setScreenSizes] = useState<ScreenSize[]>([]);
  const [mobileFeatures, setMobileFeatures] = useState<MobileFeature[]>([]);
  const [osOptions, setOsOptions] = useState<OsOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/brands'),
      fetch('/api/price-ranges'),
      fetch('/api/networks'),
      fetch('/api/ram-options'),
      fetch('/api/screen-sizes'),
      fetch('/api/mobile-features'),
      fetch('/api/os-options'),
    ])
      .then(async ([brandRes, priceRes, netRes, ramRes, screenRes, featRes, osRes]) => {
        const brandData = await brandRes.json();
        const priceData = await priceRes.json();
        const netData = await netRes.json();
        const ramData = await ramRes.json();
        const screenData = await screenRes.json();
        const featData = await featRes.json();
        const osData = await osRes.json();
        
        if (Array.isArray(brandData)) setBrands(brandData);
        if (Array.isArray(priceData)) setPriceRanges(priceData);
        if (Array.isArray(netData)) setNetworks(netData);
        if (Array.isArray(ramData)) setRamOptions(ramData);
        if (Array.isArray(screenData)) setScreenSizes(screenData);
        if (Array.isArray(featData)) setMobileFeatures(featData);
        if (Array.isArray(osData)) setOsOptions(osData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <aside className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-40 bg-white border rounded-lg" />
        ))}
      </aside>
    );
  }

  return (
    <aside className="space-y-4">
      {/* Search by Brand */}
      <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
          <Smartphone className="h-3 w-3" /> Browse Brands
        </div>
        <div className="p-0 flex flex-col divide-y divide-muted/50">
          {brands.map(brand => (
            <a key={brand.id} href={`/brand/${brand.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors flex justify-between items-center group">
              <span>{brand.name}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </section>

      {/* Search by Price */}
      {showPriceFilters && (
        <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
            <Filter className="h-3 w-3" /> Search by Price
          </div>
          <div className="p-0 flex flex-col divide-y divide-muted/50">
            {priceRanges.map(range => (
              <a key={range.id} href={`/price-range?min=${range.minPrice}&max=${range.maxPrice}&label=${encodeURIComponent(range.label)}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
                {range.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Search by Network */}
      <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
          <Wifi className="h-3 w-3" /> Search by Network
        </div>
        <div className="p-0 flex flex-col divide-y divide-muted/50">
          {networks.map(n => (
            <a key={n.id} href={`/network/${n.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
              {n.name}
            </a>
          ))}
        </div>
      </section>

      {/* Search by RAM */}
      <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
          <Cpu className="h-3 w-3" /> Search by RAM
        </div>
        <div className="p-0 flex flex-col divide-y divide-muted/50">
          {ramOptions.map(r => (
            <a key={r.id} href={`/ram/${r.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
              {r.label}
            </a>
          ))}
        </div>
      </section>

      {/* Search by Screen */}
      <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
          <Monitor className="h-3 w-3" /> Search by Screen
        </div>
        <div className="p-0 flex flex-col divide-y divide-muted/50">
          {screenSizes.map(s => (
            <a key={s.id} href={`/screen/${s.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
              {s.label}
            </a>
          ))}
        </div>
      </section>

      {/* Search by Cam / Feature */}
      {showFeatureFilters && (
        <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
            <Zap className="h-3 w-3" /> Cam / Feature
          </div>
          <div className="p-0 flex flex-col divide-y divide-muted/50">
            {mobileFeatures.map(f => (
              <a key={f.id} href={`/feature/${f.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
                {f.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Search by OS */}
      <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5a] text-white px-4 py-2 text-center text-xs font-bold uppercase flex items-center justify-center gap-2">
          <Disc className="h-3 w-3" /> Search by OS
        </div>
        <div className="p-0 flex flex-col divide-y divide-muted/50">
          {osOptions.map(o => (
            <a key={o.id} href={`/os/${o.slug}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
              {o.name}
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}
