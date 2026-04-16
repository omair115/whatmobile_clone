import { useState, useEffect } from 'react';
import { PhoneCard } from '@/src/components/PhoneCard';
import { BlogCard } from '@/src/components/BlogCard';
import { BrandGrid } from '@/src/components/BrandGrid';
import { Sidebar } from '@/src/components/Sidebar';
import { SEO } from '@/src/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Zap, Star, Clock, Smartphone } from 'lucide-react';
import { Mobile, BlogPost, Brand, PriceRange } from '@/src/types';
import { BRANDS } from '@/src/constants';

// Mock Data
const MOCK_PHONES: Mobile[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    slug: 'samsung-galaxy-s25-ultra',
    price: '1,199',
    currency: '$',
    launchDate: 'Jan 2025',
    images: ['https://picsum.photos/seed/s25/400/600'],
    category: 'flagship',
    specs: {
      build: { os: 'Android 15', ui: 'One UI 7', dimensions: '162.3 x 79.0 x 8.6 mm', weight: '232g', sim: 'Dual SIM', colors: 'Titanium Black' },
      frequency: { '2g': 'Yes', '3g': 'Yes', '4g': 'Yes', '5g': 'Yes' },
      processor: { cpu: 'Octa-core', chipset: 'Snapdragon 8 Gen 4', gpu: 'Adreno 830' },
      display: { technology: 'Dynamic AMOLED 2X', size: '6.8 Inches', resolution: '1440 x 3120', protection: 'Gorilla Armor', extra: '120Hz' },
      memory: { builtin: '256GB, 12GB RAM', card: 'No' },
      camera: { main: '200MP Quad', features: '100x Zoom', front: '12MP' },
      connectivity: { wlan: 'Wi-Fi 7', bluetooth: 'v5.4', gps: 'Yes', radio: 'No', usb: 'Type-C 3.2', nfc: 'Yes', infrared: 'No', data: '5G' },
      features: { sensors: 'Fingerprint', audio: 'Stereo', browser: 'HTML5', messaging: 'SMS', games: 'Yes', torch: 'Yes', extra: 'S-Pen' },
      battery: { capacity: '5000mAh', extra: '45W' },
      price: { pkr: '350,000', usd: '1,199' }
    },
    description: 'The ultimate flagship experience.',
    seoTitle: 'Samsung Galaxy S25 Ultra Specs & Price',
    seoDescription: 'Check out the full specifications and price of Samsung Galaxy S25 Ultra.',
    features: ['S-Pen', '100x Zoom', 'AI Features'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    slug: 'iphone-16-pro-max',
    price: '1,099',
    currency: '$',
    launchDate: 'Sep 2024',
    images: ['https://picsum.photos/seed/iphone16/400/600'],
    category: 'flagship',
    specs: {
      build: { os: 'iOS 18', ui: 'iOS 18', dimensions: '163 x 77.6 x 8.3 mm', weight: '227g', sim: 'Dual SIM', colors: 'Natural Titanium' },
      frequency: { '2g': 'Yes', '3g': 'Yes', '4g': 'Yes', '5g': 'Yes' },
      processor: { cpu: 'Hexa-core', chipset: 'A18 Pro', gpu: 'Apple GPU' },
      display: { technology: 'LTPO Super Retina XDR OLED', size: '6.9 Inches', resolution: '1320 x 2868', protection: 'Ceramic Shield', extra: '120Hz' },
      memory: { builtin: '256GB, 8GB RAM', card: 'No' },
      camera: { main: '48MP Triple', features: 'ProRes', front: '12MP' },
      connectivity: { wlan: 'Wi-Fi 7', bluetooth: 'v5.3', gps: 'Yes', radio: 'No', usb: 'Type-C 3.0', nfc: 'Yes', infrared: 'No', data: '5G' },
      features: { sensors: 'Face ID', audio: 'Stereo', browser: 'Safari', messaging: 'iMessage', games: 'Yes', torch: 'Yes', extra: 'Action Button' },
      battery: { capacity: '4676mAh', extra: 'MagSafe' },
      price: { pkr: '450,000', usd: '1,099' }
    },
    description: 'The most powerful iPhone ever.',
    seoTitle: 'iPhone 16 Pro Max Specs & Price',
    seoDescription: 'Full specs and price for Apple iPhone 16 Pro Max.',
    features: ['Action Button', 'USB-C', 'ProMotion'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Xiaomi 15 Pro',
    brand: 'Xiaomi',
    slug: 'xiaomi-15-pro',
    price: '899',
    currency: '$',
    launchDate: 'Oct 2024',
    images: ['https://picsum.photos/seed/xiaomi15/400/600'],
    category: 'flagship',
    specs: {
      build: { os: 'Android 15', ui: 'HyperOS', dimensions: '161.3 x 75.3 x 8.4 mm', weight: '213g', sim: 'Dual SIM', colors: 'Black' },
      frequency: { '2g': 'Yes', '3g': 'Yes', '4g': 'Yes', '5g': 'Yes' },
      processor: { cpu: 'Octa-core', chipset: 'Snapdragon 8 Gen 4', gpu: 'Adreno 830' },
      display: { technology: 'LTPO AMOLED', size: '6.73 Inches', resolution: '1440 x 3200', protection: 'Xiaomi Glass', extra: '120Hz' },
      memory: { builtin: '256GB, 12GB RAM', card: 'No' },
      camera: { main: '50MP Triple', features: 'Leica Optics', front: '32MP' },
      connectivity: { wlan: 'Wi-Fi 7', bluetooth: 'v5.4', gps: 'Yes', radio: 'No', usb: 'Type-C 3.2', nfc: 'Yes', infrared: 'Yes', data: '5G' },
      features: { sensors: 'Fingerprint', audio: 'Stereo', browser: 'HTML5', messaging: 'SMS', games: 'Yes', torch: 'Yes', extra: 'Leica' },
      battery: { capacity: '5400mAh', extra: '120W' },
      price: { pkr: '250,000', usd: '899' }
    },
    description: 'Leica powered photography.',
    seoTitle: 'Xiaomi 15 Pro Specs & Price',
    seoDescription: 'Xiaomi 15 Pro full specifications and Leica camera details.',
    features: ['Leica Optics', '120W Charging', 'IP68'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Vivo X100 Pro',
    brand: 'Vivo',
    slug: 'vivo-x100-pro',
    price: '799',
    currency: '$',
    launchDate: 'Nov 2023',
    images: ['https://picsum.photos/seed/vivox100/400/600'],
    category: 'flagship',
    specs: {
      build: { os: 'Android 14', ui: 'Funtouch 14', dimensions: '164.1 x 75.3 x 8.9 mm', weight: '221g', sim: 'Dual SIM', colors: 'Blue' },
      frequency: { '2g': 'Yes', '3g': 'Yes', '4g': 'Yes', '5g': 'Yes' },
      processor: { cpu: 'Octa-core', chipset: 'Dimensity 9300', gpu: 'Immortalis-G720' },
      display: { technology: 'LTPO AMOLED', size: '6.78 Inches', resolution: '1260 x 2800', protection: 'Glass', extra: '120Hz' },
      memory: { builtin: '512GB, 16GB RAM', card: 'No' },
      camera: { main: '50MP Triple', features: 'Zeiss Optics', front: '32MP' },
      connectivity: { wlan: 'Wi-Fi 7', bluetooth: 'v5.4', gps: 'Yes', radio: 'No', usb: 'Type-C 3.2', nfc: 'Yes', infrared: 'Yes', data: '5G' },
      features: { sensors: 'Fingerprint', audio: 'Stereo', browser: 'HTML5', messaging: 'SMS', games: 'Yes', torch: 'Yes', extra: 'Zeiss' },
      battery: { capacity: '5400mAh', extra: '100W' },
      price: { pkr: '220,000', usd: '799' }
    },
    description: 'Zeiss optics for professional photos.',
    seoTitle: 'Vivo X100 Pro Specs & Price',
    seoDescription: 'Explore Vivo X100 Pro specs and Zeiss camera features.',
    features: ['Zeiss Optics', '100W Charging', 'V3 Chip'],
    createdAt: new Date().toISOString()
  }
];

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Samsung Galaxy S25 Ultra: Everything We Know So Far',
    slug: 'samsung-s25-ultra-leaks',
    content: 'The upcoming Samsung flagship is expected to feature...',
    author: 'Admin',
    image: 'https://picsum.photos/seed/s25leak/800/450',
    tags: ['Samsung', 'Leaks', 'Flagship'],
    seoTitle: 'Samsung S25 Ultra Leaks & Rumors',
    seoDescription: 'Read the latest leaks about the upcoming Samsung Galaxy S25 Ultra.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Top 5 Gaming Phones in 2024',
    slug: 'top-gaming-phones-2024',
    content: 'If you are a serious mobile gamer, these are the phones...',
    author: 'Tech Guru',
    image: 'https://picsum.photos/seed/gaming/800/450',
    tags: ['Gaming', 'Top 5', 'Performance'],
    seoTitle: 'Best Gaming Phones 2024',
    seoDescription: 'A list of the best smartphones for gaming in 2024.',
    createdAt: new Date().toISOString()
  }
];

