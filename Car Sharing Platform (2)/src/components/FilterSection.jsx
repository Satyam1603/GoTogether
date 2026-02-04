import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';

export function FilterSection({ filters, onFilterChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="mb-3 block">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={filters.priceRange}
            onValueChange={(value) =>
              onFilterChange({ ...filters, priceRange: value })
            }
          />
        </div>

        {/* Instant Booking */}
        <div className="flex items-center justify-between">
          <Label htmlFor="instant-booking">Instant Booking</Label>
          <Switch
            id="instant-booking"
            checked={filters.instantBooking}
            onCheckedChange={(checked) =>
              onFilterChange({ ...filters, instantBooking: checked })
            }
          />
        </div>

        {/* Verified Drivers Only */}
        <div className="flex items-center justify-between">
          <Label htmlFor="verified-only">Verified Drivers Only</Label>
          <Switch
            id="verified-only"
            checked={filters.verifiedOnly}
            onCheckedChange={(checked) =>
              onFilterChange({ ...filters, verifiedOnly: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
