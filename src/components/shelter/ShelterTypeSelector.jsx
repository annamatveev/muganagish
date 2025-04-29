
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ShelterTypeSelector({ value, onChange, otherValue, onOtherChange }) {
  const shelterTypes = [
    "מרחב מוגן קומתי (ממ״ק)",
    "מקלט תת קרקעי",
    "חדר מדרגות",
    "אזור מחסה",
    "חדר פנימי",
    "מיגונית",
    "אחר"
  ];

  return (
    <div className="space-y-3" dir="rtl">
      <Label className="text-base font-medium">סוג המקלט</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="text-right" dir="rtl">
          <SelectValue placeholder="בחר סוג מקלט" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {shelterTypes.map((type) => (
            <SelectItem key={type} value={type} className="text-right">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {value === "אחר" && (
        <div className="pt-2 mr-6">
          <Label htmlFor="otherType" className="text-sm">נא לפרט:</Label>
          <Input
            id="otherType"
            value={otherValue || ""}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="תיאור סוג המקלט"
            className="mt-1"
            dir="rtl"
          />
        </div>
      )}
    </div>
  );
}
