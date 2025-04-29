
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { CoordinatorVerification } from "@/api/entities";
import { UploadFile, SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, ArrowRight, CheckCircle, FileText, AlertTriangle, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function BusinessVerification() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("verification");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFile, setVerificationFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationFileUrl, setVerificationFileUrl] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationRequestSent, setVerificationRequestSent] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  
  const [orgData, setOrgData] = useState({
    name: "",
    category: "private_business",
    website_url: "",
    accessibility_url: ""
  });
  
  const [agreement, setAgreement] = useState(false);
  
  const categoryLabels = {
    bank: "בנק",
    municipality: "עירייה",
    private_business: "עסק פרטי",
    nonprofit: "ארגון ללא מטרות רווח",
    other: "אחר"
  };

  const documentTypes = [
    "תעודת רכז/ת נגישות מוסמך/ת",
    "כתב מינוי לרכז/ת נגישות מטעם העסק",
    "תעודת עוסק מורשה של העסק",
    "מכתב רשמי מהעסק המאשר את תפקידך כרכז/ת נגישות",
    "תעודת התאגדות + אישור על תפקידך",
  ];

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    setIsCheckingStatus(true);
    try {
      // Check if user is logged in
      const userData = await User.me();
      
      // DEMO PURPOSE ONLY - Auto-verify for demo
      if (userData && !userData.is_coordinator) {
        console.log("DEMO: Auto-approving user as coordinator from verification page");
        try {
          await User.updateMyUserData({
            is_coordinator: true,
            business_verified: true
          });
          userData.is_coordinator = true;
          userData.business_verified = true;
          
          // Show success notification
          setTimeout(() => {
            alert("דמו בלבד: המשתמש אושר אוטומטית כרכז/ת נגישות");
          }, 500);
        } catch (error) {
          console.error("Error auto-verifying:", error);
        }
      }
      
      // If user is already verified as a coordinator, they can proceed
      if (userData.is_coordinator) {
        setVerificationSuccess(true);
        setActiveTab("organization");
      } else {
        // Check if they have a pending verification request
        const verifications = await CoordinatorVerification.filter({
          user_id: userData.id
        });
        
        if (verifications.length > 0) {
          // Sort by most recent first
          const latestVerification = verifications.sort(
            (a, b) => new Date(b.created_date) - new Date(a.created_date)
          )[0];
          
          setPendingVerification(latestVerification);
          
          if (latestVerification.status === "approved") {
            // If approved, update user and proceed
            await User.updateMyUserData({
              is_coordinator: true
            });
            setVerificationSuccess(true);
            setActiveTab("organization");
          } else if (latestVerification.status === "rejected") {
            // If rejected, let them try again
            setVerificationRequestSent(false);
          } else {
            // If pending, show status
            setVerificationRequestSent(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      // Redirect to login if not logged in
      navigate(createPageUrl("HomePage"));
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationFile(e.target.files[0]);
    }
  };

  const handleOrgChange = (field, value) => {
    setOrgData({ ...orgData, [field]: value });
  };

  const handleUpload = async () => {
    if (!verificationFile) return;

    setIsLoading(true);
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Upload file
      const { file_url } = await UploadFile({ file: verificationFile });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setVerificationFileUrl(file_url);
      
      // Get current user
      const user = await User.me();
      
      // Create verification request
      const newVerification = await CoordinatorVerification.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        verification_file_url: file_url,
        status: "pending"
      });
      
      // Send email to admins
      await SendEmail({
        to: "contact.us.moogan@gmail.com",
        subject: "בקשת אימות חדשה לרכז/ת נגישות",
        body: `
          התקבלה בקשת אימות חדשה לרכז/ת נגישות:
          
          שם: ${user.full_name}
          אימייל: ${user.email}
          תאריך הבקשה: ${format(new Date(), 'PPP')}
          
          לצפייה בבקשה ואישורה, היכנס למערכת ניהול הבקשות.
        `
      });
      
      setVerificationRequestSent(true);
      setPendingVerification(newVerification);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("אירעה שגיאה בהעלאת הקובץ. אנא נסו שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgData.name || !agreement) return;
    
    setIsLoading(true);
    try {
      // Get current user
      const user = await User.me();
      
      // Create organization
      const newOrg = await Organization.create({
        ...orgData,
        owner_id: user.id,
        verification_file: verificationFileUrl
      });
      
      // Update user data
      await User.updateMyUserData({
        organization_id: newOrg.id,
        is_coordinator: true
      });
      
      // Navigate to branch creation with the new org id in URL
      navigate(createPageUrl(`BranchManagement?org=${newOrg.id}`));
      
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("אירעה שגיאה ביצירת הארגון. אנא נסו שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#3498DB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">בודק סטטוס אימות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto text-right">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#2C3E50] mb-1">רישום כרכז/ת נגישות</h1>
              <p className="text-gray-600">כדי להוסיף ולנהל מקלטים עבור הארגון שלך, יש צורך באימות תפקידך כרכז/ת נגישות</p>
            </div>
            
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="verification" disabled={activeTab !== "verification" && !verificationSuccess}>
                <div className="flex items-center gap-2">
                  {verificationSuccess && <CheckCircle className="w-4 h-4 text-green-500" />}
                  אימות תפקיד
                </div>
              </TabsTrigger>
              <TabsTrigger value="organization" disabled={!verificationSuccess}>
                <div className="flex items-center gap-2">
                  פרטי הארגון
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="verification">
              <Card className="shadow-lg border-none">
                <CardHeader>
                  <CardTitle>אימות תפקיד רכז/ת נגישות</CardTitle>
                  <CardDescription>
                    כדי לוודא שאתם מורשים להוסיף ולנהל מידע על המקלטים בארגון, אנא העלו אחד מהמסמכים הבאים:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6"  dir="rtl">
                  {/* ... existing verification content ... */}
                  {pendingVerification && pendingVerification.status === "rejected" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4" dir="rtl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-red-800 mb-1">הבקשה האחרונה שלך נדחתה</h3>
                          <p className="text-red-700 text-sm">{pendingVerification.rejection_reason || "הבקשה נדחתה, אנא נסה שנית עם מסמכים מתאימים."}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {verificationRequestSent ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                      <Clock className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                      <h3 className="font-medium text-lg text-amber-800 mb-2">בקשתך נשלחה לאישור</h3>
                      <p className="text-amber-700 mb-4">
                        בקשת האימות שלך נשלחה ונמצאת בתהליך בדיקה. 
                        תקבל הודעה במייל כאשר הבקשה תאושר או תידחה.
                      </p>
                      <div className="text-sm text-amber-600 flex flex-col items-center justify-center">
                        <p>תאריך שליחת הבקשה:</p>
                        <p className="font-medium">{format(new Date(pendingVerification?.created_date || new Date()), 'PPP')}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" dir="rtl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-amber-800 mb-1">מסמכים מקובלים לאימות:</h3>
                            <ul className="text-amber-700 text-sm space-y-1 list-none pr-0" dir="rtl">
                              {documentTypes.map((doc, index) => (
                                <li key={index} className="text-right">
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center hover:bg-gray-50 transition-colors">
                        {verificationFile ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center">
                              <FileText className="w-10 h-10 text-[#3498DB] mb-2" />
                            </div>
                            <div>
                              <p className="font-medium">{verificationFile.name}</p>
                              <p className="text-sm text-gray-500 mb-3">
                                {(verificationFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            
                            {isLoading && (
                              <div className="w-full max-w-xs mx-auto">
                                <Progress value={uploadProgress} className="h-2 mb-2" />
                                <p className="text-xs text-gray-500">{uploadProgress}%</p>
                              </div>
                            )}
                            
                            {!isLoading && (
                              <Button 
                                onClick={handleUpload}
                                className="bg-[#3498DB] hover:bg-[#2980B9]"
                              >
                                <Upload className="w-4 h-4 ml-2" />
                                {uploadProgress === 100 ? "נשלח!" : "שליחת הבקשה"}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <h3 className="font-medium text-lg mb-1">העלו מסמך לאימות</h3>
                            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                              גררו קובץ לכאן, או לחצו לבחירת קובץ מהמחשב 
                              (PDF, JPG, PNG עד 5MB)
                            </p>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              className="hidden"
                              id="verification-file"
                            />
                            <Button
                              onClick={() => document.getElementById("verification-file").click()}
                              variant="outline"
                            >
                              בחירת קובץ
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-blue-800 mb-1">תהליך האימות</h3>
                            <p className="text-blue-700 text-sm">
                              לאחר שליחת המסמכים, הבקשה תועבר לבדיקה על ידי צוות האתר.
                              תהליך האישור עשוי להימשך עד 48 שעות עבודה.
                              עם אישור הבקשה, תקבל הודעה במייל ותוכל להמשיך לשלב הבא.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="organization">
              <Card className="shadow-lg border-none">
                <CardHeader>
                  <CardTitle>פרטי הארגון</CardTitle>
                  <CardDescription>
                    הוסיפו את פרטי הארגון שלכם כדי להתחיל לנהל מקלטים
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">שם הארגון*</Label>
                    <Input
                      id="name"
                      value={orgData.name}
                      onChange={(e) => handleOrgChange("name", e.target.value)}
                      placeholder="שם הארגון"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>סוג הארגון*</Label>
                    <RadioGroup
                      value={orgData.category}
                      onValueChange={(value) => handleOrgChange("category", value)}
                      className="flex flex-col space-y-2"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <div key={value} className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value={value} id={`category-${value}`} />
                          <Label htmlFor={`category-${value}`} className="cursor-pointer">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">כתובת אתר</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={orgData.website_url}
                      onChange={(e) => handleOrgChange("website_url", e.target.value)}
                      placeholder="https://www.example.com"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessibility_url">כתובת דף הנגישות</Label>
                    <Input
                      id="accessibility_url"
                      type="url"
                      value={orgData.accessibility_url}
                      onChange={(e) => handleOrgChange("accessibility_url", e.target.value)}
                      placeholder="https://www.example.com/accessibility"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-start space-x-2 space-x-reverse pt-4">
                    <Checkbox 
                      id="agreement" 
                      checked={agreement} 
                      onCheckedChange={setAgreement}
                    />
                    <Label htmlFor="agreement" className="text-sm">
                      אני מאשר/ת שהנני רכז/ת נגישות מוסמך/ת בארגון זה ומורשה להוסיף מידע על נגישות המקלטים
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleCreateOrganization}
                    disabled={isLoading || !orgData.name || !agreement}
                    className="bg-[#3498DB] hover:bg-[#2980B9]"
                  >
                    {isLoading ? "שומר..." : "יצירת ארגון והמשך"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
