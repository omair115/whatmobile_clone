import { BRANDS } from '@/src/constants';

export function BrandGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {BRANDS.map(brand => (
        <a 
          key={brand} 
          href={`/brand/${brand.toLowerCase()}`}
          className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 mb-2 flex items-center justify-center bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
            <span className="text-lg font-bold text-muted-foreground group-hover:text-primary">{brand[0]}</span>
          </div>
          <span className="text-xs font-medium">{brand}</span>
        </a>
      ))}
    </div>
  );
}
