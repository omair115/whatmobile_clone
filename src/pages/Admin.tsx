import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, RefreshCw, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, LogOut, Smartphone, FileText, Settings, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { Mobile, BlogPost, Brand, PriceRange, Network, RamOption, ScreenSize, MobileFeature, OsOption, GalleryImage } from '@/src/types';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [mobiles, setMobiles] = useState<Mobile[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [ramOptions, setRamOptions] = useState<RamOption[]>([]);
  const [screenSizes, setScreenSizes] = useState<ScreenSize[]>([]);
  const [mobileFeatures, setMobileFeatures] = useState<MobileFeature[]>([]);
  const [osOptions, setOsOptions] = useState<OsOption[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const [editingMobile, setEditingMobile] = useState<Partial<Mobile> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);
  const [editingPriceRange, setEditingPriceRange] = useState<Partial<PriceRange> | null>(null);
  const [editingNetwork, setEditingNetwork] = useState<Partial<Network> | null>(null);
  const [editingRam, setEditingRam] = useState<Partial<RamOption> | null>(null);
  const [editingScreen, setEditingScreen] = useState<Partial<ScreenSize> | null>(null);
  const [editingFeature, setEditingFeature] = useState<Partial<MobileFeature> | null>(null);
  const [editingOS, setEditingOS] = useState<Partial<OsOption> | null>(null);
  const [imageForm, setImageForm] = useState({ description: '', altText: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
    if (token) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [mobRes, postRes, brandRes, priceRes, netRes, ramRes, screenRes, featRes, osRes, imgRes] = await Promise.all([
        fetch('/api/mobiles'),
        fetch('/api/posts'),
        fetch('/api/brands'),
        fetch('/api/price-ranges'),
        fetch('/api/networks'),
        fetch('/api/ram-options'),
        fetch('/api/screen-sizes'),
        fetch('/api/mobile-features'),
        fetch('/api/os-options'),
        fetch('/api/images')
      ]);
      const [mobData, postData, brandData, priceData, netData, ramData, screenData, featData, osData, imgData] = await Promise.all([
        mobRes.json(),
        postRes.json(),
        brandRes.json(),
        priceRes.json(),
        netRes.json(),
        ramRes.json(),
        screenRes.json(),
        featRes.json(),
        osRes.json(),
        imgRes.json()
      ]);

      if (Array.isArray(mobData)) setMobiles(mobData);
      if (Array.isArray(postData)) setPosts(postData);
      if (Array.isArray(brandData)) setBrands(brandData);
      if (Array.isArray(priceData)) setPriceRanges(priceData);
      if (Array.isArray(netData)) setNetworks(netData);
      if (Array.isArray(ramData)) setRamOptions(ramData);
      if (Array.isArray(screenData)) setScreenSizes(screenData);
      if (Array.isArray(featData)) setMobileFeatures(featData);
      if (Array.isArray(osData)) setOsOptions(osData);
      if (Array.isArray(imgData)) setGalleryImages(imgData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError(data.error);
      }
    } catch (err) {
      setLoginError("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('description', imageForm.description);
    formData.append('altText', imageForm.altText);

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSelectedFile(null);
        setImageForm({ description: '', altText: '' });
        fetchData();
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = `${window.location.protocol}//${window.location.host}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopyStatus(url);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    setLogs([]);
    addLog("Starting automated sync...");

    try {
      addLog("Fetching latest mobile launches from AI source...");
      const launchesRes = await fetch('/api/ai/latest-launches');
      const launches = await launchesRes.json();
      
      if (!Array.isArray(launches)) throw new Error("Failed to fetch launches");

      addLog(`Found ${launches.length} potential new launches: ${launches.join(', ')}`);

      for (const mobile of launches) {
        addLog(`Generating detailed content for ${mobile}...`);
        const genRes = await fetch('/api/ai/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileName: mobile })
        });
        const data = await genRes.json();

        if (data && !data.error) {
          addLog(`Successfully generated content for ${mobile}. Slug: ${data.slug}`);
          addLog(`Saving ${mobile} to database...`);
          const response = await fetch('/api/mobiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              brand: mobile.split(' ')[0],
              images: [`https://picsum.photos/seed/${data.slug}/800/800`],
              launchDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              currency: '$',
              category: data.price > 600 ? 'flagship' : data.price > 200 ? 'mid-range' : 'budget',
              features: ['AI Features', 'Fast Charging']
            })
          });

          if (response.ok) {
            addLog(`Successfully saved ${mobile} to database.`);
          } else {
            const err = await response.json();
            addLog(`Failed to save ${mobile}: ${err.error}`);
          }
        } else {
          addLog(`Failed to generate content for ${mobile}.`);
        }
      }

      setSyncStatus('success');
      addLog("Sync completed successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
      addLog("Error during sync process.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteMobile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mobile?")) return;
    try {
      const res = await fetch(`/api/mobiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMobiles(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    const isNew = !editingBrand.id;
    const url = isNew ? '/api/brands' : `/api/brands/${editingBrand.id}`;
    const method = isNew ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBrand)
      });
      if (res.ok) {
        setEditingBrand(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePriceRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceRange) return;
    const isNew = !editingPriceRange.id;
    const url = isNew ? '/api/price-ranges' : `/api/price-ranges/${editingPriceRange.id}`;
    const method = isNew ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPriceRange)
      });
      if (res.ok) {
        setEditingPriceRange(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePriceRange = async (id: string) => {
    if (!confirm("Delete this price range?")) return;
    try {
      await fetch(`/api/price-ranges/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAttribute = async (type: string, data: any, setEditing: (val: any) => void) => {
    const isNew = !data.id;
    const url = isNew ? `/api/${type}` : `/api/${type}/${data.id}`;
    const method = isNew ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setEditing(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttribute = async (type: string, id: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMobile) return;
    const isNew = !editingMobile.id;
    const url = isNew ? '/api/mobiles' : `/api/mobiles/${editingMobile.id}`;
    const method = isNew ? 'POST' : 'PUT';

    // Ensure all fields have at least default values to avoid backend errors
    const payload = {
      ...editingMobile,
      currency: editingMobile.currency || 'Rs.',
      launchDate: editingMobile.launchDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      images: Array.isArray(editingMobile.images) ? editingMobile.images : [],
      specs: editingMobile.specs || {},
      features: Array.isArray(editingMobile.features) ? editingMobile.features : [],
      category: editingMobile.category || 'mid-range',
      seoTitle: editingMobile.seoTitle || `${editingMobile.name} Price in Pakistan & Specs`,
      seoDescription: editingMobile.seoDescription || `Check out ${editingMobile.name} price in Pakistan and full specifications.`
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingMobile(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save mobile. Check console for details.");
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    const isNew = !editingPost.id;
    const url = isNew ? '/api/posts' : `/api/posts/${editingPost.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...editingPost,
      author: editingPost.author || 'Admin',
      tags: Array.isArray(editingPost.tags) ? editingPost.tags : [],
      seoTitle: editingPost.seoTitle || editingPost.title,
      seoDescription: editingPost.seoDescription || editingPost.content?.substring(0, 160)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingPost(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save post.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black uppercase">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to manage the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              {loginError && <p className="text-xs text-destructive font-medium">{loginError}</p>}
              <Button type="submit" className="w-full font-bold uppercase">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Admin Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-black uppercase tracking-tight">Admin Dashboard</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="mobiles" className="space-y-6">
          <TabsList className="grid grid-cols-7 max-w-4xl mx-auto">
            <TabsTrigger value="mobiles" className="font-bold uppercase text-[10px]"><Smartphone className="h-3 w-3 mr-1" /> Mobiles</TabsTrigger>
            <TabsTrigger value="posts" className="font-bold uppercase text-[10px]"><FileText className="h-3 w-3 mr-1" /> Posts</TabsTrigger>
            <TabsTrigger value="brands" className="font-bold uppercase text-[10px]"><Smartphone className="h-3 w-3 mr-1" /> Brands</TabsTrigger>
            <TabsTrigger value="gallery" className="font-bold uppercase text-[10px]"><ImageIcon className="h-3 w-3 mr-1" /> Gallery</TabsTrigger>
            <TabsTrigger value="prices" className="font-bold uppercase text-[10px]"><Zap className="h-3 w-3 mr-1" /> Prices</TabsTrigger>
            <TabsTrigger value="attributes" className="font-bold uppercase text-[10px]"><Settings className="h-3 w-3 mr-1" /> Attributes</TabsTrigger>
            <TabsTrigger value="automation" className="font-bold uppercase text-[10px]"><RefreshCw className="h-3 w-3 mr-1" /> AI Sync</TabsTrigger>
          </TabsList>

          {/* Mobiles Management */}
          <TabsContent value="mobiles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3a5a]">Manage Mobile Phones</h2>
              <Button size="sm" onClick={() => setEditingMobile({
                name: '',
                brand: '',
                slug: '',
                price: '',
                currency: 'Rs.',
                category: 'mid-range',
                images: [],
                features: [],
                specs: {
                  build: { os: '', ui: '', dimensions: '', weight: '', sim: '', colors: '' },
                  frequency: { '2g': '', '3g': '', '4g': '', '5g': '' },
                  processor: { cpu: '', chipset: '', gpu: '' },
                  display: { technology: '', size: '', resolution: '', protection: '', extra: '' },
                  memory: { builtin: '', card: '' },
                  camera: { main: '', features: '', front: '' },
                  connectivity: { wlan: '', bluetooth: '', gps: '', radio: '', usb: '', nfc: '', infrared: '', data: '' },
                  features: { sensors: '', audio: '', browser: '', messaging: '', games: '', torch: '', extra: '' },
                  battery: { capacity: '', extra: '' },
                  price: { pkr: '', usd: '' }
                }
              })}>
                <Plus className="h-4 w-4 mr-2" /> Add New Mobile
              </Button>
            </div>

            {editingMobile && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm uppercase">{editingMobile.id ? 'Edit Mobile' : 'Add New Mobile'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveMobile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mobile Name</Label>
                        <Input 
                          value={editingMobile.name} 
                          onChange={e => {
                            const name = e.target.value;
                            const slug = slugify(name);
                            setEditingMobile({...editingMobile, name, slug});
                          }} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editingMobile.brand} 
                          onChange={e => setEditingMobile({...editingMobile, brand: e.target.value})}
                          required
                        >
                          <option value="">Select Brand</option>
                          {brands.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={editingMobile.slug} onChange={e => setEditingMobile({...editingMobile, slug: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (Numeric Display)</Label>
                        <Input value={editingMobile.price} onChange={e => setEditingMobile({...editingMobile, price: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editingMobile.category || 'mid-range'} 
                          onChange={e => setEditingMobile({...editingMobile, category: e.target.value as any})}
                        >
                          <option value="budget">Budget</option>
                          <option value="mid-range">Mid-Range</option>
                          <option value="flagship">Flagship</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Network</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={(editingMobile as any).network || ''} 
                          onChange={e => setEditingMobile({...editingMobile, network: e.target.value} as any)}
                        >
                          <option value="">Select Network</option>
                          {networks.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>RAM</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={(editingMobile as any).ram || ''} 
                          onChange={e => setEditingMobile({...editingMobile, ram: e.target.value} as any)}
                        >
                          <option value="">Select RAM</option>
                          {ramOptions.map(r => <option key={r.id} value={r.label}>{r.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Screen Size</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={(editingMobile as any).screen_size || ''} 
                          onChange={e => setEditingMobile({...editingMobile, screen_size: e.target.value} as any)}
                        >
                          <option value="">Select Screen Size</option>
                          {screenSizes.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Operating System (OS)</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={(editingMobile as any).os || ''} 
                          onChange={e => setEditingMobile({...editingMobile, os: e.target.value} as any)}
                        >
                          <option value="">Select OS</option>
                          {osOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* BUILD SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Build</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>OS</Label>
                          <Input value={editingMobile.specs?.build?.os || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, build: {...editingMobile.specs!.build, os: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>UI</Label>
                          <Input value={editingMobile.specs?.build?.ui || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, build: {...editingMobile.specs!.build, ui: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Dimensions</Label>
                          <Input value={editingMobile.specs?.build?.dimensions || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, build: {...editingMobile.specs!.build, dimensions: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Weight</Label>
                          <Input value={editingMobile.specs?.build?.weight || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, build: {...editingMobile.specs!.build, weight: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>SIM</Label>
                          <Input value={editingMobile.specs?.build?.sim || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, build: {...editingMobile.specs!.build, sim: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Colors</Label>
                          <Input value={editingMobile.specs?.build?.colors || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, build: {...editingMobile.specs!.build, colors: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* FREQUENCY SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Frequency</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>2G Band</Label>
                          <Input value={editingMobile.specs?.frequency?.['2g'] || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, frequency: {...editingMobile.specs!.frequency, '2g': e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>3G Band</Label>
                          <Input value={editingMobile.specs?.frequency?.['3g'] || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, frequency: {...editingMobile.specs!.frequency, '3g': e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>4G Band</Label>
                          <Input value={editingMobile.specs?.frequency?.['4g'] || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, frequency: {...editingMobile.specs!.frequency, '4g': e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>5G Band</Label>
                          <Input value={editingMobile.specs?.frequency?.['5g'] || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, frequency: {...editingMobile.specs!.frequency, '5g': e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* PROCESSOR SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Processor</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>CPU</Label>
                          <Input value={editingMobile.specs?.processor?.cpu || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, processor: {...editingMobile.specs!.processor, cpu: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Chipset</Label>
                          <Input value={editingMobile.specs?.processor?.chipset || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, processor: {...editingMobile.specs!.processor, chipset: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>GPU</Label>
                          <Input value={editingMobile.specs?.processor?.gpu || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, processor: {...editingMobile.specs!.processor, gpu: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* DISPLAY SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Display</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Technology</Label>
                          <Input value={editingMobile.specs?.display?.technology || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, display: {...editingMobile.specs!.display, technology: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Input value={editingMobile.specs?.display?.size || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, display: {...editingMobile.specs!.display, size: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Resolution</Label>
                          <Input value={editingMobile.specs?.display?.resolution || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, display: {...editingMobile.specs!.display, resolution: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Protection</Label>
                          <Input value={editingMobile.specs?.display?.protection || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, display: {...editingMobile.specs!.display, protection: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Extra Features</Label>
                          <Input value={editingMobile.specs?.display?.extra || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, display: {...editingMobile.specs!.display, extra: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* MEMORY SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Memory</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Built-in</Label>
                          <Input value={editingMobile.specs?.memory?.builtin || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, memory: {...editingMobile.specs!.memory, builtin: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Card Slot</Label>
                          <Input value={editingMobile.specs?.memory?.card || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, memory: {...editingMobile.specs!.memory, card: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* CAMERA SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Camera</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Main Camera</Label>
                          <Input value={editingMobile.specs?.camera?.main || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, camera: {...editingMobile.specs!.camera, main: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Features</Label>
                          <Input value={editingMobile.specs?.camera?.features || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, camera: {...editingMobile.specs!.camera, features: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Front Camera</Label>
                          <Input value={editingMobile.specs?.camera?.front || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, camera: {...editingMobile.specs!.camera, front: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* CONNECTIVITY SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Connectivity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>WLAN</Label>
                          <Input value={editingMobile.specs?.connectivity?.wlan || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, wlan: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Bluetooth</Label>
                          <Input value={editingMobile.specs?.connectivity?.bluetooth || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, bluetooth: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>GPS</Label>
                          <Input value={editingMobile.specs?.connectivity?.gps || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, gps: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Radio</Label>
                          <Input value={editingMobile.specs?.connectivity?.radio || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, radio: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>USB</Label>
                          <Input value={editingMobile.specs?.connectivity?.usb || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, usb: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>NFC</Label>
                          <Input value={editingMobile.specs?.connectivity?.nfc || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, nfc: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Infrared</Label>
                          <Input value={editingMobile.specs?.connectivity?.infrared || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, infrared: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Data</Label>
                          <Input value={editingMobile.specs?.connectivity?.data || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, connectivity: {...editingMobile.specs!.connectivity, data: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* FEATURES SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Sensors</Label>
                          <Input value={editingMobile.specs?.features?.sensors || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, sensors: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Audio</Label>
                          <Input value={editingMobile.specs?.features?.audio || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, audio: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Browser</Label>
                          <Input value={editingMobile.specs?.features?.browser || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, browser: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Messaging</Label>
                          <Input value={editingMobile.specs?.features?.messaging || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, messaging: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Games</Label>
                          <Input value={editingMobile.specs?.features?.games || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, games: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Torch</Label>
                          <Input value={editingMobile.specs?.features?.torch || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, torch: e.target.value}}})} />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <Label>Extra Features</Label>
                          <Textarea value={editingMobile.specs?.features?.extra || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, features: {...editingMobile.specs!.features, extra: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* BATTERY SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Battery</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Capacity</Label>
                          <Input value={editingMobile.specs?.battery?.capacity || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, battery: {...editingMobile.specs!.battery, capacity: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Extra (Charging, etc.)</Label>
                          <Input value={editingMobile.specs?.battery?.extra || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, battery: {...editingMobile.specs!.battery, extra: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    {/* PRICE SECTION */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase text-primary">Price Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price in Rs.</Label>
                          <Input value={editingMobile.specs?.price?.pkr || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, price: {...editingMobile.specs!.price, pkr: e.target.value}}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Price in USD</Label>
                          <Input value={editingMobile.specs?.price?.usd || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...editingMobile.specs!, price: {...editingMobile.specs!.price, usd: e.target.value}}})} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase">Media & SEO</h3>
                      <div className="space-y-2">
                        <Label>Image URLs (Comma separated)</Label>
                        <Input 
                          value={editingMobile.images?.join(', ') || ''} 
                          onChange={e => setEditingMobile({...editingMobile, images: e.target.value.split(',').map(s => s.trim())})} 
                          placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SEO Title</Label>
                        <Input value={editingMobile.seoTitle || ''} onChange={e => setEditingMobile({...editingMobile, seoTitle: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>SEO Description</Label>
                        <Textarea value={editingMobile.seoDescription || ''} onChange={e => setEditingMobile({...editingMobile, seoDescription: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Main Description</Label>
                        <Textarea className="h-32" value={editingMobile.description} onChange={e => setEditingMobile({...editingMobile, description: e.target.value})} />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button type="submit" size="sm" className="font-bold">Save Mobile</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingMobile(null)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Brand</th>
                    <th className="px-4 py-3 font-bold">Price</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mobiles.map(mobile => (
                    <tr key={mobile.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{mobile.name}</td>
                      <td className="px-4 py-3">{mobile.brand}</td>
                      <td className="px-4 py-3">{mobile.currency}{mobile.price}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingMobile(mobile)} className="h-8 w-8 text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMobile(mobile.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Posts Management */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3a5a]">Manage Blog Posts</h2>
              <Button size="sm" onClick={() => setEditingPost({ title: '', slug: '', content: '', author: 'Admin', tags: [] })}>
                <Plus className="h-4 w-4 mr-2" /> Add New Post
              </Button>
            </div>

            {editingPost && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm uppercase">{editingPost.id ? 'Edit Post' : 'Add New Post'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSavePost} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Post Title</Label>
                        <Input 
                          value={editingPost.title} 
                          onChange={e => {
                            const title = e.target.value;
                            const slug = slugify(title);
                            setEditingPost({...editingPost, title, slug});
                          }} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={editingPost.slug} onChange={e => setEditingPost({...editingPost, slug: e.target.value})} required />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label>Content (Markdown)</Label>
                      <Textarea className="h-40" value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Associated Brand (Optional)</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editingPost.brand_id || ''}
                        onChange={(e) => {
                          const brandId = e.target.value;
                          const brandObj = brands.find(b => b.slug === brandId);
                          setEditingPost({
                            ...editingPost, 
                            brand_id: brandId || undefined,
                            brand: brandObj ? brandObj.name : undefined
                          });
                        }}
                      >
                        <option value="">No Brand Association</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.slug}>{brand.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-muted-foreground">Select a brand to show this post in that brand's news section on phone detail pages.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save Post</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPost(null)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold">Title</th>
                    <th className="px-4 py-3 font-bold">Author</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium line-clamp-1">{post.title}</td>
                      <td className="px-4 py-3">{post.author}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)} className="h-8 w-8 text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Brands Management */}
          <TabsContent value="brands" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3a5a]">Manage Brands</h2>
              <Button size="sm" onClick={() => setEditingBrand({ name: '', slug: '', logo: '', description: '' })}>
                <Plus className="h-4 w-4 mr-2" /> Add New Brand
              </Button>
            </div>

            {editingBrand && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm uppercase">{editingBrand.id ? 'Edit Brand' : 'Add New Brand'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveBrand} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Brand Name</Label>
                        <Input value={editingBrand.name} onChange={e => setEditingBrand({...editingBrand, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={editingBrand.slug} onChange={e => setEditingBrand({...editingBrand, slug: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input value={editingBrand.logo} onChange={e => setEditingBrand({...editingBrand, logo: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={editingBrand.description} onChange={e => setEditingBrand({...editingBrand, description: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save Brand</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingBrand(null)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Slug</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {brands.map(brand => (
                    <tr key={brand.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{brand.name}</td>
                      <td className="px-4 py-3">{brand.slug}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingBrand(brand)} className="h-8 w-8 text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Gallery Management */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3a5a]">Image Gallery</h2>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm uppercase">Upload New Image</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadImage} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Select Image</Label>
                      <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alt Text</Label>
                      <Input 
                        placeholder="Image accessibility description" 
                        value={imageForm.altText} 
                        onChange={e => setImageForm({...imageForm, altText: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Brief notes about this image" 
                      value={imageForm.description} 
                      onChange={e => setImageForm({...imageForm, description: e.target.value})} 
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={isUploading}>
                    {isUploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Upload Image
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map(img => (
                <Card key={img.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted/30 relative">
                    <img 
                      src={img.url} 
                      alt={img.altText} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => copyToClipboard(img.url)} title="Copy Link">
                        {copyStatus === img.url ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteImage(img.id)} title="Delete Image">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 text-[10px] space-y-1">
                    <p className="font-bold truncate" title={img.fileName}>{img.fileName}</p>
                    <p className="text-muted-foreground truncate">{img.description || 'No description'}</p>
                  </div>
                </Card>
              ))}
            </div>
            {galleryImages.length === 0 && (
              <div className="text-center py-12 bg-white border rounded-lg">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No images in gallery yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Price Ranges Management */}
          <TabsContent value="prices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3a5a]">Manage Price Ranges</h2>
              <Button size="sm" onClick={() => setEditingPriceRange({ label: '', minPrice: 0, maxPrice: 100000, currency: 'Rs.' })}>
                <Plus className="h-4 w-4 mr-2" /> Add New Range
              </Button>
            </div>

            {editingPriceRange && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm uppercase">{editingPriceRange.id ? 'Edit Price Range' : 'Add New Price Range'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSavePriceRange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Label (e.g. 30k - 40k)</Label>
                        <Input value={editingPriceRange.label} onChange={e => setEditingPriceRange({...editingPriceRange, label: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input value={editingPriceRange.currency} onChange={e => setEditingPriceRange({...editingPriceRange, currency: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Price</Label>
                        <Input type="number" value={editingPriceRange.minPrice} onChange={e => setEditingPriceRange({...editingPriceRange, minPrice: parseInt(e.target.value)})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Price</Label>
                        <Input type="number" value={editingPriceRange.maxPrice} onChange={e => setEditingPriceRange({...editingPriceRange, maxPrice: parseInt(e.target.value)})} required />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save Range</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPriceRange(null)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold">Label</th>
                    <th className="px-4 py-3 font-bold">Range</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {priceRanges.map(range => (
                    <tr key={range.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{range.label}</td>
                      <td className="px-4 py-3">{range.currency} {range.minPrice} - {range.maxPrice}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingPriceRange(range)} className="h-8 w-8 text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePriceRange(range.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ATTRIBUTES MANAGEMENT */}
          <TabsContent value="attributes" className="space-y-6">
            <h2 className="text-xl font-bold text-[#1a3a5a]">Manage Search Categories</h2>
            <Tabs defaultValue="networks">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger value="networks" className="data-[state=active]:bg-primary data-[state=active]:text-white border">Networks</TabsTrigger>
                <TabsTrigger value="ram" className="data-[state=active]:bg-primary data-[state=active]:text-white border">RAM</TabsTrigger>
                <TabsTrigger value="screen" className="data-[state=active]:bg-primary data-[state=active]:text-white border">Screen Sizes</TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-white border">Features (Cam)</TabsTrigger>
                <TabsTrigger value="os" className="data-[state=active]:bg-primary data-[state=active]:text-white border">OS</TabsTrigger>
              </TabsList>

              {/* Networks Subtab */}
              <TabsContent value="networks" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Networks</h3>
                  <Button size="sm" onClick={() => setEditingNetwork({ name: '', slug: '' })}><Plus className="h-4 w-4 mr-1" /> Add Network</Button>
                </div>
                {editingNetwork && (
                  <Card p-4 className="space-y-2 p-4">
                    <Label>Name</Label>
                    <Input value={editingNetwork.name} onChange={e => setEditingNetwork({...editingNetwork, name: e.target.value})} />
                    <Label>Slug</Label>
                    <Input value={editingNetwork.slug} onChange={e => setEditingNetwork({...editingNetwork, slug: e.target.value})} />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleSaveAttribute('networks', editingNetwork, setEditingNetwork)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNetwork(null)}>Cancel</Button>
                    </div>
                  </Card>
                )}
                <div className="bg-white border rounded">
                  {networks.map(n => (
                    <div key={n.id} className="flex justify-between p-2 border-b last:border-0 items-center">
                      <span>{n.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttribute('networks', n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* RAM Subtab */}
              <TabsContent value="ram" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">RAM Options</h3>
                  <Button size="sm" onClick={() => setEditingRam({ label: '', slug: '' })}><Plus className="h-4 w-4 mr-1" /> Add RAM</Button>
                </div>
                {editingRam && (
                  <Card className="p-4 space-y-2">
                    <Label>Label</Label>
                    <Input value={editingRam.label} onChange={e => setEditingRam({...editingRam, label: e.target.value})} />
                    <Label>Slug</Label>
                    <Input value={editingRam.slug} onChange={e => setEditingRam({...editingRam, slug: e.target.value})} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveAttribute('ram-options', editingRam, setEditingRam)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingRam(null)}>Cancel</Button>
                    </div>
                  </Card>
                )}
                <div className="bg-white border rounded">
                  {ramOptions.map(r => (
                    <div key={r.id} className="flex justify-between p-2 border-b last:border-0 items-center">
                      <span>{r.label}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttribute('ram-options', r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Screen Subtab */}
              <TabsContent value="screen" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Screen Sizes</h3>
                  <Button size="sm" onClick={() => setEditingScreen({ label: '', slug: '' })}><Plus className="h-4 w-4 mr-1" /> Add Screen</Button>
                </div>
                {editingScreen && (
                  <Card className="p-4 space-y-2">
                    <Label>Label</Label>
                    <Input value={editingScreen.label} onChange={e => setEditingScreen({...editingScreen, label: e.target.value})} />
                    <Label>Slug</Label>
                    <Input value={editingScreen.slug} onChange={e => setEditingScreen({...editingScreen, slug: e.target.value})} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveAttribute('screen-sizes', editingScreen, setEditingScreen)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingScreen(null)}>Cancel</Button>
                    </div>
                  </Card>
                )}
                <div className="bg-white border rounded">
                  {screenSizes.map(s => (
                    <div key={s.id} className="flex justify-between p-2 border-b last:border-0 items-center">
                      <span>{s.label}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttribute('screen-sizes', s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Features Subtab */}
              <TabsContent value="features" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Mobile Features</h3>
                  <Button size="sm" onClick={() => setEditingFeature({ label: '', slug: '' })}><Plus className="h-4 w-4 mr-1" /> Add Feature</Button>
                </div>
                {editingFeature && (
                  <Card className="p-4 space-y-2">
                    <Label>Label</Label>
                    <Input value={editingFeature.label} onChange={e => setEditingFeature({...editingFeature, label: e.target.value})} />
                    <Label>Slug</Label>
                    <Input value={editingFeature.slug} onChange={e => setEditingFeature({...editingFeature, slug: e.target.value})} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveAttribute('mobile-features', editingFeature, setEditingFeature)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingFeature(null)}>Cancel</Button>
                    </div>
                  </Card>
                )}
                <div className="bg-white border rounded">
                  {mobileFeatures.map(f => (
                    <div key={f.id} className="flex justify-between p-2 border-b last:border-0 items-center">
                      <span>{f.label}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttribute('mobile-features', f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* OS Subtab */}
              <TabsContent value="os" className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">OS Options</h3>
                  <Button size="sm" onClick={() => setEditingOS({ name: '', slug: '' })}><Plus className="h-4 w-4 mr-1" /> Add OS</Button>
                </div>
                {editingOS && (
                  <Card className="p-4 space-y-2">
                    <Label>Name</Label>
                    <Input value={editingOS.name} onChange={e => setEditingOS({...editingOS, name: e.target.value})} />
                    <Label>Slug</Label>
                    <Input value={editingOS.slug} onChange={e => setEditingOS({...editingOS, slug: e.target.value})} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveAttribute('os-options', editingOS, setEditingOS)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingOS(null)}>Cancel</Button>
                    </div>
                  </Card>
                )}
                <div className="bg-white border rounded">
                  {osOptions.map(o => (
                    <div key={o.id} className="flex justify-between p-2 border-b last:border-0 items-center">
                      <span>{o.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttribute('os-options', o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    AI Content Automation
                  </CardTitle>
                  <CardDescription>
                    Automatically fetch new mobile launches and generate blog posts using Gemini AI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button onClick={handleSync} disabled={isSyncing} className="rounded-full px-8">
                      {isSyncing ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                      ) : (
                        <><RefreshCw className="h-4 w-4 mr-2" /> Start Auto-Sync</>
                      )}
                    </Button>
                    {syncStatus === 'success' && <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Sync Complete</Badge>}
                    {syncStatus === 'error' && <Badge variant="destructive">Sync Failed</Badge>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    Database Seeding
                  </CardTitle>
                  <CardDescription>
                    Populate the database with dummy mobile entries and blog posts for testing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      if(confirm("Seed database with dummy data?")) {
                        const res = await fetch('/api/admin/seed', { method: 'POST' });
                        if(res.ok) {
                          alert("Database seeded successfully!");
                          fetchData();
                        }
                      }
                    }}
                    className="rounded-full px-8"
                  >
                    Seed Database
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider">Sync Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 h-64 overflow-y-auto font-mono text-[10px] space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground italic">No logs to display.</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className={log.includes('Error') ? 'text-destructive' : log.includes('Success') ? 'text-green-600' : ''}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
