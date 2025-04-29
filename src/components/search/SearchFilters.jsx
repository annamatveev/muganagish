import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { 
  Accessibility, 
  CheckCircle, 
  MousePointer, 
  ArrowUpRight 
} from "lucide-react";

export default function SearchFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ [key]: value });
  };

  const renderStars = (count) => {
    return Array(count).fill(0).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
    ));
  };

  // Count active filters for indicators
  const activeFilterCount = Object.keys(filters).reduce((count, key) => {
    if (key === 'minRating' && filters[key] > 0) return count + 1;
    if (key !== 'minRating' && filters[key] === true) return count + 1;
    return count;
  }, 0);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium">סינון לפי נגישות</h3>
        {activeFilterCount > 0 && (
          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {activeFilterCount} מסננים פעילים
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="step-free-access"
            checked={filters.stepFreeAccess}
            onCheckedChange={(checked) => handleChange("stepFreeAccess", checked)}
            className="data-[state=checked]:bg-[#3498DB]"
          />
          <Label htmlFor="step-free-access" className="flex items-center gap-1 cursor-pointer">
            <Accessibility className="w-4 h-4" />
            גישה ללא מדרגות
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="maneuvering-space"
            checked={filters.maneuveringSpace}
            onCheckedChange={(checked) => handleChange("maneuveringSpace", checked)}
            className="data-[state=checked]:bg-[#3498DB]"
          />
          <Label htmlFor="maneuvering-space" className="flex items-center gap-1 cursor-pointer">
            <MousePointer className="w-4 h-4" />
            מרחב תמרון מספק
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="ramp-present"
            checked={filters.rampPresent}
            onCheckedChange={(checked) => handleChange("rampPresent", checked)}
            className="data-[state=checked]:bg-[#3498DB]"
          />
          <Label htmlFor="ramp-present" className="flex items-center gap-1 cursor-pointer">
            <ArrowUpRight className="w-4 h-4" />
            רמפה
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="verified-only"
            checked={filters.verifiedOnly}
            onCheckedChange={(checked) => handleChange("verifiedOnly", checked)}
            className="data-[state=checked]:bg-[#3498DB]"
          />
          <Label htmlFor="verified-only" className="flex items-center gap-1 cursor-pointer">
            <CheckCircle className="w-4 h-4" />
            מקלטים מאומתים בלבד
          </Label>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <Label htmlFor="rating" className="font-medium">דירוג מינימלי</Label>
        <Select 
          value={filters.minRating.toString()} 
          onValueChange={(value) => onChange({ minRating: parseInt(value, 10) })}
        >
          <SelectTrigger id="rating" className="w-40 text-right" dir="rtl">
            <SelectValue placeholder="כל הדירוגים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" className="text-right">הכל</SelectItem>
            {[1, 2, 3, 4, 5].map((rating) => (
              <SelectItem key={rating} value={rating.toString()} className="flex items-center gap-2 justify-end">
                <div className="flex">{renderStars(rating)}</div>
                <span>ומעלה</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}