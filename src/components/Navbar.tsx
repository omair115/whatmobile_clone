import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, Smartphone, Newspaper, BarChart2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BRANDS } from '@/src/constants';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-[#1a3a5a] rounded-lg text-white group-hover:bg-[#2c4c6c] transition-colors">
              <Smartphone className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-[#1a3a5a]">
              MobiSpec<span className="text-muted-foreground text-xs lowercase">.com</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <a href="/" className="px-4 py-2 text-sm font-bold text-[#1a3a5a] hover:bg-muted rounded-md transition-colors">Home</a>
            <a href="/brands" className="px-4 py-2 text-sm font-bold text-[#1a3a5a] hover:bg-muted rounded-md transition-colors">Brands</a>
            <a href="/news" className="px-4 py-2 text-sm font-bold text-[#1a3a5a] hover:bg-muted rounded-md transition-colors">News</a>
            <a href="/compare" className="px-4 py-2 text-sm font-bold text-[#1a3a5a] hover:bg-muted rounded-md transition-colors">Compare</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex relative mr-2">
              <form onSubmit={handleSearch}>
                <Input 
                  placeholder="Search Mobile..." 
                  className="w-48 lg:w-64 h-9 text-xs rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-[#1a3a5a]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-9 w-9 rounded-full text-muted-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="outline" size="sm" className="hidden lg:flex border-[#1a3a5a] text-[#1a3a5a] hover:bg-[#1a3a5a] hover:text-white font-bold rounded-full">
              Login
            </Button>
            
            <a href="/admin">
              <Button size="icon" variant="ghost" className="text-muted-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="py-4 border-t md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Input 
                placeholder="Search phones, brands..." 
                className="w-full h-10 text-sm rounded-lg"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
