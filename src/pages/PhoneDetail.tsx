import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SEO } from '@/src/components/SEO';
import { Sidebar } from '@/src/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Camera, Battery, Cpu, HardDrive, Monitor, Share2, Heart, Scale, Star, Zap } from 'lucide-react';
import { Mobile } from '@/src/types';

// Mock Data (In a real app, fetch by slug)
const MOCK_PHONE: Mobile = {
  id: '1',
  name: 'Samsung Galaxy S25 Ultra',
  brand: 'Samsung',
  slug: 'samsung-galaxy-s25-ultra',
  price: '1,199',
  currency: '$',
  launchDate: 'Jan 2025',
  images: [
    'https://picsum.photos/seed/s25-1/800/800',
    'https://picsum.photos/seed/s25-2/800/800',
    'https://picsum.photos/seed/s25-3/800/800'
  ],
  category: 'flagship',
  specs: {
    display: '6.8" Dynamic AMOLED 2X, 120Hz, HDR10+, 2600 nits',
    camera: '200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultrawide',
    battery: '5000mAh, 45W Wired, 15W Wireless',
    processor: 'Qualcomm Snapdragon 8 Gen 4 (3nm)',
    ram: '12GB / 16GB LPDDR5X',
    storage: '256GB / 512GB / 1TB UFS 4.0',
    os: 'Android 15, One UI 7',
    dimensions: '162.3 x 79.0 x 8.6 mm',
    weight: '232g',
    build: 'Titanium Frame, Gorilla Glass Armor'
  },
  description: 'The Samsung Galaxy S25 Ultra is the pinnacle of mobile engineering, featuring a stunning 200MP camera system, the latest Snapdragon 8 Gen 4 processor, and a refined titanium design. With integrated S-Pen support and advanced AI capabilities, it is designed for power users who demand the best.',
  seoTitle: 'Samsung Galaxy S25 Ultra Full Specs, Price & Features',
  seoDescription: 'Detailed specifications of Samsung Galaxy S25 Ultra including 200MP camera, Snapdragon 8 Gen 4, 5000mAh battery and latest price.',
  features: ['S-Pen Support', '100x Space Zoom', 'Galaxy AI', 'IP68 Water Resistance', 'Titanium Build'],
  createdAt: new Date().toISOString()
};

