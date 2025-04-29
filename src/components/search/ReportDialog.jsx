import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";

export default function ReportDialog({ open, onOpenChange, onSubmit }) {
  const [reportData, setReportData] = useState({
    type: "incorrect_info",
    details: "",
    contact: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportData.details) {
      alert("אנא פרטו את הבעיה");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(reportData);
      onOpenChange(false);
      setReportData({
        type: "incorrect_info",
        details: "",
        contact: ""
      });
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white" dir="rtl">
        <DialogHeader className="flex items-center" dir="rtl">
          <DialogTitle>דיווח על בעיה במקלט</DialogTitle>
          <DialogDescription>
            אנא פרטו את הבעיה שנתקלתם בה, ונטפל בכך בהקדם.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>סוג הבעיה</Label>
              <RadioGroup
               dir="rtl"
                value={reportData.type}
                onValueChange={(value) => setReportData({ ...reportData, type: value })}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem id="incorrect_info" value="incorrect_info" />
                  <Label htmlFor="incorrect_info">מידע לא מדויק</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem id="access_issue" value="access_issue" />
                  <Label htmlFor="access_issue">בעיית נגישות</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem id="closed" value="closed" />
                  <Label htmlFor="closed">מקלט סגור או לא זמין</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem id="other" value="other" />
                  <Label htmlFor="other">בעיה אחרת</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">פרטי הבעיה*</Label>
              <Textarea
                id="details"
                value={reportData.details}
                onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                placeholder="תארו את הבעיה בפירוט. תיאור מדויק יעזור לנו לטפל בבעיה במהירות."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">פרטי קשר (אופציונלי)</Label>
              <Input
                id="contact"
                value={reportData.contact}
                onChange={(e) => setReportData({ ...reportData, contact: e.target.value })}
                placeholder="אימייל או טלפון ליצירת קשר"
              />
              <p className="text-xs text-gray-500">
                השאירו פרטי קשר אם תרצו לקבל עדכון כשהבעיה תטופל
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p>הדיווח שלך יועבר לבדיקה על ידי צוות האתר. תודה על עזרתך בשיפור המידע!</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
            <Button 
              type="submit" 
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isSubmitting || !reportData.details}
            >
              {isSubmitting ? "שולח..." : "שלח דיווח"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}