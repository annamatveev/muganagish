import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Mail, Phone, Save, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function UserProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const user = await User.me();
        setUserData(user);
        setFormData({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || ""
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        navigate(createPageUrl("HomePage"));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Can only update phone (email and full_name are managed by the platform)
      await User.updateMyUserData({
        phone: formData.phone
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("אירעה שגיאה בשמירת הפרופיל. אנא נסו שנית.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-none animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-md mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#3498DB]/10 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-[#3498DB]" />
                </div>
              </div>
              <CardTitle className="text-center text-xl">הפרופיל שלי</CardTitle>
              <CardDescription className="text-center">
                עדכון פרטי המשתמש שלך
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">שם מלא</Label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    className="pr-10"
                    placeholder="השם המלא שלך"
                    disabled // Full name is managed by the platform
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">דוא"ל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="pr-10"
                    placeholder="your@email.com"
                    dir="ltr"
                    disabled // Email is managed by the platform
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="pr-10"
                    placeholder="050-0000000"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className={saveSuccess ? "bg-green-500 hover:bg-green-600" : "bg-[#3498DB] hover:bg-[#2980B9]"}
              >
                <Save className="w-4 h-4 ml-2" />
                {saveSuccess ? "נשמר בהצלחה!" : (isSaving ? "שומר..." : "שמירה")}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}