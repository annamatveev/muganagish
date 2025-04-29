
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { CoordinatorVerification } from "@/api/entities";
import { ReviewModeration } from "@/api/entities";
import { ReportModeration } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Shelter } from "@/api/entities";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  Star,
  Flag,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Building2,
  MapPin,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ShelterCard from "../components/search/ShelterCard"; // Fix the import path

export default function AdminModeration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("coordinators");
  
  const [coordinatorRequests, setCoordinatorRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [pendingShelters, setPendingShelters] = useState([]);
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  const checkAdminAccess = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Check if user is admin (you may have a different way to determine admin status)
      // For now, we'll use a simple check with hardcoded admin email
      const isUserAdmin = userData.email === "contact.us.moogan@gmail.com" || userData.role === "admin";
      setIsAdmin(isUserAdmin);
      
      if (!isUserAdmin) {
        alert("אין לך הרשאה לגשת לדף זה");
        navigate(createPageUrl("HomePage"));
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate(createPageUrl("HomePage"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case "coordinators":
          const verifications = await CoordinatorVerification.filter({});
          setCoordinatorRequests(verifications || []);
          break;
          
        case "reviews":
          const reviewModerations = await ReviewModeration.filter({});
          setReviews(reviewModerations || []);
          break;
          
        case "reports":
          const reportModerations = await ReportModeration.filter({});
          setReports(reportModerations || []);
          break;
          
        case "shelters":
          // Load shelters that need review
          const shelters = await Shelter.filter({ needs_review: true });
          setPendingShelters(shelters || []);
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveShelter = async (shelter) => {
    setProcessingAction(true);
    try {
      // Update shelter to approved state
      await Shelter.update(shelter.id, {
        needs_review: false,
        verified: true,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString()
      });
      
      // Send email notification if we have submitter's email
      if (shelter.submitted_by) {
        await SendEmail({
          to: shelter.submitted_by,
          subject: "הדיווח על המקלט אושר",
          body: `
            שלום,
            
            תודה על הדיווח שלך על מקלט בכתובת "${shelter.address}".
            הדיווח אושר ופורסם במערכת.
            
            בברכה,
            צוות מוגנגיש
          `
        });
      }
      
      // Reload data
      await loadData();
      alert("המקלט אושר בהצלחה");
    } catch (error) {
      console.error("Error approving shelter:", error);
      alert("אירעה שגיאה באישור המקלט. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectShelter = async (shelter) => {
    if (!rejectionReason) {
      alert("אנא הזן סיבה לדחיית הדיווח");
      return;
    }
    
    setProcessingAction(true);
    try {
      // Delete the shelter or mark it as rejected
      await Shelter.delete(shelter.id);
      
      // Send email notification if we have submitter's email
      if (shelter.submitted_by) {
        await SendEmail({
          to: shelter.submitted_by,
          subject: "הדיווח על המקלט נדחה",
          body: `
            שלום,
            
            לצערנו, הדיווח שלך על מקלט בכתובת "${shelter.address}" לא אושר לפרסום.
            
            סיבת הדחייה: ${rejectionReason}
            
            באפשרותך להגיש דיווח חדש עם מידע מדויק יותר.
            
            בברכה,
            צוות מוגנגיש
          `
        });
      }
      
      // Reload data
      await loadData();
      alert("הדיווח נדחה והודעה נשלחה למשתמש");
    } catch (error) {
      console.error("Error rejecting shelter:", error);
      alert("אירעה שגיאה בדחיית הדיווח. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
      setSelectedItem(null);
      setRejectionReason("");
    }
  };

  const handleApproveCoordinator = async (verification) => {
    setProcessingAction(true);
    try {
      // Update verification status
      await CoordinatorVerification.update(verification.id, {
        status: "approved",
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString()
      });
      
      // Update user as coordinator
      try {
        // Note: In a real app, you would need a backend function to update another user's data
        // This is just a placeholder for the concept
        console.log(`User ${verification.user_id} would be updated to be a coordinator`);
      } catch (error) {
        console.error("Error updating user:", error);
      }
      
      // Send email notification
      await SendEmail({
        to: verification.user_email,
        subject: "בקשת האימות שלך אושרה",
        body: `
          שלום ${verification.user_name},
          
          שמחים לבשר לך שבקשת האימות שלך כרכז/ת נגישות אושרה!
          מעכשיו תוכל/י להוסיף ולנהל ארגונים ומקלטים במערכת.
          
          ניתן להיכנס למערכת ולהתחיל מיד:
          [קישור למערכת]
          
          בברכה,
          צוות מוגנגיש
        `
      });
      
      // Reload data
      await loadData();
      alert("הבקשה אושרה בהצלחה והודעה נשלחה למשתמש");
    } catch (error) {
      console.error("Error approving coordinator:", error);
      alert("אירעה שגיאה באישור הבקשה. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
      setSelectedItem(null);
      setRejectionReason("");
    }
  };

  const handleRejectCoordinator = async (verification) => {
    if (!rejectionReason) {
      alert("אנא הזן סיבה לדחיית הבקשה");
      return;
    }
    
    setProcessingAction(true);
    try {
      // Update verification status
      await CoordinatorVerification.update(verification.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString()
      });
      
      // Send email notification
      await SendEmail({
        to: verification.user_email,
        subject: "בקשת האימות שלך נדחתה",
        body: `
          שלום ${verification.user_name},
          
          לצערנו, בקשת האימות שלך כרכז/ת נגישות נדחתה.
          
          סיבת הדחייה: ${rejectionReason}
          
          באפשרותך להגיש בקשה חדשה עם המסמכים המתאימים.
          
          בברכה,
          צוות מוגנגיש
        `
      });
      
      // Reload data
      await loadData();
      alert("הבקשה נדחתה והודעה נשלחה למשתמש");
    } catch (error) {
      console.error("Error rejecting coordinator:", error);
      alert("אירעה שגיאה בדחיית הבקשה. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
      setSelectedItem(null);
      setRejectionReason("");
    }
  };

  const handleApproveReview = async (review) => {
    setProcessingAction(true);
    try {
      // Update review moderation status
      await ReviewModeration.update(review.id, {
        status: "approved",
        moderated_by: user.email,
        moderation_date: new Date().toISOString()
      });
      
      // Send email notification if reporter provided email
      if (review.reporter_email) {
        await SendEmail({
          to: review.reporter_email,
          subject: "הדירוג שלך פורסם",
          body: `
            שלום,
            
            הדירוג שלך למקלט פורסם באתר.
            תודה על תרומתך למאגר המידע שלנו!
            
            בברכה,
            צוות מוגנגיש
          `
        });
      }
      
      // Reload data
      await loadData();
      alert("הדירוג אושר ופורסם בהצלחה");
    } catch (error) {
      console.error("Error approving review:", error);
      alert("אירעה שגיאה באישור הדירוג. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectReview = async (review) => {
    if (!rejectionReason) {
      alert("אנא הזן סיבה לדחיית הדירוג");
      return;
    }
    
    setProcessingAction(true);
    try {
      // Update review moderation status
      await ReviewModeration.update(review.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
        moderated_by: user.email,
        moderation_date: new Date().toISOString()
      });
      
      // Send email notification if reporter provided email
      if (review.reporter_email) {
        await SendEmail({
          to: review.reporter_email,
          subject: "הדירוג שלך לא פורסם",
          body: `
            שלום,
            
            הדירוג שהוספת למקלט לא פורסם מהסיבה הבאה:
            ${rejectionReason}
            
            באפשרותך להגיש דירוג חדש.
            
            בברכה,
            צוות מוגנגיש
          `
        });
      }
      
      // Reload data
      await loadData();
      alert("הדירוג נדחה והודעה נשלחה למשתמש");
    } catch (error) {
      console.error("Error rejecting review:", error);
      alert("אירעה שגיאה בדחיית הדירוג. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
      setSelectedItem(null);
      setRejectionReason("");
    }
  };

  // Similar functions for handling reports
  const handleApproveReport = async (report) => {
    setProcessingAction(true);
    try {
      // Update report moderation status
      await ReportModeration.update(report.id, {
        status: "approved",
        moderated_by: user.email,
        moderation_date: new Date().toISOString()
      });
      
      // Send email notification if contact info was provided
      if (report.contact_info && report.contact_info.includes('@')) {
        await SendEmail({
          to: report.contact_info,
          subject: "הדיווח שלך התקבל",
          body: `
            שלום,
            
            תודה על הדיווח שלך. הדיווח התקבל ואנו מטפלים בו.
            
            בברכה,
            צוות מוגנגיש
          `
        });
      }
      
      // Reload data
      await loadData();
      alert("הדיווח אושר בהצלחה");
    } catch (error) {
      console.error("Error approving report:", error);
      alert("אירעה שגיאה באישור הדיווח. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectReport = async (report) => {
    if (!rejectionReason) {
      alert("אנא הזן סיבה לדחיית הדיווח");
      return;
    }
    
    setProcessingAction(true);
    try {
      // Update report moderation status
      await ReportModeration.update(report.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
        moderated_by: user.email,
        moderation_date: new Date().toISOString()
      });
      
      // Send email notification if contact info was provided
      if (report.contact_info && report.contact_info.includes('@')) {
        await SendEmail({
          to: report.contact_info,
          subject: "הדיווח שלך נדחה",
          body: `
            שלום,
            
            תודה על הדיווח שלך. לאחר בדיקה, הדיווח לא אושר מהסיבה הבאה:
            ${rejectionReason}
            
            בברכה,
            צוות מוגנגיש
          `
        });
      }
      
      // Reload data
      await loadData();
      alert("הדיווח נדחה בהצלחה");
    } catch (error) {
      console.error("Error rejecting report:", error);
      alert("אירעה שגיאה בדחיית הדיווח. אנא נסה שנית.");
    } finally {
      setProcessingAction(false);
      setSelectedItem(null);
      setRejectionReason("");
    }
  };

  // Add a function to handle tab changes without refreshing
  const handleTabChange = (value) => {
    // Prevent default behavior
    setActiveTab(value);
  };

  const getShelterTypeDisplay = (type, otherText) => {
    if (type === "אחר" && otherText) {
      return `אחר: ${otherText}`;
    }
    return type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8" dir="rtl">
          <TabsList className="mb-6" dir="rtl">
            <TabsTrigger value="coordinators">
              <Shield className="w-4 h-4 ml-2" />
              בקשות אימות
            </TabsTrigger>
            <TabsTrigger value="shelters">
              <Building2 className="w-4 h-4 ml-2" />
              דיווחי מקלטים
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 ml-2" />
              דירוגים
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Flag className="w-4 h-4 ml-2" />
              דיווחים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coordinators">
            <div className="space-y-4">
              {coordinatorRequests.length === 0 ? (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-blue-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">אין בקשות אימות בהמתנה</h3>
                    <p className="text-gray-500">כל הבקשות טופלו! כרגע אין בקשות חדשות בהמתנה לאישור.</p>
                  </CardContent>
                </Card>
              ) : (
                coordinatorRequests
                  .filter(request => request.status === "pending")
                  .map(request => (
                    <Card key={request.id} className="shadow-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-amber-100 text-amber-800 mb-2">ממתין לאישור</Badge>
                            <CardTitle>{request.user_name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              {request.user_email}
                            </CardDescription>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(request.created_date), 'PPP')}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-blue-600 hover:underline">
                            <FileText className="w-4 h-4" />
                            <a href={request.verification_file_url} target="_blank" rel="noopener noreferrer">
                              צפה במסמך האימות
                              <ExternalLink className="w-3 h-3 inline-block mr-1" />
                            </a>
                          </div>
                        </div>

                        {selectedItem?.id === request.id ? (
                          <div className="space-y-3 bg-red-50 p-3 rounded-md">
                            <p className="text-red-700 font-medium text-sm">נא לציין את סיבת הדחייה:</p>
                            <Textarea 
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="סיבת הדחייה (תישלח למשתמש)"
                              className="mb-2"
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(null);
                                  setRejectionReason("");
                                }}
                              >
                                ביטול
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectCoordinator(request)}
                                disabled={processingAction}
                              >
                                {processingAction ? "מעבד..." : "אישור דחייה"}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        {selectedItem?.id !== request.id && (
                          <>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setSelectedItem(request)}
                              disabled={processingAction}
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              דחייה
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveCoordinator(request)}
                              disabled={processingAction}
                            >
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              אישור
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))
              )}

              {coordinatorRequests.length > 0 && 
               coordinatorRequests.filter(request => request.status === "pending").length === 0 && (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-green-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">כל הבקשות טופלו</h3>
                    <p className="text-gray-500">אין בקשות חדשות בהמתנה לאישור. כל הבקשות הקיימות כבר טופלו.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="shelters">
            <div className="space-y-4">
              {pendingShelters.length === 0 ? (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-blue-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">אין דיווחי מקלטים בהמתנה</h3>
                    <p className="text-gray-500">כל דיווחי המקלטים טופלו! כרגע אין דיווחים חדשים בהמתנה לאישור.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingShelters.map(shelter => (
                  <motion.div
                    key={shelter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShelterCard
                      shelter={shelter}
                      viewMode="admin"
                      onViewDetails={() => navigate(createPageUrl(`ShelterView?id=${shelter.id}`))}
                      onAction={(action) => {
                        if (action === "approve") {
                          handleApproveShelter(shelter);
                        } else if (action === "reject") {
                          setSelectedItem(shelter);
                          setRejectionReason("");
                        }
                      }}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-amber-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <Star className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">אין דירוגים בהמתנה</h3>
                    <p className="text-gray-500">כל הדירוגים טופלו! כרגע אין דירוגים חדשים בהמתנה לאישור.</p>
                  </CardContent>
                </Card>
              ) : reviews.filter(review => review.status === "pending").length === 0 ? (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-green-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">כל הדירוגים טופלו</h3>
                    <p className="text-gray-500">אין דירוגים חדשים בהמתנה לאישור. כל הדירוגים הקיימים כבר טופלו.</p>
                  </CardContent>
                </Card>
              ) : (
                reviews
                  .filter(review => review.status === "pending")
                  .map(review => (
                    <Card key={review.id} className="shadow-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-amber-100 text-amber-800 mb-2">ממתין לאישור</Badge>
                            <CardTitle className="flex items-center gap-2">
                              דירוג למקלט
                              <div className="flex">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                                ))}
                              </div>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {review.reporter_email || "משתמש אנונימי"}
                            </CardDescription>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(review.created_date), 'PPP')}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-3 rounded-md mb-4">
                          <p className="text-gray-700">{review.comment || "אין הערות נוספות"}</p>
                        </div>

                        {selectedItem?.id === review.id ? (
                          <div className="space-y-3 bg-red-50 p-3 rounded-md">
                            <p className="text-red-700 font-medium text-sm">נא לציין את סיבת הדחייה:</p>
                            <Textarea 
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="סיבת הדחייה (תישלח למשתמש אם צוין מייל)"
                              className="mb-2"
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(null);
                                  setRejectionReason("");
                                }}
                              >
                                ביטול
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectReview(review)}
                                disabled={processingAction}
                              >
                                {processingAction ? "מעבד..." : "אישור דחייה"}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        {selectedItem?.id !== review.id && (
                          <>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setSelectedItem(review)}
                              disabled={processingAction}
                            >
                              <ThumbsDown className="w-4 h-4 ml-2" />
                              דחייה
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveReview(review)}
                              disabled={processingAction}
                            >
                              <ThumbsUp className="w-4 h-4 ml-2" />
                              אישור
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              {reports.length === 0 ? (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-red-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <Flag className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">אין דיווחים בהמתנה</h3>
                    <p className="text-gray-500">כל הדיווחים טופלו! כרגע אין דיווחים חדשים בהמתנה לטיפול.</p>
                  </CardContent>
                </Card>
              ) : reports.filter(report => report.status === "pending").length === 0 ? (
                <Card className="text-center py-10">
                  <CardContent>
                    <div className="mx-auto bg-green-50 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">כל הדיווחים טופלו</h3>
                    <p className="text-gray-500">אין דיווחים חדשים בהמתנה לטיפול. כל הדיווחים הקיימים כבר טופלו.</p>
                  </CardContent>
                </Card>
              ) : (
                reports
                  .filter(report => report.status === "pending")
                  .map(report => (
                    <Card key={report.id} className="shadow-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-red-100 text-red-800 mb-2">ממתין לטיפול</Badge>
                            <CardTitle>
                              {report.report_type === "incorrect_info" && "מידע שגוי"}
                              {report.report_type === "access_issue" && "בעיית נגישות"}
                              {report.report_type === "closed" && "מקלט סגור"}
                              {report.report_type === "other" && "דיווח אחר"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {report.contact_info || "ללא פרטי קשר"}
                            </CardDescription>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(report.created_date), 'PPP')}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-3 rounded-md mb-4">
                          <p className="text-gray-700">{report.details || "אין פרטים נוספים"}</p>
                        </div>

                        {selectedItem?.id === report.id ? (
                          <div className="space-y-3 bg-red-50 p-3 rounded-md">
                            <p className="text-red-700 font-medium text-sm">נא לציין את סיבת הדחייה:</p>
                            <Textarea 
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="סיבת הדחייה (תישלח למשתמש אם צוינו פרטי קשר)"
                              className="mb-2"
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(null);
                                  setRejectionReason("");
                                }}
                              >
                                ביטול
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectReport(report)}
                                disabled={processingAction}
                              >
                                {processingAction ? "מעבד..." : "אישור דחייה"}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        {selectedItem?.id !== report.id && (
                          <>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setSelectedItem(report)}
                              disabled={processingAction}
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              דחייה
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveReport(report)}
                              disabled={processingAction}
                            >
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              אישור וטיפול
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
