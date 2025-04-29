import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Info, 
  MapPin, 
  Building2, 
  Mail, 
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
  Accessibility,
  DoorOpen
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ShelterMap from "../map/ShelterMap";
import StreetView from "../map/StreetView";

const getStatusIcon = (shelter) => {
  if (shelter.is_draft) {
    return <Clock className="w-5 h-5 text-amber-500" />;
  } else if (shelter.verified) {
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  } else {
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  }
};

export default function ShelterDetails({ 
  shelter, 
  branch,
  activeTab,
  setActiveTab,
  onAction,
  viewMode = "public" 
}) {
  if (!shelter) {
    console.error("No shelter data provided to ShelterDetails component");
    return <div>Error: No shelter data available</div>;
  }

  console.log("Rendering ShelterDetails with:", { shelter, branch, activeTab });
  
  // Initialize accessibility_aids as an empty array if it doesn't exist
  const accessibilityAids = shelter.accessibility_aids || [];
  
  const allAccessibilityAids = [
    "שילוט ברייל",
    "שילוט בניגודיות גבוהה",
    "נתיב מישושי",
    "הנחיה קולית",
    "אזעקה חזותית",
    "מגבר שמיעה",
    "מקום ייעודי לכיסא גלגלים",
    "שירותים נגישים"
  ];
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {getStatusIcon(shelter)}
          <Badge className={`${shelter.verified ? "bg-green-100 text-green-800" : shelter.is_draft ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
            {shelter.is_draft ? "טיוטה" : (shelter.verified ? "מאומת" : "לא מאומת")}
          </Badge>
          <Badge variant="outline" className="ml-1">
            {shelter.shelter_type}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold mt-2 flex items-center">
          <MapPin className="w-5 h-5 ml-2 text-gray-600" />
          {shelter.address}
        </h1>
        {branch && (
          <div className="flex items-center text-gray-600 mt-1">
            <Building2 className="w-4 h-4 ml-1" />
            {branch.name}
          </div>
        )}
      </div>

      {branch && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2 rounded-full">
                <Building2 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">{branch.name}</h3>
                {branch.coordinator_name && (
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-600">רכז/ת נגישות: {branch.coordinator_name}</p>
                    {branch.coordinator_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a href={`mailto:${branch.coordinator_email}`} className="text-blue-600 hover:underline">
                          {branch.coordinator_email}
                        </a>
                      </div>
                    )}
                    {branch.coordinator_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${branch.coordinator_phone}`} className="text-blue-600 hover:underline">
                          {branch.coordinator_phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-10">
        <TabsList className="w-full justify-evenly bg-transparent mb-4" dir="rtl">
          <TabsTrigger value="details" className="bg-white shadow-sm data-[state=active]:bg-[#3498DB] data-[state=active]:text-white">
            פרטי המקלט
          </TabsTrigger>
          <TabsTrigger value="location" className="bg-white shadow-sm data-[state=active]:bg-[#3498DB] data-[state=active]:text-white">
            מיקום ומפות
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="bg-white shadow-sm data-[state=active]:bg-[#3498DB] data-[state=active]:text-white">
            נגישות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-0">
          <Card>
            <CardHeader dir="rtl">
              <CardTitle className="text-xl">פרטי המקלט</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" dir="rtl">
              <div dir="rtl">
                <h3 className="font-medium mb-1">קומה</h3>
                <p className={!shelter.floor_number ? "text-gray-500 italic" : ""}>
                  {shelter.floor_number || "לא צוין"}
                </p>
              </div>
              
              <div dir="rtl">
                <h3 className="font-medium mb-1">אזור במבנה</h3>
                <p className={!shelter.area_description ? "text-gray-500 italic" : ""}>
                  {shelter.area_description || "לא צוין"}
                </p>
              </div>
              
              <div dir="rtl">
                <h3 className="font-medium mb-1">הוראות הגעה</h3>
                <p className={!shelter.directions ? "text-gray-500 italic" : ""}>
                  {shelter.directions || "אין הוראות הגעה"}
                </p>
              </div>
              
              {shelter.shelter_type === 'אחר' && (
                <div dir="rtl">
                  <h3 className="font-medium mb-1">סוג מקלט אחר</h3>
                  <p className={!shelter.shelter_type_other ? "text-gray-500 italic" : ""}>
                    {shelter.shelter_type_other || "לא צוין"}
                  </p>
                </div>
              )}

              <div dir="rtl">
                <h3 className="font-medium mb-1">סטטוס אימות</h3>
                <p className={shelter.verified ? "text-green-600" : "text-gray-500"}>
                  {shelter.verified ? "מאומת" : "לא מאומת"}
                </p>
              </div>

              {shelter.submitted_by && (
                <div dir="rtl">
                  <h3 className="font-medium mb-1">דווח על ידי</h3>
                  <p>{shelter.submitted_by}</p>
                </div>
              )}

              <div dir="rtl">
                <h3 className="font-medium mb-1">תאריך עדכון אחרון</h3>
                <p className="text-gray-600">
                  {shelter.updated_date ? new Date(shelter.updated_date).toLocaleDateString('he-IL') : "לא ידוע"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="p-0">
          <Card>
            <CardHeader dir="rtl">
              <CardTitle className="text-xl">מיקום ומפות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div dir="rtl">
                <h3 className="font-medium mb-2" >מפה</h3>
                <div className="h-[300px] rounded-md overflow-hidden border relative">
                  {shelter.lat && shelter.lng ? (
                    <ShelterMap 
                      shelters={[shelter]} 
                      center={{lat: parseFloat(shelter.lat), lng: parseFloat(shelter.lng)}} 
                      radius={0}
                      showRadius={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">אין נקודות ציון למקלט זה</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div dir="rtl">
                <h3 className="font-medium mb-2" dir="rtl">מבט רחוב</h3>
                <div className="h-[300px] rounded-md overflow-hidden border relative">
                  {shelter.lat && shelter.lng ? (
                    <StreetView lat={parseFloat(shelter.lat)} lng={parseFloat(shelter.lng)} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">אין נקודות ציון למקלט זה</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="p-0">
          <Card>
            <CardHeader dir="rtl">
              <CardTitle className="text-xl">פרטי נגישות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div dir="rtl">
                  <h3 className="font-medium mb-3">מידות ומרווחים</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between border-b pb-2" dir="rtl">
                      <dt className="text-gray-600">רוחב דלת</dt>
                      <dd className="font-medium">{shelter.door_width ? `${shelter.door_width} ס"מ` : 'לא צוין'}</dd>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <dt className="text-gray-600">רוחב מעבר</dt>
                      <dd className="font-medium">{shelter.path_width ? `${shelter.path_width} ס"מ` : 'לא צוין'}</dd>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <dt className="text-gray-600">גובה מדרגה</dt>
                      <dd className="font-medium">{shelter.threshold_height ? `${shelter.threshold_height} ס"מ` : 'אין מדרגה'}</dd>
                    </div>
                    <div className="flex justify-between pb-2">
                      <dt className="text-gray-600">מספר מדרגות</dt>
                      <dd className="font-medium">{shelter.stairs_count || 'אין מדרגות'}</dd>
                    </div>
                  </dl>
                </div>

                <div dir="rtl">
                  <h3 className="font-medium mb-3">אמצעי נגישות</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2" dir="rtl">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${shelter.step_free_access ? 'bg-green-100' : 'bg-red-100'}`}>
                        {shelter.step_free_access ? 
                          <CheckCircle className="w-3 h-3 text-green-600" /> : 
                          <AlertTriangle className="w-3 h-3 text-red-500" />}
                      </div>
                      <span>גישה ללא מדרגות</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${shelter.maneuvering_space ? 'bg-green-100' : 'bg-red-100'}`}>
                        {shelter.maneuvering_space ? 
                          <CheckCircle className="w-3 h-3 text-green-600" /> : 
                          <AlertTriangle className="w-3 h-3 text-red-500" />}
                      </div>
                      <span>מרחב תמרון מספק</span>
                    </li>
                    <li className="flex items-center gap-2" dir="rtl">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${shelter.handrails_present ? 'bg-green-100' : 'bg-red-100'}`}>
                        {shelter.handrails_present ? 
                          <CheckCircle className="w-3 h-3 text-green-600" /> : 
                          <AlertTriangle className="w-3 h-3 text-red-500" />}
                      </div>
                      <span>מאחזי יד</span>
                    </li>
                    <li className="flex items-center gap-2" dir="rtl">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${shelter.ramp_present ? 'bg-green-100' : 'bg-red-100'}`}>
                        {shelter.ramp_present ? 
                          <CheckCircle className="w-3 h-3 text-green-600" /> : 
                          <AlertTriangle className="w-3 h-3 text-red-500" />}
                      </div>
                      <span>רמפה</span>
                    </li>
                  </ul>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">אביזרי נגישות נוספים:</h4>
                    <div className="flex flex-wrap gap-2">
                      {allAccessibilityAids.map((aid) => (
                        <div key={aid} className="flex items-center gap-1 border rounded-full px-3 py-1">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${accessibilityAids.includes(aid) ? 'bg-green-100' : 'bg-red-100'}`}>
                            {accessibilityAids.includes(aid) ? 
                              <CheckCircle className="w-2 h-2 text-green-600" /> : 
                              <AlertTriangle className="w-2 h-2 text-red-500" />}
                          </div>
                          <span className="text-sm">{aid}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t" dir="rtl">
                <h3 className="font-medium mb-2">מערכת הכוונה קולית</h3>
                {shelter.navigation_system && shelter.navigation_system !== "none" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-100">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <p>
                      {shelter.navigation_system === "step_hear" && "Step Hear"}
                      {shelter.navigation_system === "right_hear" && "Right Hear"}
                      {shelter.navigation_system === "other" && `סוג אחר: ${shelter.navigation_system_other || ""}`}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-red-100">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    </div>
                    <p className="text-gray-500">אין מערכת הכוונה קולית</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}