import React, { useState } from "react"; // Add useState
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function AccessibilityDetails({ 
  stepFreeAccess,
  onStepFreeAccessChange,
  pathWidth,
  onPathWidthChange,
  doorWidth,
  onDoorWidthChange,
  stairsCount,
  onStairsCountChange,
  handrailsPresent,
  onHandrailsPresentChange,
  maneuveringSpace,
  onManeuveringSpaceChange,
  thresholdHeight,
  onThresholdHeightChange,
  rampPresent,
  onRampPresentChange,
  navigationSystem,
  onNavigationSystemChange,
  navigationSystemOther,
  onNavigationSystemOtherChange,
  accessibilityAids,
  onAccessibilityAidsChange
}) {
  // Local state for threshold management
  const [hasThreshold, setHasThreshold] = useState(thresholdHeight !== null && thresholdHeight > 0);

  // Handle threshold changes
  const handleThresholdChange = (value) => {
    const hasThresholdNow = value === "yes";
    setHasThreshold(hasThresholdNow);
    if (!hasThresholdNow) {
      onThresholdHeightChange(null);
      onRampPresentChange(false);
    }
  };

  const navigationSystems = [
    { value: "step_hear", label: "Step Hear" },
    { value: "right_hear", label: "Right Hear" },
    { value: "other", label: "אחר" },
    { value: "none", label: "אין" }
  ];

  const accessibilityAidOptions = [
    { id: "braille", label: "שילוט ברייל" },
    { id: "high_contrast", label: "שילוט בניגודיות גבוהה" },
    { id: "tactile_path", label: "נתיב מישושי" },
    { id: "audio_guidance", label: "הנחיה קולית" },
    { id: "visual_alarm", label: "אזעקה חזותית" },
    { id: "hearing_amplifier", label: "מגבר שמיעה" },
    { id: "wheelchair_space", label: "מקום ייעודי לכיסא גלגלים" },
    { id: "accessible_restroom", label: "שירותים נגישים" }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Path and door width section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="path-width">רוחב המעבר (בס״מ)*</Label>
          <Input 
            id="path-width" 
            type="number" 
            value={pathWidth || ""} 
            onChange={(e) => onPathWidthChange(e.target.value ? Number(e.target.value) : null)}
            placeholder="למשל: 90"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="door-width">רוחב הדלת (בס״מ)*</Label>
          <Input 
            id="door-width" 
            type="number" 
            value={doorWidth || ""} 
            onChange={(e) => onDoorWidthChange(e.target.value ? Number(e.target.value) : null)}
            placeholder="למשל: 80"
            required
          />
        </div>
      </div>

      {/* Step-free access section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          האם יש נגישות ללא מדרגות?
        </Label>
        <RadioGroup 
          value={stepFreeAccess ? "yes" : "no"} 
          onValueChange={(val) => onStepFreeAccessChange(val === "yes")}
          className="flex flex-col space-y-2" dir="rtl"
        >
          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="yes" id="step-free-yes" />
            <Label htmlFor="step-free-yes" className="cursor-pointer">כן</Label>
          </div>
          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="no" id="step-free-no" />
            <Label htmlFor="step-free-no" className="cursor-pointer">לא</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Stairs section - only show if not step-free */}
      {!stepFreeAccess && (
        <div className="space-y-4 border-r-2 border-[#E74C3C] pr-4">
          <div className="space-y-2">
            <Label htmlFor="stairs-count">מספר המדרגות</Label>
            <Input 
              id="stairs-count" 
              type="number" 
              value={stairsCount || ""} 
              onChange={(e) => onStairsCountChange(e.target.value ? Number(e.target.value) : null)}
              placeholder="למשל: 5"
            />
          </div>
          <div className="space-y-3">
            <Label>האם יש מאחזי יד?</Label>
            <RadioGroup 
              value={handrailsPresent ? "yes" : "no"} 
              onValueChange={(val) => onHandrailsPresentChange(val === "yes")}
              className="flex space-x-4 space-x-reverse" dir="rtl"
            >
              <div className="flex items-start space-x-2 space-x-reverse">
                <RadioGroupItem value="yes" id="handrails-yes" />
                <Label htmlFor="handrails-yes" className="cursor-pointer">כן</Label>
              </div>
              <div className="flex items-start space-x-2 space-x-reverse">
                <RadioGroupItem value="no" id="handrails-no" />
                <Label htmlFor="handrails-no" className="cursor-pointer">לא</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {/* Threshold section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">האם יש סף בכניסה?</Label>
        <RadioGroup 
          value={hasThreshold ? "yes" : "no"} 
          onValueChange={handleThresholdChange}
          className="flex space-x-4 space-x-reverse" dir="rtl"
        >
          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="yes" id="threshold-yes" />
            <Label htmlFor="threshold-yes" className="cursor-pointer">כן</Label>
          </div>
          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="no" id="threshold-no" />
            <Label htmlFor="threshold-no" className="cursor-pointer">לא</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Threshold details section */}
      {hasThreshold && (
        <div className="space-y-4 border-r-2 border-[#E74C3C] pr-4">
          <div className="space-y-2">
            <Label htmlFor="threshold-height">גובה הסף (בס״מ)</Label>
            <Input 
              id="threshold-height" 
              type="number" 
              value={thresholdHeight || ""} 
              onChange={(e) => onThresholdHeightChange(e.target.value ? Number(e.target.value) : null)}
              placeholder="למשל: 2"
            />
          </div>

          <div className="space-y-3">
            <Label>האם יש רמפה (כבש)?</Label>
            <RadioGroup 
              value={rampPresent ? "yes" : "no"} 
              onValueChange={(val) => onRampPresentChange(val === "yes")}
              className="flex space-x-4 space-x-reverse" dir="rtl"
            >
              <div className="flex items-start space-x-2 space-x-reverse">
                <RadioGroupItem value="yes" id="ramp-yes" />
                <Label htmlFor="ramp-yes" className="cursor-pointer">כן</Label>
              </div>
              <div className="flex items-start space-x-2 space-x-reverse">
                <RadioGroupItem value="no" id="ramp-no" />
                <Label htmlFor="ramp-no" className="cursor-pointer">לא</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {/* Maneuvering space section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between" dir="rtl">
          <Label className="text-base font-medium" dir="rtl">
            האם יש מרחב תמרון מספק?
          </Label>
        </div>
        <RadioGroup 
          value={maneuveringSpace ? "yes" : "no"} 
          onValueChange={(val) => onManeuveringSpaceChange(val === "yes")}
          className="flex space-x-4 space-x-reverse" dir="rtl"
        >
          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="yes" id="maneuvering-yes" />
            <Label htmlFor="maneuvering-yes" className="cursor-pointer">כן</Label>
          </div>
          <div className="flex items-start space-x-2 space-x-reverse">
            <RadioGroupItem value="no" id="maneuvering-no" />
            <Label htmlFor="maneuvering-no" className="cursor-pointer">לא</Label>
          </div>
        </RadioGroup>
      </div>

      {/* ... keep rest of the component unchanged ... */}
    </div>
  );
}