export interface MobileSpec {
  build: {
    os: string;
    ui: string;
    dimensions: string;
    weight: string;
    sim: string;
    colors: string;
  };
  frequency: {
    '2g': string;
    '3g': string;
    '4g': string;
    '5g'?: string;
  };
  processor: {
    cpu: string;
    chipset: string;
    gpu: string;
  };
  display: {
    technology: string;
    size: string;
    resolution: string;
    protection: string;
    extra: string;
  };
  memory: {
    builtin: string;
    card: string;
  };
  camera: {
    main: string;
    features: string;
    front: string;
  };
  connectivity: {
    wlan: string;
    bluetooth: string;
    gps: string;
    radio: string;
    usb: string;
    nfc: string;
    infrared: string;
    data: string;
  };
  features: {
    sensors: string;
    audio: string;
    browser: string;
    messaging: string;
    games: string;
    torch: string;
    extra: string;
  };
  battery: {
    capacity: string;
    extra: string;
  };
  price: {
    pkr: string;
    usd: string;
  };
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
  slug: string;
  logo?: string;
  description?: string;
}

export interface PriceRange {
  id: string;
  label: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
}
