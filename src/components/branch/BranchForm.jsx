
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/api/entities";
import { Branch } from "@/api/entities";
import { User } from "@/api/entities";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import AddressAutocomplete from "../address/AddressAutocomplete";

export default function BranchForm({ branchData, onSuccess, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: branchData?.name || "",
    address: branchData?.address || "",
    coordinator_name: branchData?.coordinator_name || "",
    coordinator_email: branchData?.coordinator_email || "",
    coordinator_phone: branchData?.coordinator_phone || "",
    organization_id: branchData?.organization_id || ""
  });
  const [user, setUser] = useState(null);
  const [isSelfCoordinator, setIsSelfCoordinator] = useState(false);

  useEffect(() => {
    // Load organizations and user data
    const loadData = async () => {
      setIsLoadingOrgs(true);
      try {
        // Get user data
        const userData = await User.me();
        setUser(userData);
        
        // Load organizations
        const orgs = await Organization.list();
        // Filter to only show organizations owned by current user
        const userOrgs = orgs.filter(org => org.owner_id === userData.id);
        setOrganizations(userOrgs);
        
        // If no organization is selected yet and there's only one, select it
        if (!formData.organization_id && userOrgs.length === 1) {
          setFormData(prev => ({ ...prev, organization_id: userOrgs[0].id }));
        }
        
        // If user only has one org, use that
        if (userData.organization_id && !formData.organization_id) {
          setFormData(prev => ({ ...prev, organization_id: userData.organization_id }));
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  useEffect(() => {
    // If user selects themselves as coordinator, auto-fill the coordinator fields
    if (isSelfCoordinator && user) {
      setFormData(prev => ({
        ...prev,
        coordinator_name: user.full_name || prev.coordinator_name,
        coordinator_email: user.email || prev.coordinator_email,
        coordinator_phone: user.phone || prev.coordinator_phone
      }));
    }

    // If user unselects themselves as coordinator, reset the coordinator fields
    if (!isSelfCoordinator) {
      setFormData(prev => ({
        ...prev,
        coordinator_name: "",
        coordinator_email: "",
        coordinator_phone: ""
      }));
    }
  }, [isSelfCoordinator, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      if (branchData?.id) {
        // Update existing branch
        await Branch.update(branchData.id, formData);
        onSuccess();
      } else {
        // Create new branch
        const newBranch = await Branch.create(formData);
        onSuccess(newBranch);
      }
    } catch (error) {
      console.error("Error saving branch:", error);
      alert("אירעה שגיאה בשמירת הסניף. אנא נסו שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-none">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {branchData?.id ? "עריכת סניף" : "הוספת סניף חדש"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization_id">ארגון*</Label>
            <Select
              value={formData.organization_id}
              onValueChange={(value) => handleChange("organization_id", value)}
              required
            >
              <SelectTrigger id="organization_id" dir="rtl">
                <SelectValue placeholder="בחר ארגון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_org" disabled>
                  {isLoadingOrgs ? "טוען ארגונים..." : "לא נמצאו ארגונים. אנא צור ארגון קודם."}
                </SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">שם הסניף*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="שם הסניף"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">כתובת*</Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => handleChange("address", value)}
              label=""
              placeholder="כתובת הסניף"
              required
            />
          </div>

          <div className="border-t pt-4 mt-2">
            <h3 className="text-lg font-medium mb-4">פרטי רכז/ת הנגישות</h3>
            
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Checkbox 
                id="self_coordinator" 
                checked={isSelfCoordinator}
                onCheckedChange={setIsSelfCoordinator}
              />
              <Label htmlFor="self_coordinator" className="cursor-pointer flex items-center">
                <UserCheck className="w-4 h-4 ml-1 text-blue-500" />
                אני רכז/ת הנגישות
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinator_name">שם רכז/ת הנגישות</Label>
              <Input
                id="coordinator_name"
                value={formData.coordinator_name}
                onChange={(e) => handleChange("coordinator_name", e.target.value)}
                placeholder="שם מלא"
                disabled={isSelfCoordinator}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinator_email">דוא"ל רכז/ת הנגישות</Label>
              <Input
                id="coordinator_email"
                type="email"
                value={formData.coordinator_email}
                onChange={(e) => handleChange("coordinator_email", e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
                disabled={isSelfCoordinator}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinator_phone">טלפון רכז/ת הנגישות</Label>
              <Input
                id="coordinator_phone"
                value={formData.coordinator_phone}
                onChange={(e) => handleChange("coordinator_phone", e.target.value)}
                placeholder="052-1234567"
                disabled={isSelfCoordinator}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || !formData.name || !formData.address || !formData.organization_id}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            {isLoading ? "שומר..." : "שמירה והוספת סניף"}
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
