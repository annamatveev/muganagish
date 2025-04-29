import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Send, Mail, Phone, MapPin, Check, BugPlay, Lightbulb, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SendEmail } from "@/api/integrations";
import { User } from "@/api/entities";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ContactUs() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Try to get user info if logged in
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setFormData(prev => ({
          ...prev,
          name: userData.full_name || prev.name,
          email: userData.email || prev.email
        }));
      } catch (error) {
        // User not logged in, that's fine
      }
    };
    loadUser();
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Set subject based on active tab
      let emailSubject;
      switch(activeTab) {
        case "bug":
          emailSubject = `דיווח על באג: ${formData.subject}`;
          break;
        case "idea":
          emailSubject = `רעיון לשיפור: ${formData.subject}`;
          break;
        default:
          emailSubject = `פנייה חדשה: ${formData.subject}`;
      }

      // Send email
      await SendEmail({
        to: "contact.us.moogan@gmail.com",
        subject: emailSubject,
        body: `
        פנייה חדשה התקבלה מאת ${formData.name}
        
        אימייל: ${formData.email}
        סוג פנייה: ${activeTab === "bug" ? "דיווח על באג" : activeTab === "idea" ? "רעיון לשיפור" : "פנייה כללית"}
        נושא: ${formData.subject}
        
        תוכן הפנייה:
        ${formData.message}
        `
      });

      setIsSubmitted(true);

      // Reset form after 3 seconds and redirect to homepage
      setTimeout(() => {
        navigate(createPageUrl("HomePage"));
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("אירעה שגיאה בשליחת הפנייה. אנא נסו שוב מאוחר יותר.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-white shadow-lg border-none h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">פרטי התקשרות</CardTitle>
                <CardDescription>אנחנו תמיד שמחים לשמוע מכם!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">אימייל</h3>
                    <a href="mailto:contact.us.moogan@gmail.com" className="text-[#3498DB] hover:underline">
                      contact.us.moogan@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">טלפון</h3>
                    <p>055-555-5555</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">כתובת</h3>
                    <p>רחוב האלון 5, תל אביב</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-none">
                <CardHeader>
                  <CardTitle className="text-xl">צרו איתנו קשר</CardTitle>
                  <CardDescription>
                    יש לכם שאלות, רעיונות או מצאתם באג? נשמח לשמוע מכם!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">תודה על פנייתך!</h3>
                      <p className="text-gray-600">
                        קיבלנו את הודעתך ונחזור אליך בהקדם האפשרי.
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        מועבר לדף הבית...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Tabs 
                        value={activeTab} 
                        onValueChange={setActiveTab}
                        className="mb-6"
                      >
                        <TabsList className="grid grid-cols-3 w-full" dir="rtl">
                          <TabsTrigger value="general" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            פנייה כללית
                          </TabsTrigger>
                          <TabsTrigger value="bug" className="flex items-center gap-2">
                            <BugPlay className="w-4 h-4" />
                            דיווח על באג
                          </TabsTrigger>
                          <TabsTrigger value="idea" className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            רעיון לשיפור
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general">
                          <p className="text-sm text-gray-600 mb-4" dir="rtl">
                            רוצים לדעת עוד על המיזם? יש לכם שאלות כלליות? נשמח לענות!
                          </p>
                        </TabsContent>
                        <TabsContent value="bug">
                          <p className="text-sm text-gray-600 mb-4" dir="rtl">
                            מצאתם באג במערכת? ספרו לנו בדיוק מה קרה ונתקן בהקדם.
                          </p>
                        </TabsContent>
                        <TabsContent value="idea">
                          <p className="text-sm text-gray-600 mb-4" dir="rtl">
                            יש לכם רעיון לשפר את המערכת? נשמח לשמוע! הרעיונות שלכם חשובים לנו.
                          </p>
                        </TabsContent>
                      </Tabs>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">שם מלא*</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleChange("name", e.target.value)}
                              required
                              placeholder="השם שלך"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">אימייל*</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleChange("email", e.target.value)}
                              dir="ltr"
                              required
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">נושא הפנייה*</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            required
                            placeholder={activeTab === "bug" ? "תיאור קצר של הבאג" : 
                                        activeTab === "idea" ? "רעיון בקצרה" : "נושא הפנייה"}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">הודעה*</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            rows={5}
                            required
                            placeholder={activeTab === "bug" ? "אנא פרטו: מה ציפיתם שיקרה? מה קרה בפועל? האם יש שלבים לשחזור הבעיה?" : 
                                         activeTab === "idea" ? "תארו את הרעיון שלכם לשיפור המערכת" : "תוכן ההודעה"}
                          />
                        </div>
                      </form>
                    </div>
                  )}
                </CardContent>
                {!isSubmitted && (
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-[#3498DB] hover:bg-[#2980B9]"
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 ml-2" />
                          שליחת הודעה
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}