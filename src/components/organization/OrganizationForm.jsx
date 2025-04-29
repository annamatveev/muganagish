
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { ArrowLeft } from "lucide-react";

export default function OrganizationForm({ organizationData, onSuccess, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organizationData?.name || "",
    category: organizationData?.category || "private_business",
    website_url: organizationData?.website_url || "",
    accessibility_url: organizationData?.accessibility_url || "",
    verification_file: organizationData?.verification_file || ""
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      let user = await User.me();
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        owner_id: user.id
      };
      
      if (organizationData?.id) {
        // Update existing organization
        await Organization.update(organizationData.id, dataToSubmit);
      } else {
        // Create new organization
        const newOrg = await Organization.create(dataToSubmit);
        
        // Update user with organization ID
        await User.updateMyUserData({ 
          organization_id: newOrg.id,
          is_coordinator: true 
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving organization:", error);
      alert("אירעה שגיאה בשמירת הארגון. אנא נסו שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  const categoryLabels = {
    bank: "בנק",
    municipality: "עירייה",
    private_business: "עסק פרטי",
    nonprofit: "ארגון ללא מטרות רווח",
    other: "אחר"
  };

  return (
    <Card className="shadow-lg border-none">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {organizationData?.id ? "עריכת ארגון" : "הוספת ארגון חדש"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם הארגון*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="שם הארגון"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>סוג הארגון*</Label>
            <RadioGroup
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
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
              value={formData.website_url}
              onChange={(e) => handleChange("website_url", e.target.value)}
              placeholder="https://www.example.com"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibility_url">כתובת דף הנגישות</Label>
            <Input
              id="accessibility_url"
              type="url"
              value={formData.accessibility_url}
              onChange={(e) => handleChange("accessibility_url", e.target.value)}
              placeholder="https://www.example.com/accessibility"
              dir="ltr"
            />
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
            disabled={isLoading || !formData.name}
            className="bg-[#3498DB] hover:bg-[#2980B9]"
          >
            {isLoading ? "שומר..." : "שמירה"}
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
