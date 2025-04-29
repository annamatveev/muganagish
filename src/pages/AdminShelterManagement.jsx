
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shelter } from "@/api/entities";
import { Branch } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  CheckCircle, 
  Shield, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminShelterManagement() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [user, setUser] = useState(null);
  const [filteredShelters, setFilteredShelters] = useState([]);
  const [shelterToDelete, setShelterToDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [shelters, searchQuery, branchFilter, activeFilter, orgFilter]);

  const checkAdminAccess = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Check if user is admin
      const isUserAdmin = userData.email === "contact.us.moogan@gmail.com" || userData.role === "admin";
      setIsAdmin(isUserAdmin);
      
      if (!isUserAdmin) {
        alert("אין לך הרשאה לגשת לדף זה");
        navigate(createPageUrl("HomePage"));
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate(createPageUrl("HomePage"));
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all shelters (admin can see all)
      const shelterData = await Shelter.list();
      setShelters(shelterData);

      // Load all branches
      const branchData = await Branch.list();
      setBranches(branchData);

      // Load all organizations
      const organizationData = await Organization.list();
      setOrganizations(organizationData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : "לא משויך לסניף";
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : "לא משויך לארגון";
  };

  const getLocationDisplay = (shelter) => {
    if (shelter.branch_id) {
      return getBranchName(shelter.branch_id);
    } else if (shelter.organization_id) {
      return getOrganizationName(shelter.organization_id);
    }
    return "לא משויך לארגון או סניף";
  };

  const handleAddShelter = () => {
    navigate(createPageUrl("ShelterForm?type=admin"));
  };

  const handleEditShelter = (shelter) => {
    navigate(createPageUrl(`ShelterForm?id=${shelter.id}&type=admin`));
  };

  const handleDeleteShelter = async () => {
    if (!shelterToDelete) return;
    
    try {
      await Shelter.delete(shelterToDelete.id);
      setShelters(shelters.filter(shelter => shelter.id !== shelterToDelete.id));
      setShelterToDelete(null);
      alert("המקלט נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting shelter:", error);
      alert("אירעה שגיאה במחיקת המקלט");
    }
  };

  const applyFilters = () => {
    let filtered = [...shelters];

    filtered = filtered.filter(shelter => {
      const matchesSearch = !searchQuery || 
        shelter.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shelter.shelter_type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBranch = !branchFilter || shelter.branch_id === branchFilter;
      const matchesOrg = !orgFilter || shelter.organization_id === orgFilter;
      
      let matchesStatus = true;
      if (activeFilter === "verified") {
        matchesStatus = shelter.verified === true;
      } else if (activeFilter === "unverified") {
        matchesStatus = shelter.verified === false && !shelter.is_draft;
      } else if (activeFilter === "drafts") {
        matchesStatus = shelter.is_draft === true;
      } else if (activeFilter === "needs_review") {
        matchesStatus = shelter.needs_review === true;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">ניהול מקלטים - ממשק מנהל</h1>
            <p className="text-gray-600">ניהול כל המקלטים במערכת</p>
          </div>
          <Button 
            onClick={handleAddShelter}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף מקלט חדש
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
                      {branches.map(branch => (
                        <SelectItem 
                          key={branch.id} 
                          value={branch.id} 
                          className="text-right"
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <TabsTrigger 
                    value="needs_review"
                    className="data-[state=active]:bg-[#3498DB] data-[state=active]:text-white"
                  >
                    <Shield className="w-4 h-4 ml-1.5" />
                    לבדיקה
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
                    ? "נראה שאין מקלטים כרגע. הוסף מקלט חדש כדי להתחיל." 
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
            filteredShelters.map((shelter) => (
              <motion.div
                key={shelter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`shadow-sm ${shelter.is_draft ? "border-amber-200" : ""} ${shelter.needs_review ? "border-purple-200" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusIcon(shelter)}
                          <Badge className={`
                            ${shelter.verified ? "bg-green-100 text-green-800" : 
                              shelter.is_draft ? "bg-amber-100 text-amber-800" : 
                              shelter.needs_review ? "bg-purple-100 text-purple-800" :
                              "bg-red-100 text-red-800"}`}
                          >
                            {shelter.is_draft ? "טיוטה" : 
                             shelter.verified ? "מאומת" : 
                             shelter.needs_review ? "ממתין לבדיקה" : 
                             "לא מאומת"}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {getShelterTypeDisplay(shelter.shelter_type, shelter.shelter_type_other)}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-2">
                          <MapPin className="w-4 h-4 text-gray-500 ml-1" />
                          <h3 className="font-medium">{shelter.address}</h3>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditShelter(shelter)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          ערוך
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShelterToDelete(shelter)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          מחק
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {shelter.floor_number && (
                        <div>
                          <span className="text-gray-500 ml-1">קומה/מיקום:</span>
                          {shelter.floor_number}
                        </div>
                      )}
                      {shelter.step_free_access !== undefined && (
                        <div>
                          <span className="text-gray-500 ml-1">גישה ללא מדרגות:</span>
                          {shelter.step_free_access ? "כן" : "לא"}
                        </div>
                      )}
                      {shelter.maneuvering_space !== undefined && (
                        <div>
                          <span className="text-gray-500 ml-1">מרחב תמרון:</span>
                          {shelter.maneuvering_space ? "מספק" : "לא מספק"}
                        </div>
                      )}
                      {shelter.submitted_by && (
                        <div>
                          <span className="text-gray-500 ml-1">דווח ע"י:</span>
                          {shelter.submitted_by}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-3.5 h-3.5 ml-1" />
                      {getLocationDisplay(shelter)}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!shelterToDelete} onOpenChange={() => setShelterToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את המקלט?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. המידע על המקלט יימחק לצמיתות מהמערכת.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteShelter} className="bg-red-600 hover:bg-red-700">
              מחק מקלט
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
