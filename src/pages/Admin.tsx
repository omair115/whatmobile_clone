import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, RefreshCw, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, LogOut, Smartphone, FileText, Settings } from 'lucide-react';
import { Mobile, BlogPost } from '@/src/types';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [mobiles, setMobiles] = useState<Mobile[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const [editingMobile, setEditingMobile] = useState<Partial<Mobile> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
    if (token) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [mobRes, postRes] = await Promise.all([
        fetch('/api/mobiles'),
        fetch('/api/posts')
      ]);
      const mobData = await mobRes.json();
      const postData = await postRes.json();
      if (Array.isArray(mobData)) setMobiles(mobData);
      if (Array.isArray(postData)) setPosts(postData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
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
      specs: editingMobile.specs || { display: '', camera: '', battery: '', processor: '', ram: '', storage: '', os: '' },
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
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="mobiles" className="font-bold uppercase text-xs"><Smartphone className="h-3 w-3 mr-2" /> Mobiles</TabsTrigger>
            <TabsTrigger value="posts" className="font-bold uppercase text-xs"><FileText className="h-3 w-3 mr-2" /> Posts</TabsTrigger>
            <TabsTrigger value="automation" className="font-bold uppercase text-xs"><Zap className="h-3 w-3 mr-2" /> Automation</TabsTrigger>
          </TabsList>

          {/* Mobiles Management */}
          <TabsContent value="mobiles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3a5a]">Manage Mobile Phones</h2>
              <Button size="sm" onClick={() => setEditingMobile({ name: '', brand: '', slug: '', price: '', currency: '$', specs: { display: '', camera: '', battery: '', processor: '', ram: '', storage: '', os: '' }, features: [], images: [] })}>
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
                        <Input value={editingMobile.name} onChange={e => setEditingMobile({...editingMobile, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand</Label>
                        <Input value={editingMobile.brand} onChange={e => setEditingMobile({...editingMobile, brand: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={editingMobile.slug} onChange={e => setEditingMobile({...editingMobile, slug: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (Numeric)</Label>
                        <Input value={editingMobile.price} onChange={e => setEditingMobile({...editingMobile, price: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input value={editingMobile.currency || 'Rs.'} onChange={e => setEditingMobile({...editingMobile, currency: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Launch Date</Label>
                        <Input value={editingMobile.launchDate || ''} onChange={e => setEditingMobile({...editingMobile, launchDate: e.target.value})} placeholder="e.g. Mar 2026" />
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
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase">Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Display</Label>
                          <Input value={editingMobile.specs?.display || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), display: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Processor</Label>
                          <Input value={editingMobile.specs?.processor || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), processor: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>RAM</Label>
                          <Input value={editingMobile.specs?.ram || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), ram: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Storage</Label>
                          <Input value={editingMobile.specs?.storage || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), storage: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Camera</Label>
                          <Input value={editingMobile.specs?.camera || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), camera: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Battery</Label>
                          <Input value={editingMobile.specs?.battery || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), battery: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label>OS</Label>
                          <Input value={editingMobile.specs?.os || ''} onChange={e => setEditingMobile({...editingMobile, specs: {...(editingMobile.specs || {} as any), os: e.target.value}})} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase">Media & Features</h3>
                      <div className="space-y-2">
                        <Label>Image URLs (Comma separated)</Label>
                        <Input 
                          value={editingMobile.images?.join(', ') || ''} 
                          onChange={e => setEditingMobile({...editingMobile, images: e.target.value.split(',').map(s => s.trim())})} 
                          placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Features (Comma separated)</Label>
                        <Input 
                          value={editingMobile.features?.join(', ') || ''} 
                          onChange={e => setEditingMobile({...editingMobile, features: e.target.value.split(',').map(s => s.trim())})} 
                          placeholder="Fast Charging, 5G, AI Camera"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-bold uppercase">SEO & Content</h3>
                      <div className="space-y-2">
                        <Label>SEO Title</Label>
                        <Input value={editingMobile.seoTitle || ''} onChange={e => setEditingMobile({...editingMobile, seoTitle: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>SEO Description</Label>
                        <Textarea value={editingMobile.seoDescription || ''} onChange={e => setEditingMobile({...editingMobile, seoDescription: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
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
                        <Input value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} required />
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
                      <td className="px-4 py-3 text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</td>
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

          {/* Automation Tab */}
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
