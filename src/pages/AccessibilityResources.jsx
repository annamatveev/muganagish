import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ExternalLink, FileText, Info, Bookmark, Hand, Book, Shield, AlertTriangle } from "lucide-react";

export default function AccessibilityResources() {
  const navigate = useNavigate();

  const resources = [
    {
      title: "נגישות ישראל",
      description: "עמותה מובילה לקידום הנגישות והשתלבות אנשים עם מוגבלות בחברה הישראלית",
      links: [
        { title: "האתר הרשמי", url: "https://www.aisrael.org/" },
        { title: "שירות מידע על נגישות", url: "https://www.aisrael.org/?CategoryID=2671&ArticleID=42471" }
      ],
      icon: <Hand className="w-8 h-8 text-blue-500" />
    },
    {
      title: "פיקוד העורף - נגישות",
      description: "מידע על התגוננות והתנהלות בחירום עבור אנשים עם מוגבלות",
      links: [
        { title: "הנחיות התגוננות לאנשים עם מוגבלות", url: "https://www.oref.org.il/12481-he/Pakar.aspx" },
        { title: "מידע נוסף על זמני התרעה", url: "https://www.oref.org.il/12402-he/Pakar.aspx" }
      ],
      icon: <Shield className="w-8 h-8 text-amber-500" />
    },
    {
      title: "המכון הישראלי לנגישות",
      description: "מחקר, יעוץ והדרכה בנושאי נגישות המרחב הפיזי והשירות",
      links: [
        { title: "האתר הרשמי", url: "https://www.iicom.org.il/" },
        { title: "מאמרים והנחיות", url: "https://www.iicom.org.il/articles.php" }
      ],
      icon: <Book className="w-8 h-8 text-purple-500" />
    },
    {
      title: "נציבות שוויון זכויות לאנשים עם מוגבלות",
      description: "הגוף המוביל את יישום חוק שוויון זכויות לאנשים עם מוגבלות",
      links: [
        { title: "האתר הרשמי", url: "https://www.gov.il/he/departments/equality_commission" },
        { title: "מורשי נגישות מוסמכים", url: "https://www.gov.il/he/service/search_for_accessibility_experts" }
      ],
      icon: <FileText className="w-8 h-8 text-green-500" />
    },
    {
      title: "חוקי נגישות - תקנות ותקנים",
      description: "מידע על חקיקה, תקנות ותקנים בנושא נגישות",
      links: [
        { title: "חוק שוויון זכויות לאנשים עם מוגבלות", url: "https://www.nevo.co.il/law_html/Law01/p214m2_001.htm" },
        { title: "תקנות נגישות למקום ציבורי", url: "https://www.nevo.co.il/law_html/law01/500_478.htm" }
      ],
      icon: <Bookmark className="w-8 h-8 text-red-500" />
    },
    {
      title: "מידע על התנהגות בזמן חירום",
      description: "הנחיות כלליות להתנהגות בזמן חירום, כולל מידע על מקלטים",
      links: [
        { title: "פיקוד העורף - הנחיות לאזרח", url: "https://www.oref.org.il/11093-he/Pakar.aspx" },
        { title: "התגוננות אזרחית", url: "https://www.gov.il/he/departments/topics/civil_defense" }
      ],
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
       
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">מידע על נגישות ומקלטים</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            מאגר קישורים ומידע בנושאי נגישות, מקלטים והתנהגות בזמן חירום עבור אנשים עם מוגבלות
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-md">
                    {resource.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {resource.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resource.links.map((link, linkIndex) => (
                    <a 
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-[#3498DB] hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 ml-2" />
                      {link.title}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-blue-100 rounded-full">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-blue-800 mb-2">חשוב לדעת</h3>
              <p className="text-blue-700">
                המידע והקישורים המוצגים כאן נועדו למטרות מידע כללי בלבד. מומלץ לפנות תמיד למקורות רשמיים עדכניים לקבלת הנחיות מדויקות, במיוחד בעת חירום. אנא עקבו אחרי הנחיות פיקוד העורף והרשויות המוסמכות.
              </p>
              <div className="mt-4">
                <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate(createPageUrl("ContactUs"))}>
                  יש לכם הצעות לקישורים נוספים?
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}