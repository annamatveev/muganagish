import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Coffee,
  Heart,
  Users,
  Server,
  ExternalLink,
  Mail,
  Map,
  Code,
  Cpu
} from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-[#EDF2F7] py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3">תמיכה במיזם מוגנגיש</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            עזרו לנו להמשיך לפתח ולתחזק את מוגנגיש - הפלטפורמה המאפשרת לאנשים עם מוגבלות למצוא מקלטים עם מאפייני נגישות בזמן חירום
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="text-blue-600" />
                העלויות והמימון שלנו
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                מוגנגיש היא פלטפורמה התנדבותית המתוחזקת על ידי מתנדבים. העלויות שלנו כוללות רק:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">אחסון ושרתים</h3>
                    <p className="text-sm text-gray-600">
                      עלויות תשתית ענן ופלטפורמת Base44: כ-₪180 לחודש
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <Map className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">שירותי מיקום ומפות</h3>
                    <p className="text-sm text-gray-600">
                      ניתנים בחינם על ידי Google במסגרת תכנית לארגונים ללא מטרות רווח
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <Code className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">פיתוח ועיצוב</h3>
                    <p className="text-sm text-gray-600">
                      ניתנים בהתנדבות על ידי צוות מפתחים ומעצבים
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full">
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">שירותי בינה מלאכותית</h3>
                    <p className="text-sm text-gray-600">
                      חלק מהשירותים ניתנים בחינם, חלקם כלולים בעלות השרתים
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">סה"כ עלויות חודשיות:</span>
                    <span className="font-bold">₪180</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">מימון שהושג עד כה:</span>
                    <span className="font-bold">₪430</span>
                  </div>
                  <div className="flex justify-between items-center text-green-700">
                    <span className="font-medium">משך מימון נוכחי:</span>
                    <span className="font-bold">כ-2.4 חודשים</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="text-amber-600" />
                איך לתמוך?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                התמיכה הכספית שלכם מועברת לעמותת <strong>נגישות ישראל</strong> ועוזרת לממן את פיתוח והמשך תחזוקת המיזם. התרומות מסייעות גם לפעילות העמותה לקידום נגישות בישראל.
              </p>
              
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg text-center">
                  <Coffee className="w-10 h-10 mx-auto mb-4 text-amber-600" />
                  <h3 className="text-lg font-medium mb-3">תרמו להמשך הפיתוח!</h3>
                  <p className="mb-4 text-sm text-gray-600">
                    כל תרומה מסייעת - גם סכום קטן של ₪10 יכול להאריך את חיי המיזם! 
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    
                  
                    <a 
                      href="https://www.aisrael.org/donate" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                      תרומה לעמותת נגישות ישראל
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="p-6 bg-white rounded-lg text-center">
                  <Users className="w-10 h-10 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-medium mb-1">הצטרפו לצוות המתנדבים</h3>
                  <p className="text-sm text-gray-600">
                    אנחנו תמיד מחפשים מתנדבים בתחומי פיתוח, עיצוב, נגישות וקהילה
                  </p>
                  <div className="mt-4">
                    <Link to={createPageUrl("ContactUs")}>
                      <Button variant="outline">צור קשר להתנדבות</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center text-gray-600 text-sm">
          <p>התרומות מועברות לעמותת נגישות ישראל ומכסות עלויות תפעול ופיתוח המיזם לטובת הקהילה.</p>
        </div>
      </div>
    </div>
  );
}