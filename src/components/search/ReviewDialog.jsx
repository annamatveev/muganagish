
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, AlertTriangle } from "lucide-react";
import { SendEmail } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { ReviewModeration } from "@/api/entities";

export default function ReviewDialog({ open, onOpenChange, onSubmit }) {
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (reviewData.rating === 0) {
      alert("אנא דרגו את המקלט");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the review moderation entry
      await ReviewModeration.create({
        ...reviewData,
        status: "pending"
      });

      // Send email to admin
      try {
        await SendEmail({
          to: "contact.us.moogan@gmail.com",
          subject: "דירוג חדש ממתין לאישור",
          body: `
            דירוג חדש התקבל וממתין לאישור:
            
            דירוג: ${reviewData.rating} כוכבים
            הערות: ${reviewData.comment || "אין הערות"}
            
            אנא היכנס לממשק הניהול כדי לאשר או לדחות את הדירוג:
            ${window.location.origin}${createPageUrl("AdminModeration")}
          `
        });
      } catch (error) {
        console.error("Error sending admin notification:", error);
      }

      onOpenChange(false);
      setReviewData({
        rating: 0,
        comment: ""
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    setReviewData({ ...reviewData, rating });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} dir="rtl">
      <DialogContent className="sm:max-w-[500px] bg-white" dir="rtl">
        <DialogHeader className="text-right flex items-center" dir="rtl">
          <DialogTitle dir="rtl">דירוג המקלט</DialogTitle>
          <DialogDescription>
            האם המידע על המקלט הזה היה מדויק? דרגו את המקלט ושתפו את חוות דעתכם.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>דירוג</Label>
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoveredRating > 0 ? star <= hoveredRating : star <= reviewData.rating)
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              {reviewData.rating > 0 && (
                <p className="text-center font-medium mt-2">
                  {reviewData.rating === 1 && "לא מדויק"}
                  {reviewData.rating === 2 && "בעייתי"}
                  {reviewData.rating === 3 && "סביר"}
                  {reviewData.rating === 4 && "טוב"}
                  {reviewData.rating === 5 && "מצוין ומדויק"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">הערות (אופציונלי)</Label>
              <Textarea
                id="comment"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="ספרו לנו על המקלט ועל המידע שסופק"
                rows={4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p>הדירוג שלך יועבר לבדיקה לפני פרסום. אנו מעריכים את המשוב שלך!</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
            <Button 
              type="submit" 
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isSubmitting || reviewData.rating === 0}
            >
              {isSubmitting ? "שולח..." : "שלח דירוג"}
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
