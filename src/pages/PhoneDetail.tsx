import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SEO } from '@/src/components/SEO';
import { Sidebar } from '@/src/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Camera, Battery, Cpu, HardDrive, Monitor, Share2, Heart, Scale, Star, Zap, ChevronRight, Newspaper } from 'lucide-react';
import { Mobile, BlogPost } from '@/src/types';
import { motion } from 'motion/react';

export function PhoneDetail() {
  const { slug } = useParams();
  const [phone, setPhone] = useState<Mobile | null>(null);
  const [similarMobiles, setSimilarMobiles] = useState<Mobile[]>([]);
  const [brandMobiles, setBrandMobiles] = useState<Mobile[]>([]);
  const [brandNews, setBrandNews] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 800; // Roughly after the specs table
      setShowFilters(scrollY < threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/mobiles/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPhone(data);
          // Fetch additional data
          fetch(`/api/mobiles/${slug}/similar`).then(res => res.json()).then(setSimilarMobiles);
          fetch(`/api/mobiles/${slug}/brand-related`).then(res => res.json()).then(setBrandMobiles);
          fetch(`/api/posts/brand/${data.brand}`).then(res => res.json()).then(setBrandNews);
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

  const pkrPrice = phone.specs?.price?.pkr || phone.price.toLocaleString();
  const usdPrice = phone.specs?.price?.usd || (parseInt(phone.price.toString().replace(/,/g, '')) / 280).toFixed(0);

  const renderSpecRow = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <tr className="border-b last:border-0">
        <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">{label}</th>
        <td className="px-4 py-2">{value}</td>
      </tr>
    );
  };

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
          <div className="lg:col-span-8 space-y-6">
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
                  <div className="text-xs font-bold text-muted-foreground mb-4 text-center">
                    Rs. {pkrPrice} <br />
                    USD ${usdPrice}
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
                      <p>{phone.name} price in Pakistan is Rs. {pkrPrice}. Official dealers and warranty providers regulate the retail price of {phone.brand} mobile products in official warranty.</p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>Price of {phone.name} in Pakistan is Rs. {pkrPrice}.</li>
                        <li>Price of {phone.brand} in USD is ${usdPrice}.</li>
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
                    {phone.specs?.build && (
                      <tr className="bg-[#f8f9fa] border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Build</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("OS", phone.specs.build.os)}
                              {renderSpecRow("UI", phone.specs.build.ui)}
                              {renderSpecRow("Dimensions", phone.specs.build.dimensions)}
                              {renderSpecRow("Weight", phone.specs.build.weight)}
                              {renderSpecRow("SIM", phone.specs.build.sim)}
                              {renderSpecRow("Colors", phone.specs.build.colors)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Frequency Section */}
                    {phone.specs?.frequency && (
                      <tr className="border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Frequency</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("2G Band", phone.specs.frequency['2g'])}
                              {renderSpecRow("3G Band", phone.specs.frequency['3g'])}
                              {renderSpecRow("4G Band", phone.specs.frequency['4g'])}
                              {renderSpecRow("5G Band", phone.specs.frequency['5g'])}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Processor Section */}
                    {phone.specs?.processor && (
                      <tr className="bg-[#f8f9fa] border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Processor</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("CPU", phone.specs.processor.cpu)}
                              {renderSpecRow("Chipset", phone.specs.processor.chipset)}
                              {renderSpecRow("GPU", phone.specs.processor.gpu)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Display Section */}
                    {phone.specs?.display && typeof phone.specs.display === 'object' && (
                      <tr className="border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Display</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("Technology", phone.specs.display.technology)}
                              {renderSpecRow("Size", phone.specs.display.size)}
                              {renderSpecRow("Resolution", phone.specs.display.resolution)}
                              {renderSpecRow("Protection", phone.specs.display.protection)}
                              {renderSpecRow("Extra Features", phone.specs.display.extra)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Memory Section */}
                    {phone.specs?.memory && (
                      <tr className="bg-[#f8f9fa] border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Memory</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("Built-in", phone.specs.memory.builtin)}
                              {renderSpecRow("Card Slot", phone.specs.memory.card)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Camera Section */}
                    {phone.specs?.camera && typeof phone.specs.camera === 'object' && (
                      <tr className="border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Camera</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("Main", phone.specs.camera.main)}
                              {renderSpecRow("Features", phone.specs.camera.features)}
                              {renderSpecRow("Front", phone.specs.camera.front)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Connectivity Section */}
                    {phone.specs?.connectivity && (
                      <tr className="bg-[#f8f9fa] border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Connectivity</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("WLAN", phone.specs.connectivity.wlan)}
                              {renderSpecRow("Bluetooth", phone.specs.connectivity.bluetooth)}
                              {renderSpecRow("GPS", phone.specs.connectivity.gps)}
                              {renderSpecRow("Radio", phone.specs.connectivity.radio)}
                              {renderSpecRow("USB", phone.specs.connectivity.usb)}
                              {renderSpecRow("NFC", phone.specs.connectivity.nfc)}
                              {renderSpecRow("Infrared", phone.specs.connectivity.infrared)}
                              {renderSpecRow("Data", phone.specs.connectivity.data)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Features Section */}
                    {phone.specs?.features && typeof phone.specs.features === 'object' && !Array.isArray(phone.specs.features) && (
                      <tr className="border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Features</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("Sensors", phone.specs.features.sensors)}
                              {renderSpecRow("Audio", phone.specs.features.audio)}
                              {renderSpecRow("Browser", phone.specs.features.browser)}
                              {renderSpecRow("Messaging", phone.specs.features.messaging)}
                              {renderSpecRow("Games", phone.specs.features.games)}
                              {renderSpecRow("Torch", phone.specs.features.torch)}
                              {renderSpecRow("Extra", phone.specs.features.extra)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Battery Section */}
                    {phone.specs?.battery && typeof phone.specs.battery === 'object' && (
                      <tr className="bg-[#f8f9fa] border-b">
                        <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Battery</th>
                        <td className="p-0 w-3/4">
                          <table className="w-full border-collapse">
                            <tbody>
                              {renderSpecRow("Capacity", phone.specs.battery.capacity)}
                              {renderSpecRow("Extra", phone.specs.battery.extra)}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Price Section */}
                    <tr className="border-b">
                      <th className="px-4 py-3 font-bold text-[#1a3a5a] w-1/4 align-top">Price</th>
                      <td className="p-0 w-3/4">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="border-b last:border-0">
                              <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Price in Rs.</th>
                              <td className="px-4 py-2 font-bold text-[#d32f2f]">Rs. {pkrPrice}</td>
                            </tr>
                            <tr className="border-b last:border-0">
                              <th className="px-4 py-2 font-bold w-1/3 text-muted-foreground">Price in USD</th>
                              <td className="px-4 py-2 font-bold text-[#d32f2f]">${usdPrice}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="bg-white border rounded-lg p-4 text-[10px] text-muted-foreground leading-relaxed">
              <p className="font-bold mb-2">Disclaimer.</p>
              <p>{phone.brand} {phone.name} price in Pakistan is updated daily from the price list provided by local shops and dealers but we can not guarantee that the information / price / {phone.name} Prices on this page is 100% correct (Human error is possible), always visit your local shop for exact cell phone cost & rate. {phone.brand} {phone.name} price Pakistan.</p>
            </div>

            {/* Similar Phones Section */}
            {similarMobiles.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-black text-[#1a3a5a] uppercase">Similar Phones</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {similarMobiles.map((m) => (
                    <a key={m.id} href={`/phone/${m.slug}`} className="bg-white border rounded hover:shadow-md transition-shadow p-3 flex flex-col items-center group">
                      <div className="aspect-[3/4] w-full relative mb-2 overflow-hidden">
                        <img 
                          src={m.images[0]} 
                          alt={m.name} 
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-[10px] font-bold text-center text-[#1a3a5a] group-hover:underline line-clamp-1">{m.name}</h3>
                      <p className="text-[10px] text-[#d32f2f] font-bold">Rs. {m.price}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* More From Brand Section */}
            {brandMobiles.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-black text-[#1a3a5a] uppercase">More {phone.brand} Mobiles</h2>
                  <a href={`/brand/${phone.brand.toLowerCase()}`} className="text-[10px] font-bold text-[#1a3a5a] hover:underline flex items-center">
                    View All <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {brandMobiles.map((m) => (
                    <a key={m.id} href={`/phone/${m.slug}`} className="bg-white border rounded hover:shadow-md transition-shadow p-3 flex flex-col items-center group">
                      <div className="aspect-[3/4] w-full relative mb-2 overflow-hidden">
                        <img 
                          src={m.images[0]} 
                          alt={m.name} 
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-[10px] font-bold text-center text-[#1a3a5a] group-hover:underline line-clamp-1">{m.name}</h3>
                      <p className="text-[10px] text-[#d32f2f] font-bold">Rs. {m.price}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Brand News Section */}
            {brandNews.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-black text-[#1a3a5a] uppercase">{phone.brand} Latest News</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandNews.map((post) => (
                    <a key={post.id} href={`/blog/${post.slug}`} className="bg-white border rounded overflow-hidden flex gap-3 p-3 hover:shadow-md transition-shadow group">
                      <div className="w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-[11px] font-bold text-[#1a3a5a] line-clamp-2 leading-tight group-hover:underline">{post.title}</h3>
                        <p className="text-[9px] text-muted-foreground mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <Sidebar showPriceFilters={showFilters} showFeatureFilters={showFilters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