export function PhoneDetail() {
  const { slug } = useParams();
  const [phone, setPhone] = useState<Mobile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/mobiles/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPhone(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading phone details...</p>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Phone not found.</p>
        <a href="/" className="text-primary hover:underline mt-4 inline-block">Go back home</a>
      </div>
    );
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": phone.name,
    "image": phone.images,
    "description": phone.description,
    "brand": {
      "@type": "Brand",
      "name": phone.brand
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": phone.price.toString().replace(',', ''),
      "availability": "https://schema.org/InStock"
    }
  };

  const pkrPrice = parseInt(phone.price.toString().replace(/,/g, '')) * 200;

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-12">
      <SEO 
        title={phone.seoTitle} 
        description={phone.seoDescription}
        ogImage={phone.images[0]}
        ogType="product"
        schema={productSchema}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-bold text-[#1a3a5a] mb-4 uppercase">
              <a href="/" className="hover:underline">Mobile Prices</a>
              <span>{">"}</span>
              <a href={`/brand/${phone.brand.toLowerCase()}`} className="hover:underline">{phone.brand} Mobiles</a>
              <span>{">"}</span>
              <span className="text-muted-foreground">{phone.name} Price in Pakistan</span>
            </nav>

            {/* Product Header Section */}
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left: Image */}
                <div className="md:col-span-4 flex flex-col items-center">
                  <h1 className="text-2xl font-black text-[#1a3a5a] mb-2 text-center">{phone.name}</h1>
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mb-4">
                    Rs. {pkrPrice.toLocaleString()} <br />
                    USD ${phone.price}
                  </div>
                  <div className="aspect-[3/4] w-full relative mb-6">
                    <img 
                      src={phone.images[0]} 
                      alt={phone.name} 
                      className="object-contain w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Right: Social/Follow Box & Info */}
                <div className="md:col-span-8 space-y-6">
                  {/* Mock Social Box */}
                  <div className="border rounded bg-[#f8f9fa] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#1a3a5a] rounded flex items-center justify-center text-white font-black text-xs">WM</div>
                      <div>
                        <p className="text-sm font-bold text-[#1a3a5a]">WhatMobile<span className="text-[10px] font-normal">.com.pk</span></p>
                        <p className="text-[10px] text-muted-foreground">1,066,776 followers</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-[#4267B2] hover:bg-[#365899] text-white rounded-none text-[10px] h-7">Follow</Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#f8f9fa] border-l-4 border-[#1a3a5a] p-3 text-xs leading-relaxed">
                      <p className="font-bold text-[#1a3a5a] mb-1">{phone.name} price in Pakistan</p>
                      <p>{phone.name} price in Pakistan is Rs. {pkrPrice.toLocaleString()}. Official dealers and warranty providers regulate the retail price of {phone.brand} mobile products in official warranty.</p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>Price of {phone.name} in Pakistan is Rs. {pkrPrice.toLocaleString()}.</li>
                        <li>Price of {phone.brand} in USD is ${phone.price}.</li>
                      </ul>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground italic">
                      {phone.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="text-[10px] h-8 bg-[#f8f9fa] border-[#1a3a5a]/20 text-[#1a3a5a] font-bold">
                      <Zap className="h-3 w-3 mr-1" /> Video Review
                    </Button>
                    <Button variant="outline" className="text-[10px] h-8 bg-[#f8f9fa] border-[#1a3a5a]/20 text-[#1a3a5a] font-bold">
                      <Scale className="h-3 w-3 mr-1" /> Compare
                    </Button>
                    <Button variant="outline" className="text-[10px] h-8 bg-[#f8f9fa] border-[#1a3a5a]/20 text-[#1a3a5a] font-bold">
                      <Monitor className="h-3 w-3 mr-1" /> Pictures
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Specifications Table */}
            <section className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#1a3a5a] text-white px-4 py-2 text-sm font-bold">
                {phone.name} detailed specifications
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody>
                    {/* Build Section */}
                    <tr className="bg-[#f8f9fa] border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Build</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">OS</th>
                            <td className="px-4 py-2">{phone.specs.os}</td>
                          </tr>
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Dimensions</th>
                            <td className="px-4 py-2">{phone.specs.dimensions || 'N/A'}</td>
                          </tr>
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Weight</th>
                            <td className="px-4 py-2">{phone.specs.weight || 'N/A'}</td>
                          </tr>
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Build</th>
                            <td className="px-4 py-2">{phone.specs.build || 'N/A'}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Processor Section */}
                    <tr className="border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Processor</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">CPU</th>
                            <td className="px-4 py-2">{phone.specs.processor}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Display Section */}
                    <tr className="bg-[#f8f9fa] border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Display</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Technology</th>
                            <td className="px-4 py-2">{phone.specs.display.split(',')[0]}</td>
                          </tr>
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Size</th>
                            <td className="px-4 py-2">{phone.specs.display.match(/\d+\.?\d*"/)?.[0] || 'N/A'}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Memory Section */}
                    <tr className="border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Memory</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Built-in</th>
                            <td className="px-4 py-2">{phone.specs.storage}, {phone.specs.ram}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Camera Section */}
                    <tr className="bg-[#f8f9fa] border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Camera</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Main</th>
                            <td className="px-4 py-2">{phone.specs.camera}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Battery Section */}
                    <tr className="border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Battery</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Capacity</th>
                            <td className="px-4 py-2">{phone.specs.battery}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    {/* Price Section */}
                    <tr className="bg-[#f8f9fa] border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Price</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Price in Rs.</th>
                            <td className="px-4 py-2 font-bold text-[#d32f2f]">Rs. {pkrPrice.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b last:border-0">
                            <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Price in USD</th>
                            <td className="px-4 py-2 font-bold text-[#d32f2f]">${phone.price}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
