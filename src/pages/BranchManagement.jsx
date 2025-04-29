
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Branch } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, MapPin, Phone, Mail, User as UserIcon, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import BranchForm from "../components/branch/BranchForm";

export default function BranchManagement() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrgId, setFilterOrgId] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
    
    // Set default organization filter from URL if exists
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('org');
    if (orgId) {
      setFilterOrgId(orgId);
      
      // Also set the organization_id in formData for new branches
      setFormData(prev => ({
        ...prev,
        organization_id: orgId
      }));
    }
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
      // Filter to only show organizations owned by current user
      const userData = await User.me();
      const userOrgs = organizationData.filter(org => org.owner_id === userData.id);
      setOrganizations(userOrgs);

      // Load branches filtered by user's organizations
      const branchData = await Branch.list();
      if (userOrgs.length > 0) {
        const userOrgIds = userOrgs.map(org => org.id);
        const filteredBranches = branchData.filter(branch => 
          userOrgIds.includes(branch.organization_id)
        );
        setBranches(filteredBranches);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      navigate(createPageUrl("HomePage"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = async (newBranch) => {
    setShowForm(false);
    setCurrentBranch(null);
    await loadData();

    // Ask if user wants to add a shelter
    const wantToAddShelter = window.confirm("הסניף נוצר בהצלחה! האם תרצה להוסיף מקלט לסניף זה?");
    if (wantToAddShelter) {
      navigate(createPageUrl(`ShelterForm?branch=${newBranch.id}`));
    } else {
      // If they don't want to add a shelter, redirect to coordinator dashboard with the branch filter
      navigate(createPageUrl(`CoordinatorDashboard?branch=${newBranch.id}`));
    }
  };

  const handleEditBranch = (branch) => {
    setCurrentBranch(branch);
    setShowForm(true);
  };

  const handleAddBranch = () => {
    setCurrentBranch(null);
    setShowForm(true);
    
    // Pre-select organization if filter is active
    if (filterOrgId) {
      setFormData(prev => ({
        ...prev,
        organization_id: filterOrgId
      }));
    }
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : "ארגון לא ידוע";
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = !searchQuery || 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.coordinator_name && branch.coordinator_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesOrg = !filterOrgId || branch.organization_id === filterOrgId;
    
    return matchesSearch && matchesOrg;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">ניהול סניפים</h1>
            <p className="text-gray-600">צור וערוך סניפים שבאחריותך</p>
          </div>
          <Button 
            onClick={handleAddBranch}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף סניף
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
              <BranchForm 
                branchData={currentBranch} 
                onSuccess={handleFormSuccess} 
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Filters */}
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="חפש לפי שם, כתובת או רכז"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full md:w-52">
                      <Select 
                        value={filterOrgId} 
                        onValueChange={setFilterOrgId}
                      >
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="סנן לפי ארגון" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value={null}>כל הארגונים</SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
              ) : filteredBranches.length === 0 ? (
                <Card>
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      {branches.length === 0 ? "אין סניפים להצגה" : "לא נמצאו סניפים התואמים לחיפוש"}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      {branches.length === 0 
                        ? "נראה שאין לך סניפים כרגע. הוסף סניף חדש כדי להתחיל." 
                        : "נסה לשנות את פרמטרי החיפוש או הסינון כדי למצוא את הסניפים שאתה מחפש."}
                    </p>
                    {branches.length === 0 && (
                      <Button 
                        onClick={handleAddBranch}
                        className="bg-[#3498DB] hover:bg-[#2980B9]"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף סניף ראשון
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredBranches.map((branch) => (
                    <motion.div
                      key={branch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <div>
                              <CardTitle className="text-xl mb-1">
                                {branch.name}
                              </CardTitle>
                              <CardDescription className="flex items-center">
                                <Building2 className="w-3.5 h-3.5 ml-1" />
                                {getOrganizationName(branch.organization_id)}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBranch(branch)}
                            >
                              <Edit className="w-4 h-4 ml-1" />
                              ערוך
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span>{branch.address}</span>
                          </div>
                          
                          {branch.coordinator_name && (
                            <div className="border-t pt-3 mt-3">
                              <h4 className="text-sm font-medium mb-2">רכז/ת נגישות:</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="w-4 h-4 text-gray-500" />
                                  <span>{branch.coordinator_name}</span>
                                </div>
                                
                                {branch.coordinator_email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <a href={`mailto:${branch.coordinator_email}`} className="text-[#3498DB] hover:underline">
                                      {branch.coordinator_email}
                                    </a>
                                  </div>
                                )}
                                
                                {branch.coordinator_phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <a href={`tel:${branch.coordinator_phone}`} className="text-[#3498DB] hover:underline">
                                      {branch.coordinator_phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
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