export function Home() {
  const [phones, setPhones] = useState<Mobile[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/mobiles'),
      fetch('/api/brands'),
      fetch('/api/price-ranges')
    ])
      .then(async ([mobRes, brandRes, priceRes]) => {
        const mobData = await mobRes.json();
        const brandData = await brandRes.json();
        const priceData = await priceRes.json();
        
        if (Array.isArray(mobData)) setPhones(mobData);
        if (Array.isArray(brandData)) setBrands(brandData);
        if (Array.isArray(priceData)) setPriceRanges(priceData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const displayPhones = phones.length > 0 ? phones : MOCK_PHONES;

  // Grouping by price for sections (Simulating PKR for UI)
  const pkr50kPlus = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price > 500; // Mocking > 50k
  });
  
  const pkr40kTo50k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 500 && price > 400;
  });

  const pkr30kTo40k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 400 && price > 300;
  });

  const pkr20kTo30k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 300 && price > 200;
  });

  const pkrUnder10k = displayPhones.filter(p => {
    const price = parseInt(p.price.toString().replace(/,/g, ''));
    return price <= 100;
  });

  const comingSoon = displayPhones.slice(0, 4); // Mocking coming soon

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

            {/* Latest News Section */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2">
                <h2 className="text-sm font-bold text-[#1a3a5a] uppercase tracking-tight">Latest News</h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_POSTS.map(post => (
                  <a key={post.id} href={`/blog/${post.slug}`} className="group block border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={post.image} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Latest Mobile Phones Section */}
            <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#d32f2f] uppercase tracking-tight">Latest Mobile Phones & Prices</h2>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {displayPhones.slice(0, 6).map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
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
                          Rs. {parseInt(phone.price.toString().replace(/,/g, '')) * 200}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                )) : BRANDS.map(brand => (
                  <a key={brand} href={`/brand/${brand.toLowerCase()}`} className="px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors border-b last:border-0 border-muted/50 flex justify-between items-center group">
                    <span>{brand} Mobile</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
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
                  <>
                    <a href="#" className="px-3 py-1.5 hover:bg-muted border-b border-muted/50">Prices {'>'} $1000</a>
                    <a href="#" className="px-3 py-1.5 hover:bg-muted border-b border-muted/50">$800 - $1000</a>
                    <a href="#" className="px-3 py-1.5 hover:bg-muted border-b border-muted/50">$600 - $800</a>
                    <a href="#" className="px-3 py-1.5 hover:bg-muted border-b border-muted/50">$400 - $600</a>
                    <a href="#" className="px-3 py-1.5 hover:bg-muted border-b border-muted/50">$200 - $400</a>
                    <a href="#" className="px-3 py-1.5 hover:bg-muted">$100 - $200</a>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
