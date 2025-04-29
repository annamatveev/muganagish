
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shelter } from "@/api/entities";
import { User } from "@/api/entities";
import { Branch } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save, Shield, Plus, Map, X } from "lucide-react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

import ShelterTypeSelector from "../components/shelter/ShelterTypeSelector";
import AccessibilityDetails from "../components/shelter/AccessibilityDetails";
import FileUploader from "../components/shelter/FileUploader";
import AddressAutocomplete from "../components/address/AddressAutocomplete";
import { SendEmail } from "@/api/integrations";
import ShelterMap from "../components/map/ShelterMap";
import StreetView from "../components/map/StreetView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// New map location preview implementation
const LocationPreviewDialog = ({ isOpen, onClose, address, lat, lng }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl bg-white rounded-lg shadow-xl p-4">
        <button 
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold mb-2">תצוגת מיקום המקלט</h2>
        <p className="text-gray-600 mb-4">{address}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">מפה</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full relative rounded-md">
                {lat && lng ? (
                  <ShelterMap 
                    shelters={[{address, lat, lng}]} 
                    center={{lat, lng}} 
                    radius={0}
                    showRadius={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p>נקודות ציון חסרות</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">תצוגת רחוב</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full relative rounded-md">
                {lat && lng ? (
                  <StreetView lat={lat} lng={lng} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p>נקודות ציון חסרות</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function ShelterForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    address: "",
    shelter_type: "",
    shelter_type_other: "",
    floor_number: "",
    area_description: "",
    directions: "",
    step_free_access: true,
    path_width: null,
    door_width: null,
    stairs_count: null,
    handrails_present: false,
    maneuvering_space: false,
    threshold_height: null,
    ramp_present: false,
    navigation_system: "none",
    navigation_system_other: "",
    accessibility_aids: [],
    photos: [],
    is_draft: false,
    branch_id: "",
    verified: false,
    lat: null,
    lng: null,
    organization_id: "",
  });
  const [disclaimer, setDisclaimer] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [returnToShelterForm, setReturnToShelterForm] = useState(false);
  const [tempShelterData, setTempShelterData] = useState(null);
  const [directlyUnderOrg, setDirectlyUnderOrg] = useState(false);
  const [showLocationPreview, setShowLocationPreview] = useState(false);
  
  // Determine the form type (business or random shelter)
  const [formType, setFormType] = useState("random"); // default to random

  useEffect(() => {
    // Check URL for parameters
    const urlParams = new URLSearchParams(window.location.search);
    const branchId = urlParams.get('branch');
    const shelterId = urlParams.get('id');
    const type = urlParams.get('type');
    const orgId = urlParams.get('org');
    const claimId = urlParams.get('claim'); // For claiming an existing shelter
    
    // Set form type based on URL parameter or branch ID
    if (type === 'business' || branchId || orgId) {
      setFormType("business");
      if (branchId) {
        setFormData(prev => ({...prev, branch_id: branchId}));
      }
      if (orgId) {
        setFormData(prev => ({...prev, organization_id: orgId}));
        setDirectlyUnderOrg(true);
      }
    }
    
    // If we're editing an existing shelter
    if (shelterId) {
      loadShelterData(shelterId);
    }
    
    // If we're claiming an existing shelter
    if (claimId) {
      loadShelterDataForClaim(claimId);
    }
    
    // Check if we're returning from branch creation
    if (sessionStorage.getItem('returnToShelterForm')) {
      const savedData = JSON.parse(sessionStorage.getItem('tempShelterData') || '{}');
      const newBranchId = sessionStorage.getItem('newBranchId');
      
      if (savedData) {
        setFormData({...savedData, branch_id: newBranchId || ''});
      }
      
      sessionStorage.removeItem('returnToShelterForm');
      sessionStorage.removeItem('tempShelterData');
      sessionStorage.removeItem('newBranchId');
    }
    
    // Try to load existing draft from localStorage for guest users (only for random shelters)
    const loadDraft = () => {
      if (formType !== "random") return;
      
      const savedDraft = localStorage.getItem("shelter_draft");
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          // Check if draft is still valid (less than 6 months old)
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          if (parsedDraft.savedAt && new Date(parsedDraft.savedAt) > sixMonthsAgo) {
            setFormData({ ...formData, ...parsedDraft.data });
          } else {
            // Draft expired, remove it
            localStorage.removeItem("shelter_draft");
          }
        } catch (error) {
          console.error("Error parsing draft:", error);
          localStorage.removeItem("shelter_draft");
        }
      }
    };

    // Check if user is logged in
    const checkUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        // If logged in as coordinator, load branches for the branch selector
        if (userData.is_coordinator) {
          setIsLoadingBranches(true);
          try {
            const branchData = await Branch.list();
            setBranches(branchData);
            
            // Also load organizations
            setIsLoadingOrgs(true);
            const orgData = await Organization.list();
            // Filter to only show organizations owned by current user
            const userOrgs = orgData.filter(org => org.owner_id === userData.id);
            setOrganizations(userOrgs);
          } catch (error) {
            console.error("Error loading branches/organizations:", error);
          } finally {
            setIsLoadingBranches(false);
            setIsLoadingOrgs(false);
          }
        } else {
          // Load draft for non-coordinators with random shelters
          if (formType === "random") {
            loadDraft();
          }
        }
      } catch (error) {
        // Not logged in, load draft as guest
        if (formType === "random") {
          loadDraft();
        } else {
          // Business shelters require login
          navigate(createPageUrl("HomePage"));
        }
      }
    };
    
    checkUser();
  }, []);

  const loadShelterDataForClaim = async (shelterId) => {
    try {
      // Get all shelters and find the one to claim
      const shelters = await Shelter.list();
      const shelter = shelters.find(s => s.id === shelterId);
      
      if (shelter) {
        // Remove ID and other fields that should be unique
        const { id, branch_id, verified, submitted_by, is_draft, ...claimData } = shelter;
        setFormData({...formData, ...claimData, is_draft: true});
        setFormType("business");
      }
    } catch (error) {
      console.error("Error loading shelter data for claim:", error);
    }
  };

  const loadShelterData = async (shelterId) => {
    try {
      // This would ideally be a direct fetch of the shelter by ID
      // But for now we'll get all shelters and filter
      const shelters = await Shelter.list();
      const shelter = shelters.find(s => s.id === shelterId);
      
      if (shelter) {
        setFormData(shelter);
        // If this is a branch shelter, set form type accordingly
        if (shelter.branch_id) {
          setFormType("business");
        }
      }
    } catch (error) {
      console.error("Error loading shelter data:", error);
    }
  };

  const handleChange = (field, value) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveLocalDraft = () => {
    // Only save drafts for random shelters
    if (formType !== "random") return;
    
    localStorage.setItem("shelter_draft", JSON.stringify({
      data: formData,
      savedAt: new Date().toISOString()
    }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleAddressSelect = (location) => {
    if (location) {
      console.log("Selected location with coordinates:", location);
      setFormData(prev => ({
        ...prev,
        address: location.address,
        lat: location.lat,
        lng: location.lng
      }));
    }
  };

  const handleSubmit = async (asDraft = false) => {
    setIsLoading(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        // For business shelters, respect the asDraft parameter
        // For regular shelters, always submit as final
        is_draft: formType === "business" ? asDraft : false, 
      };

      // Remove any shelter_id property if it exists to let the system generate one
      if (dataToSubmit.shelter_id === null || dataToSubmit.shelter_id === undefined) {
        delete dataToSubmit.shelter_id;
      }

      console.log("Submitting shelter with data:", dataToSubmit);
    
      // Add verification status and submitted_by
      if (user) {
        dataToSubmit.submitted_by = user.email;
        dataToSubmit.verified = user.is_coordinator && formType === "business";
      }

      // For regular shelters, mark them for admin review
      if (formType === "random") {
        dataToSubmit.needs_review = true;  // Add this flag for admin review
        dataToSubmit.is_draft = false; // Ensure regular shelters are never drafts
      }
      
      const newShelter = await Shelter.create(dataToSubmit);
      
      // For regular shelters, send email notification to admins
      if (formType === "random") {
        try {
          await SendEmail({
            to: "contact.us.moogan@gmail.com",
            subject: "דיווח חדש על מקלט ממתין לבדיקה",
            body: `
              <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #3498DB; margin-bottom: 20px;">התקבל דיווח חדש על מקלט</h2>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p><strong>כתובת:</strong> ${formData.address}</p>
                  <p><strong>סוג מקלט:</strong> ${formData.shelter_type}${formData.shelter_type === "אחר" ? ` (${formData.shelter_type_other})` : ''}</p>
                  <p><strong>דווח על ידי:</strong> ${user ? user.email : "משתמש לא מזוהה"}</p>
              </div>
              
              <p>אנא בדקו את הדיווח בממשק הניהול:</p>
              <a href="${window.location.origin}${createPageUrl("AdminModeration")}" 
                 style="display: inline-block; background-color: #3498DB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                צפייה בדיווחים הממתינים לאישור
              </a>
            </div>
          `
        });
      } catch (error) {
        console.error("Error sending admin notification:", error);
      }
    }
    
    // Navigate to appropriate page
    if (formType === "business") {
      navigate(createPageUrl("CoordinatorDashboard" + (formData.branch_id ? `?branch=${formData.branch_id}` : formData.organization_id ? `?org=${formData.organization_id}` : "")));
    } else {
      navigate(createPageUrl("HomePage"));
    }
  } catch (error) {
    console.error("Error submitting shelter:", error);
    alert("אירעה שגיאה בשמירת המקלט. אנא נסו שוב.");
  } finally {
    setIsLoading(false);
  }
};

  const steps = [
    { 
      number: "1", 
      title: "פרטים בסיסיים", 
      description: "מיקום וסוג המקלט" 
    },
    { 
      number: "2", 
      title: "נגישות", 
      description: "פרטי נגישות המקלט" 
    },
    { 
      number: "3", 
      title: "מידע נוסף", 
      description: "תמונות ואישור" 
    }
  ];

  const handleAddNewBranch = () => {
    // Save current shelter form data in session storage
    setTempShelterData(formData);
    sessionStorage.setItem('tempShelterData', JSON.stringify(formData));
    sessionStorage.setItem('returnToShelterForm', 'true');
    
    // Navigate to BranchManagement with return parameter
    navigate(createPageUrl("BranchManagement?returnToShelter=true"));
  };


  // Check if this is a coordinator adding from dashboard
  const isBusinessShelterForm = formType === "business";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
         
          {user?.is_coordinator ? (
            <span className="text-sm text-green-600 font-medium flex items-center">
              <Shield className="w-4 h-4 ml-1" />
              מחובר כרכז נגישות
            </span>
          ) : isBusinessShelterForm ? (
            <span className="text-sm text-orange-600 font-medium flex items-center">
              <Building2 className="w-4 h-4 ml-1" />
              דיווח עבור עסק
            </span>
          ) : null}
        </div>

        {!isBusinessShelterForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">מה סוג הדיווח?</h3>
            <p className="text-blue-700 text-sm">
            מקלטים אלה מדווחים על ידי דיירים, מבקרים או עוברי אורח שאינם הבעלים או המנהלים של המקום.
ייתכן שהמידע חלקי או לא מעודכן.
אנא נסו לפרט ככל האפשר — מיקום מדויק, תנאי גישה, שעות פתיחה וכל פרט נוסף — כדי לעזור לאנשים עם מוגבלות ולאחרים למצוא מקלט מתאים במהירות בעת חירום.

המידע שתמסרו אינו עובר אימות, והאחריות על דיוקו אינה חלה עליכם.
גם מידע חלקי או ראשוני עשוי להציל חיים!
אל תהססו לדווח ולשתף כל פרט שברשותכם.
            </p>
          </div>
        )}

        <Card className="shadow-lg border-none mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isBusinessShelterForm
                ? "הוספת מקלט לסניף"
                : "דיווח מזדמן על מקלט"}
            </CardTitle>
            <CardDescription>
              {isBusinessShelterForm
                ? "תיעוד מקלט השייך לארגון שלך עבור לקוחות ומבקרים"
                : "המידע שתספקו על מקלט ציבורי יעזור לאנשים עם מוגבלות למצוא מקלט מתאים בעת חירום"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue={`step-${currentStep}`} value={`step-${currentStep}`} dir="rtl">
              <div className="mb-8">
                <TabsList className="grid w-full grid-cols-3 h-auto gap-4 bg-transparent p-0">
                  {steps.map((step, index) => (
                    <TabsTrigger 
                      key={index} 
                      value={`step-${index}`}
                      onClick={() => setCurrentStep(index)}
                      disabled={index > 0 && ((!isBusinessShelterForm && !formData.address) || !formData.shelter_type)}
                      className={`relative border bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors
                        [&[data-state=active]]:bg-blue-50 [&[data-state=active]]:border-blue-200
                        ${currentStep > index ? "text-green-500" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium
                          ${currentStep === index ? "bg-[#3498DB] text-white" : 
                            currentStep > index ? "bg-green-500 text-white" : 
                            "bg-gray-100 text-gray-500"}`}
                        >
                          {step.number}
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                        </div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* First tab/step content - show branch or organization selection */}
              <TabsContent value="step-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {isBusinessShelterForm && (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 space-x-reverse mb-3">
                        <Checkbox 
                          id="directlyUnderOrg" 
                          checked={directlyUnderOrg} 
                          onCheckedChange={setDirectlyUnderOrg}
                        />
                        <Label htmlFor="directlyUnderOrg" className="cursor-pointer">
                          המקלט שייך ישירות לארגון (ללא סניף ספציפי)
                        </Label>
                      </div>
                        
                      {directlyUnderOrg ? (
                        /* Organization selection */
                        <div className="space-y-3">
                          <Label htmlFor="organization" className="text-base font-medium">
                            שייך לארגון*
                          </Label>
                          <div className="flex gap-3 items-center">
                            <div className="flex-1">
                              <Select
                                value={formData.organization_id || ""}
                                onValueChange={(value) => {
                                  handleChange("organization_id", value);
                                  handleChange("branch_id", ""); // Clear branch selection
                                }}
                                required
                              >
                                <SelectTrigger id="organization" className="text-right">
                                  <SelectValue placeholder="בחר ארגון" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                  {isLoadingOrgs ? (
                                    <SelectItem value={null} disabled className="text-right">
                                      טוען ארגונים...
                                    </SelectItem>
                                  ) : organizations.length > 0 ? (
                                    organizations.map((org) => (
                                      <SelectItem key={org.id} value={org.id} className="text-right">
                                        {org.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value={null} disabled className="text-right">
                                      לא נמצאו ארגונים
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              type="button"
                              variant="outline"
                              className="whitespace-nowrap"
                              onClick={() => navigate(createPageUrl("OrganizationManagement"))}
                            >
                              <Plus className="h-4 w-4 ml-1" />
                              הוסף ארגון חדש
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Branch selection */
                        <div className="space-y-3">
                          <Label htmlFor="branch" className="text-base font-medium">
                            שייך לסניף*
                          </Label>
                          <div className="flex gap-3 items-center">
                            <div className="flex-1">
                              <Select
                                value={formData.branch_id || ""}
                                onValueChange={(value) => handleChange("branch_id", value)}
                                required
                              >
                                <SelectTrigger id="branch" className="text-right" dir="rtl">
                                  <SelectValue placeholder="בחר סניף" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                  {isLoadingBranches ? (
                                    <SelectItem value={null} disabled className="text-right">
                                      טוען סניפים...
                                    </SelectItem>
                                  ) : branches.length > 0 ? (
                                    branches.map((branch) => (
                                      <SelectItem key={branch.id} value={branch.id} className="text-right">
                                        {branch.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value={null} disabled className="text-right">
                                      לא נמצאו סניפים
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              type="button"
                              variant="outline"
                              className="whitespace-nowrap"
                              onClick={handleAddNewBranch}
                            >
                              <Plus className="h-4 w-4 ml-1" />
                              הוסף סניף חדש
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!isBusinessShelterForm && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="address" className="text-base font-medium">כתובת המקלט</Label>
                        {formData.lat && formData.lng && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowLocationPreview(true)}
                          >
                            <Map className="w-4 h-4 ml-2" />
                            הצג במפה
                          </Button>
                        )}
                      </div>
                      <AddressAutocomplete
                        value={formData.address}
                        onChange={(value) => handleChange("address", value)}
                        onLocationSelect={handleAddressSelect}
                        placeholder="למשל: רחוב הרצל 1, תל אביב"
                        required={!isBusinessShelterForm}
                      />

                      {/* Add the location preview dialog */}
                      <LocationPreviewDialog 
                        isOpen={showLocationPreview}
                        onClose={() => setShowLocationPreview(false)}
                        address={formData.address}
                        lat={formData.lat}
                        lng={formData.lng}
                      />
                    </div>
                  )}

                  <ShelterTypeSelector
                    value={formData.shelter_type}
                    onChange={(value) => handleChange("shelter_type", value)}
                    otherValue={formData.shelter_type_other}
                    onOtherChange={(value) => handleChange("shelter_type_other", value)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor_number" className="text-base font-medium">
                        קומה
                      </Label>
                      <Input
                        id="floor_number"
                        value={formData.floor_number}
                        onChange={(e) => handleChange("floor_number", e.target.value)}
                        placeholder="למשל: קומה 2"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area_description" className="text-base font-medium">
                        אזור במבנה
                      </Label>
                      <Input
                        id="area_description"
                        value={formData.area_description}
                        onChange={(e) => handleChange("area_description", e.target.value)}
                        placeholder="למשל: אגף מזרחי"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="directions" className="text-base font-medium">
                      איך מגיעים למקלט
                    </Label>
                    <Textarea
                      id="directions"
                      value={formData.directions}
                      onChange={(e) => handleChange("directions", e.target.value)}
                      placeholder="תיאור דרכי ההגעה למקלט"
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="step-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AccessibilityDetails
                    stepFreeAccess={formData.step_free_access}
                    onStepFreeAccessChange={(value) => handleChange("step_free_access", value)}
                    pathWidth={formData.path_width}
                    onPathWidthChange={(value) => handleChange("path_width", value)}
                    doorWidth={formData.door_width}
                    onDoorWidthChange={(value) => handleChange("door_width", value)}
                    stairsCount={formData.stairs_count}
                    onStairsCountChange={(value) => handleChange("stairs_count", value)}
                    handrailsPresent={formData.handrails_present}
                    onHandrailsPresentChange={(value) => handleChange("handrails_present", value)}
                    maneuveringSpace={formData.maneuvering_space}
                    onManeuveringSpaceChange={(value) => handleChange("maneuvering_space", value)}
                    thresholdHeight={formData.threshold_height}
                    onThresholdHeightChange={(value) => handleChange("threshold_height", value)}
                    rampPresent={formData.ramp_present}
                    onRampPresentChange={(value) => handleChange("ramp_present", value)}
                    navigationSystem={formData.navigation_system}
                    onNavigationSystemChange={(value) => handleChange("navigation_system", value)}
                    navigationSystemOther={formData.navigation_system_other}
                    onNavigationSystemOtherChange={(value) => handleChange("navigation_system_other", value)}
                    accessibilityAids={formData.accessibility_aids}
                    onAccessibilityAidsChange={(value) => handleChange("accessibility_aids", value)}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="step-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <FileUploader
                    value={formData.photos}
                    onChange={(photos) => handleChange("photos", photos)}
                    maxFiles={5}
                  />

                  {!isBusinessShelterForm && (
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <Checkbox
                        id="disclaimer"
                        checked={disclaimer}
                        onCheckedChange={setDisclaimer}
                      />
                      <Label htmlFor="disclaimer" className="text-sm">
                        אני מאשר/ת שהמידע שהוזן נכון ככל הידוע לי ואינו מהווה מידע מאומת.
                      </Label>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between pt-6 flex-wrap gap-3">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isLoading}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה
              </Button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-3">
              {/* Draft save button for business shelters in every step - only when creating new */}
              {isBusinessShelterForm && !formData.id && (
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading || (formData.shelter_type === "" && currentStep > 0)}
                  className="bg-gray-100 hover:bg-gray-200"
                >
                  <Save className="w-4 h-4 ml-2" />
                  שמירת טיוטה
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={(!isBusinessShelterForm && !formData.address) || !formData.shelter_type || (isBusinessShelterForm && !formData.branch_id && !formData.organization_id)}
                  className="bg-[#3498DB] hover:bg-[#2980B9]"
                >
                  המשך
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={
                      isLoading || 
                      (!isBusinessShelterForm && !formData.address) || 
                      !formData.shelter_type || 
                      (!isBusinessShelterForm && !disclaimer) ||
                      (isBusinessShelterForm && !formData.branch_id && !formData.formData.organization_id)
                    }
                    className="bg-[#2ECC71] hover:bg-[#27AE60]"
                  >
                    {formData.id ? "עדכון המקלט" : "שליחת הדיווח"}
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
