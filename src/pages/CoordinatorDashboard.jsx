
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shelter } from "@/api/entities";
import { Branch } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building2, MapPin, CheckCircle, Shield, ShieldAlert, Clock, RefreshCw, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ShelterCard from "@/components/search/ShelterCard";

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("");
  const [user, setUser] = useState(null);
  const [filteredShelters, setFilteredShelters] = useState([]);
  
  const [orgFilter, setOrgFilter] = useState("");

  useEffect(() => {
    loadData();
    
    // Set default organization filter from URL if exists
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('org');
    const branchId = urlParams.get('branch');
    
    if (orgId) {
      // Add organization filter by setting directly in state
      setOrgFilter(orgId);
    }
    
    if (branchId) {
      setBranchFilter(branchId);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [shelters, searchQuery, branchFilter, activeFilter, orgFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      try {
        const userData = await User.me();
        setUser(userData);

        // DEMO PURPOSE: Auto-verify users as coordinators
        if (userData && !userData.is_coordinator) {
          console.log("DEMO: Auto-verifying user as coordinator from dashboard");
          await User.updateMyUserData({ 
            is_coordinator: true,
            business_verified: true 
          });
          userData.is_coordinator = true;
          userData.business_verified = true;
        }
      } catch (error) {
        console.error("Not logged in:", error);
        navigate(createPageUrl("HomePage"));
        return;
      }

      // Load shelters
      const shelterData = await Shelter.list();
      setShelters(shelterData);

      // Load branches
      const branchData = await Branch.list();
      setBranches(branchData);

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

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : "לא משויך לסניף";
  };

  const handleAddShelter = () => {
    // Update to include organization selection option
    let url;
    if (branchFilter) {
      url = createPageUrl(`ShelterForm?type=business&branch=${branchFilter}`);
    } else if (orgFilter) {
      url = createPageUrl(`ShelterForm?type=business&org=${orgFilter}`);
    } else {
      url = createPageUrl(`ShelterForm?type=business`);
    }
    navigate(url);
  };

  const applyFilters = () => {
    let filtered = [...shelters];

    filtered = filtered.filter(shelter => {
      const matchesSearch = !searchQuery || 
        shelter.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shelter.shelter_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Match either branch or organization directly
      const matchesBranch = !branchFilter || shelter.branch_id === branchFilter;
      const matchesOrg = !orgFilter || shelter.organization_id === orgFilter;
      
      let matchesStatus = true;
      if (activeFilter === "verified") {
        matchesStatus = shelter.verified === true;
      } else if (activeFilter === "unverified") {
        matchesStatus = shelter.verified === false;
      } else if (activeFilter === "drafts") {
        matchesStatus = shelter.is_draft === true;
      }
      
      return matchesSearch && (matchesBranch || matchesOrg) && matchesStatus;
    });

    setFilteredShelters(filtered);
  };

  const getStatusIcon = (shelter) => {
    if (shelter.is_draft) {
      return <Clock className="w-4 h-4 text-amber-500" />;
    } else if (shelter.verified) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else {
      return <ShieldAlert className="w-4 h-4 text-red-500" />;
    }
  };

  const getShelterTypeDisplay = (type, otherText) => {
    if (type === "אחר" && otherText) {
      return `אחר: ${otherText}`;
    }
    return type;
  };

  const getBranchWithOrgName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return "לא משויך לסניף";
    
    const org = organizations.find(o => o.id === branch.organization_id);
    return org ? `${org.name} - ${branch.name}` : branch.name;
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : "ארגון לא ידוע";
  };
  
  const getLocationDisplay = (shelter) => {
    if (shelter.branch_id) {
      // Show branch with organization
      return getBranchWithOrgName(shelter.branch_id);
    } else if (shelter.organization_id) {
      // Show organization directly
      return getOrganizationName(shelter.organization_id);
    } else {
      return "לא משויך לארגון";
    }
  };

  const getEnhancedShelter = (shelter) => {
    // Clean up empty strings and undefined values
    const branchId = shelter.branch_id && shelter.branch_id !== "" ? shelter.branch_id : null;
    const orgId = shelter.organization_id && shelter.organization_id !== "" ? shelter.organization_id : null;
    
    return {
      ...shelter,
      branch_id: branchId,
      organization_id: orgId,
      organization_name: orgId ? getOrganizationName(orgId) : null,
      branch_name: branchId ? getBranchName(branchId) : null
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">ניהול מקלטים</h1>
            <p className="text-gray-600">צפה בכל המקלטים שבאחריותך</p>
          </div>
          <Button 
            onClick={handleAddShelter}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף מקלט
          </Button>
        </div>

        <Card className="shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="חיפוש לפי כתובת או סוג מקלט"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9"
                  />
                </div>
                <div className="md:w-72">
                  <Select 
                    value={branchFilter} 
                    onValueChange={setBranchFilter}
                  >
                    <SelectTrigger className="w-full text-right" dir="rtl">
                      <SelectValue placeholder="סנן לפי סניף" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="all" className="text-right">כל הסניפים</SelectItem>
                      {organizations.map(org => {
                        const orgBranches = branches.filter(b => b.organization_id === org.id);
                        if (orgBranches.length === 0) return null;
                        
                        return [
                          <SelectItem key={org.id} value={`org-header-${org.id}`} disabled className="text-right font-semibold text-gray-500 bg-gray-50">
                            {org.name}
                          </SelectItem>,
                          ...orgBranches.map(branch => (
                            <SelectItem 
                              key={branch.id} 
                              value={branch.id} 
                              className="text-right pr-6"
                            >
                              {branch.name}
                            </SelectItem>
                          ))
                        ];
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization Filter */}
                <div className="md:w-72">
                  <Select
                    value={orgFilter}
                    onValueChange={setOrgFilter}
                  >
                    <SelectTrigger className="w-full text-right" dir="rtl">
                      <SelectValue placeholder="סנן לפי ארגון" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="all" className="text-right">כל הארגונים</SelectItem>
                      {organizations.map(org => (
                        <SelectItem
                          key={org.id}
                          value={org.id}
                          className="text-right"
                        >
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue={activeFilter} value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 gap-2" dir="rtl">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-[#3498DB] data-[state=active]:text-white"
                  >
                    הכל
                  </TabsTrigger>
                  <TabsTrigger 
                    value="verified"
                    className="data-[state=active]:bg-[#3498DB] data-[state=active]:text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-1.5" />
                    מאומתים
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unverified"
                    className="data-[state=active]:bg-[#3498DB] data-[state=active]:text-white"
                  >
                    <ShieldAlert className="w-4 h-4 ml-1.5" />
                    לא מאומתים
                  </TabsTrigger>
                  <TabsTrigger 
                    value="drafts"
                    className="data-[state=active]:bg-[#3498DB] data-[state=active]:text-white"
                  >
                    <Clock className="w-4 h-4 ml-1.5" />
                    טיוטות
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {filteredShelters.length > 0 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-gray-600">
                    {filteredShelters.length} מקלטים נמצאו
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFilteredShelters([...filteredShelters].sort((a, b) => a.address.localeCompare(b.address)))}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <RefreshCw className="w-3 h-3 ml-1" />
                    מיון לפי כתובת
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredShelters.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center">
                <Shield className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  {shelters.length === 0 ? "אין מקלטים להצגה" : "לא נמצאו מקלטים התואמים לחיפוש"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {shelters.length === 0 
                    ? "נראה שאין לך מקלטים כרגע. הוסף מקלט חדש כדי להתחיל." 
                    : "נסה לשנות את פרמטרי החיפוש או הסינון כדי למצוא את המקלטים שאתה מחפש."}
                </p>
                {shelters.length === 0 && (
                  <Button 
                    onClick={handleAddShelter}
                    className="bg-[#3498DB] hover:bg-[#2980B9]"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף מקלט ראשון
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredShelters.map((shelter) => {
              const enhancedShelter = getEnhancedShelter(shelter);
              console.log('Enhanced shelter:', enhancedShelter);

              return (
                <motion.div
                  key={shelter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShelterCard
                    shelter={enhancedShelter}
                    viewMode="coordinator"
                    onViewDetails={() => navigate(createPageUrl(`ShelterView?id=${shelter.id}&type=business`))}
                  />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
