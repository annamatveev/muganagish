
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, CheckCircle, TriangleAlert, Accessibility, Star, Building2, GitBranch, Clock, Edit, XCircle, CheckCircle2 } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ShelterMap from "../map/ShelterMap";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function ShelterCard({ 
  shelter, 
  distance, 
  viewMode = "public",
  onViewDetails,
  onAction
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  
  const VerificationBadge = () => {
    return (
      <div className="relative">
        <Badge 
          variant="outline" 
          className={`${shelter.verified 
            ? "bg-blue-50 text-blue-800 border-blue-200" 
            : shelter.needs_review 
              ? "bg-amber-50 text-amber-800 border-amber-200" 
              : shelter.is_draft
                ? "bg-gray-50 text-gray-500 border-gray-200"
                : "bg-gray-50 text-gray-800 border-gray-200"} 
          flex items-center gap-1 whitespace-nowrap cursor-pointer`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {shelter.verified ? (
            <>
              <CheckCircle className="h-3 w-3" />
              מאומת
            </>
          ) : shelter.needs_review ? (
            <>
              <TriangleAlert className="h-3 w-3" />
              ממתין לאימות
            </>
          ) : shelter.is_draft ? (
            <>
              <Clock className="h-3 w-3" />
              טיוטה
            </>
          ) : (
            <>דיווח קהילתי</>
          )}
        </Badge>
        
        {showTooltip && (
          <div className="absolute z-50 bg-white border rounded-md shadow-md p-2 text-xs max-w-[200px] right-0 mt-1">
            {shelter.verified ? (
              <p>מקלט שהמידע עליו הוזן או נבדק על ידי רכז/ת נגישות מוסמך/ת</p>
            ) : shelter.needs_review ? (
              <p>מקלט שהמידע עליו ממתין לבדיקה על ידי מנהל המערכת</p>
            ) : shelter.is_draft ? (
              <p>מקלט שטרם הושלם ופורסם</p>
            ) : (
              <p>מקלט שהמידע עליו הוזן על ידי משתמש מן הציבור</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Handle edit action based on shelter type
  const handleEdit = () => {
    // Clean up empty strings and undefined values
    const branchId = shelter.branch_id && shelter.branch_id !== "" ? shelter.branch_id : null;
    const orgId = shelter.organization_id && shelter.organization_id !== "" ? shelter.organization_id : null;
    
    // Create URL params
    const params = new URLSearchParams();
    
    // Always add the ID
    params.append('id', shelter.id);
    
    // If it's a business shelter (has branch or org), add business type
    if (branchId || orgId) {
      params.append('type', 'business');
      
      if (branchId) {
        params.append('branch', branchId);
      }
      
      if (orgId) {
        params.append('org', orgId);
      }
    }

    const url = createPageUrl(`ShelterForm?${params.toString()}`);
    console.log('Navigating to:', url, {
      shelterId: shelter.id,
      branchId,
      orgId,
      isBusiness: !!(branchId || orgId)
    });
    
    navigate(url);
  };

  // Make sure shelter has necessary properties before using them
  const safetyCheck = {
    lat: shelter?.lat ? parseFloat(shelter.lat) : null,
    lng: shelter?.lng ? parseFloat(shelter.lng) : null,
    hasCoordinates: shelter?.lat && shelter?.lng
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-1 cursor-pointer hover:text-blue-600">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{shelter.address}</span>
                  {distance && (
                    <span className="text-xs text-gray-500 mr-2">({distance} ק"מ)</span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <div className="h-[200px] rounded-md overflow-hidden">
                  {safetyCheck.hasCoordinates ? (
                    <ShelterMap
                      shelters={[shelter]}
                      center={{ lat: safetyCheck.lat, lng: safetyCheck.lng }}
                      radius={0}
                      showRadius={false}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">אין נקודות ציון למקלט זה</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <VerificationBadge />
          </div>

          <h3 className="font-medium text-lg line-clamp-1">{shelter.shelter_type}</h3>

          {/* Organization and Branch Info */}
          {(shelter.organization_name || shelter.branch_name) && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              {shelter.organization_name && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {shelter.organization_name}
                </Badge>
              )}
              {shelter.branch_name && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {shelter.branch_name}
                </Badge>
              )}
            </div>
          )}

          {/* Accessibility Features */}
          <div className="flex flex-wrap gap-2 mt-2">
            {shelter.step_free_access && (
              <Badge className="bg-green-100 text-green-800">
                <Accessibility className="h-3 w-3 mr-1" />
                ללא מדרגות
              </Badge>
            )}
            {shelter.ramp_present && (
              <Badge className="bg-green-100 text-green-800">
                <Accessibility className="h-3 w-3 mr-1" />
                רמפה
              </Badge>
            )}
            {shelter.maneuvering_space && (
              <Badge className="bg-green-100 text-green-800">
                <Accessibility className="h-3 w-3 mr-1" />
                מרחב תמרון
              </Badge>
            )}
            {shelter.rating && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {shelter.rating.toFixed(1)}
              </Badge>
            )}
          </div>

          {/* Location Details - Only show if they exist */}
          <div className="mt-3 space-y-1 text-sm">
            {shelter.floor_number && (
              <div className="text-gray-600">
                <strong>קומה:</strong> {shelter.floor_number}
              </div>
            )}
            {shelter.area_description && (
              <div className="text-gray-600">
                <strong>אזור במבנה:</strong> {shelter.area_description}
              </div>
            )}
            {shelter.directions && (
              <div className="text-gray-600">
                <strong>איך להגיע:</strong> {shelter.directions}
              </div>
            )}
          </div>

          
        </div>

        <div className="flex justify-end gap-2">
          {viewMode === "admin" && shelter.needs_review && (
            <>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => onAction && onAction("reject")}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 ml-2" />
                דחייה
              </Button>
              <Button 
                size="sm"
                onClick={() => onAction && onAction("approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 ml-2" />
                אישור
              </Button>
            </>
          )}
          
          {viewMode === "coordinator" && (
            <Button 
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="mr-auto"
            >
              <Edit className="w-4 h-4 ml-2" />
              עריכה
            </Button>
          )}
          
          <Button 
            size="sm" 
            onClick={onViewDetails}
            className="bg-blue-600 hover:bg-blue-700"
          >
            פרטים נוספים
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
