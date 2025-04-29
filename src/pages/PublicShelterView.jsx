
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shelter } from "@/api/entities";
import { Branch } from "@/api/entities";
import { User } from "@/api/entities";
import { ReviewModeration } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowRight, ThumbsUp, Flag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ReportDialog from "../components/search/ReportDialog";
import ReviewDialog from "../components/search/ReviewDialog";
import ShelterDetails from "../components/shelter/ShelterDetails";

export default function PublicShelterView() {
  const navigate = useNavigate();
  const [shelter, setShelter] = useState(null);
  const [branch, setBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shelterId = urlParams.get('id');
      
      if (!shelterId) {
        navigate(createPageUrl("SearchShelters"));
        return;
      }

      // Load shelter data
      const shelterData = await Shelter.list();
      const shelterItem = shelterData.find(s => s.id === shelterId);
      
      if (!shelterItem) {
        navigate(createPageUrl("SearchShelters"));
        return;
      }

      console.log("Loaded shelter data:", shelterItem); // Debug log
      setShelter(shelterItem);
      
      // Load branch data if shelter belongs to a branch
      if (shelterItem.branch_id) {
        const branchData = await Branch.list();
        const branchItem = branchData.find(b => b.id === shelterItem.branch_id);
        if (branchItem) {
          console.log("Loaded branch data:", branchItem); // Debug log
          setBranch(branchItem);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      navigate(createPageUrl("SearchShelters"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportShelter = async (reportData) => {
    try {
      // Try to get current user's email
      let reporterEmail = null;
      try {
        const userData = await User.me();
        reporterEmail = userData.email;
      } catch (error) {
        // User not logged in, that's fine
      }

      // Log the report data (You can replace this with your reporting logic)
      console.log("Report data:", reportData);

      alert("תודה! הדיווח שלך התקבל ויעבור בדיקה.");
    } catch (error) {
      console.error("Error saving report:", error);
      alert("אירעה שגיאה בשמירת הדיווח. אנא נסו שנית.");
    }
  };

  const handleUpvoteShelter = async (reviewData) => {
    try {
      // Try to get current user's email
      let reporterEmail = null;
      try {
        const userData = await User.me();
        reporterEmail = userData.email;
      } catch (error) {
        // User not logged in, that's fine
      }

      // Create review moderation entry
      await ReviewModeration.create({
        shelter_id: shelter.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        reporter_email: reporterEmail,
        status: "pending"
      });
      
      alert("תודה! הדירוג שלך התקבל ויעבור בדיקה לפני פרסום.");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("אירעה שגיאה בשמירת הדירוג. אנא נסו שנית.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <Card>
              <CardHeader className="pb-3">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">המקלט לא נמצא</h2>
          <p className="text-gray-600 mb-6">המקלט המבוקש אינו קיים או שאין לך הרשאות לצפות בו</p>
          <Button
            onClick={() => navigate(createPageUrl("SearchShelters"))}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה לחיפוש מקלטים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(createPageUrl("SearchShelters"))}
            className="text-[#3498DB] hover:text-[#2980B9] flex items-center"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            חזרה לתוצאות החיפוש
          </button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(true)}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <ThumbsUp className="w-4 h-4 ml-1" />
              דירוג
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Flag className="w-4 h-4 ml-1" />
              דיווח
            </Button>
          </div>
        </div>

        {shelter && (
          <div>
            <pre style={{display: 'none'}}>{JSON.stringify(shelter, null, 2)}</pre> {/* Debug element */}
            <ShelterDetails
              shelter={shelter}
              branch={branch}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              viewMode="public"
            />
          </div>
        )}

        <ReportDialog 
          open={isReportDialogOpen} 
          onOpenChange={setIsReportDialogOpen} 
          onSubmit={(data) => {
            handleReportShelter(data);
            setIsReportDialogOpen(false);
          }} 
        />
        
        <ReviewDialog 
          open={isReviewDialogOpen} 
          onOpenChange={setIsReviewDialogOpen} 
          onSubmit={(data) => {
            handleUpvoteShelter(data);
            setIsReviewDialogOpen(false);
          }} 
        />
      </div>
    </div>
  );
}
