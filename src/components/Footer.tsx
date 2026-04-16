import { Smartphone, Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { BRANDS } from '@/src/constants';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">MobiSpec</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate destination for the latest mobile phone specifications, prices, and expert reviews. Stay updated with the fast-moving mobile world.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="/brands" className="text-muted-foreground hover:text-primary transition-colors">All Brands</a></li>
              <li><a href="/news" className="text-muted-foreground hover:text-primary transition-colors">Mobile News</a></li>
              <li><a href="/compare" className="text-muted-foreground hover:text-primary transition-colors">Compare Phones</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h3 className="font-semibold mb-4">Popular Brands</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {BRANDS.slice(0, 8).map(brand => (
                <li key={brand}>
                  <a href={`/brand/${brand.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {brand}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to get the latest mobile launches and news directly in your inbox.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MobiSpec. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
