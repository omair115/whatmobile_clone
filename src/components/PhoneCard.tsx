import { Mobile } from '@/src/types';
import { Card } from '@/components/ui/card';

interface PhoneCardProps {
  phone: Mobile;
}

export function PhoneCard({ phone }: PhoneCardProps) {
  return (
    <a href={`/phone/${phone.slug}`} className="block group">
      <Card className="overflow-hidden border-none shadow-none hover:bg-muted/50 transition-colors p-2 flex flex-col items-center text-center">
        <div className="w-full aspect-[3/4] relative mb-2">
          <img 
            src={phone.images[0] || 'https://picsum.photos/seed/phone/200/300'} 
            alt={phone.name}
            className="object-contain w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{phone.brand}</p>
          <h3 className="text-xs font-bold line-clamp-2 leading-tight min-h-[2rem]">
            {phone.name}
          </h3>
          <p className="text-primary font-bold text-xs mt-1">
            {phone.currency} {phone.price}
          </p>
        </div>
      </Card>
    </a>
  );
}
