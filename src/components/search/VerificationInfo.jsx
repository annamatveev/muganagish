import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Info, CheckCircle, AlertTriangle } from "lucide-react";

export default function VerificationInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
          <span className="sr-only">מידע על אימות</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" dir="rtl">
        <div className="space-y-3">
          <h3 className="font-medium">מה זה מקלט מאומת?</h3>
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <span className="font-medium text-green-600">מקלט מאומת</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="font-medium text-amber-600">מקלט לא מאומת</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            * אנו עושים מאמצים לאמת את המידע, אך לא ניתן להבטיח את דיוקו המלא. אנא התייחסו בהתאם.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}