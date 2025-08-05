import { DollarSign, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';

export function CurrencyToggle() {
  const { currency, setCurrency, isLoading } = useCurrency();

  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('USD')}
        disabled={isLoading}
        className="flex items-center gap-1 h-8"
      >
        <DollarSign className="h-3 w-3" />
        USD
      </Button>
      <Button
        variant={currency === 'INR' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('INR')}
        disabled={isLoading}
        className="flex items-center gap-1 h-8"
      >
        <IndianRupee className="h-3 w-3" />
        INR
      </Button>
    </div>
  );
}