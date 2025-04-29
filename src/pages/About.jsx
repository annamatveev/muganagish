import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Code, Box, Cpu, Globe, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-[#EDF2F7] py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">אודות מוגנגיש</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            מערכת מוגנגיש היא פלטפורמה שנועדה לתיעוד וחיפוש מקלטים עם מאפייני נגישות לאנשים עם מוגבלויות בזמן חירום.
            המערכת מאפשרת שיתוף מידע אמין ומדויק אודות מקלטים ופרטי הנגישות שלהם.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="text-red-500" />
              הסיפור שלנו
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              אנו מאמינים שלכל אדם, ללא קשר למגבלות פיזיות, קוגניטיביות או חושיות, יש זכות להגנה בזמן חירום. המערכת מבוססת על שיתוף פעולה קהילתי, כאשר כל אחד יכול לתרום מידע ולעזור לשפר את הנגישות למקלטים.
            </p>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">חלק מקהילת "Code for Israel"</h3>
              </div>
              <p className="text-sm text-gray-700">
                מיזם "מוגנגיש" הוא חלק מפרויקטים של "Code for Israel" - קהילת מתנדבים המפתחת פתרונות טכנולוגיים עבור אתגרים חברתיים. המיזם מוקדש לשיפור נגישות למקלטים ומרחבים מוגנים עבור אנשים עם מוגבלויות.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="text-blue-500" />
              נבנה באמצעות Base44
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              מערכת מוגנגיש פותחה באמצעות פלטפורמת <strong>Base44</strong> - כלי מתקדם לפיתוח אפליקציות מהיר המסתמך על בינה מלאכותית. Base44 מאפשרת ליצור אפליקציות מורכבות במהירות וביעילות, תוך התמקדות בצרכי המשתמשים.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
              <div className="flex-1 text-center">
                <Box className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
                <h3 className="text-base font-medium mb-1">פיתוח מהיר</h3>
                <p className="text-sm text-gray-600">המערכת נבנתה במהירות תוך שימוש בכלים מתקדמים</p>
              </div>
              
              <div className="flex-1 text-center">
                <Cpu className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
                <h3 className="text-base font-medium mb-1">בינה מלאכותית</h3>
                <p className="text-sm text-gray-600">שימוש בטכנולוגיית AI לפיתוח והתאמה</p>
              </div>
              
              <div className="flex-1 text-center">
                <Globe className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
                <h3 className="text-base font-medium mb-1">אפליקציה בענן</h3>
                <p className="text-sm text-gray-600">זמינות מלאה מכל מקום ובכל זמן</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}