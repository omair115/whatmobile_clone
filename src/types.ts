export interface MobileSpec {
  display: string;
  camera: string;
  battery: string;
  processor: string;
  ram: string;
  storage: string;
  os: string;
  [key: string]: string;
}

export interface Mobile {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: number | string;
  currency: string;
  launchDate: string;
  images: string[];
  specs: MobileSpec;
  description: string;
  seoTitle: string;
  seoDescription: string;
  category: 'budget' | 'mid-range' | 'flagship';
  features: string[];
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  image: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
}
