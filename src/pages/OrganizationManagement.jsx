
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Building2, ExternalLink, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import OrganizationForm from "../components/organization/OrganizationForm";

export default function OrganizationManagement() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      try {
        // Get current user
        const userData = await User.me();
        setUser(userData);
        
        // Check if user exists but isn't a coordinator
        if (userData && !userData.is_coordinator) {
          // Make them a coordinator automatically
          await User.updateMyUserData({ is_coordinator: true });
          userData.is_coordinator = true;
        }
      } catch (error) {
        console.error("Not logged in:", error);
        navigate(createPageUrl("HomePage"));
        return;
      }

      // Load organizations
      const organizationData = await Organization.list();
      setOrganizations(organizationData);
    } catch (error) {
      console.error("Error loading data:", error);
      navigate(createPageUrl("HomePage"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setCurrentOrganization(null);
    loadData();
    
    // If this was a new organization, ask if they want to add a branch
    if (!currentOrganization) {
      const wantToAddBranch = window.confirm("הארגון נוצר בהצלחה! האם תרצה להוסיף סניף?");
      if (wantToAddBranch) {
        navigate(createPageUrl("BranchManagement"));
      }
    }
  };

  const handleAddOrganization = () => {
    // Redirect to BusinessVerification page for new organization
    navigate(createPageUrl("BusinessVerification"));
  };

  const handleEditOrganization = (organization) => {
    setCurrentOrganization(organization);
    setShowForm(true);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      bank: "בנק",
      municipality: "עירייה",
      private_business: "עסק פרטי",
      nonprofit: "ארגון ללא מטרות רווח",
      other: "אחר"
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">ניהול ארגונים</h1>
            <p className="text-gray-600">צור וערוך ארגונים שבאחריותך</p>
          </div>
          <Button 
            onClick={handleAddOrganization}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף ארגון
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <OrganizationForm 
                organizationData={currentOrganization} 
                onSuccess={handleFormSuccess} 
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : organizations.length === 0 ? (
                <Card>
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">אין ארגונים להצגה</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      נראה שאין לך ארגונים כרגע. הוסף ארגון חדש כדי להתחיל.
                    </p>
                    <Button 
                      onClick={handleAddOrganization}
                      className="bg-[#3498DB] hover:bg-[#2980B9]"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      הוסף ארגון ראשון
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {organizations.map((organization) => (
                    <motion.div
                      key={organization.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-xl mb-1">
                                {organization.name}
                              </CardTitle>
                              <CardDescription>
                                {getCategoryLabel(organization.category)}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOrganization(organization)}
                            >
                              <Edit className="w-4 h-4 ml-1" />
                              ערוך
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {organization.website_url && (
                              <a
                                href={organization.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-[#3498DB] hover:underline"
                              >
                                <Globe className="w-4 h-4 ml-2" />
                                אתר האינטרנט
                                <ExternalLink className="w-3 h-3 mr-1" />
                              </a>
                            )}
                            {organization.accessibility_url && (
                              <a
                                href={organization.accessibility_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-[#3498DB] hover:underline"
                              >
                                <Building2 className="w-4 h-4 ml-2" />
                                דף הנגישות
                                <ExternalLink className="w-3 h-3 mr-1" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
