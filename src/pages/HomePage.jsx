
import React, { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Shield, User, Plus, Building2, Map, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User as UserEntity } from "@/api/entities";
import { Organization } from "@/api/entities";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const userData = await UserEntity.me();
        setUser(userData);
        
        // Check if user has organization
        if (userData.organization_id) {
          setHasOrganization(true);
        } else if (userData.is_coordinator) {
          // If coordinator but no org yet, check for orgs
          try {
            const orgs = await Organization.list();
            if (orgs.length > 0) {
              const userOrgs = orgs.filter(org => org.owner_id === userData.id);
              setHasOrganization(userOrgs.length > 0);
            }
          } catch (err) {
            console.error("Error checking organizations:", err);
          }
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  const handleCoordinatorLogin = async () => {
    try {
      await UserEntity.login();
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-[#EDF2F7]">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Shield className="w-20 h-20 mx-auto text-[#3498DB] mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-4">
            ברוכים הבאים ל<span className="text-[#3498DB]">מוגנגיש</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            המערכת המקיפה למיפוי מקלטים ומרחבים מוגנים נגישים בישראל.
            עזרו לנו לבנות מאגר מידע משותף שיסייע לאנשים עם מוגבלות למצוא מקלט בטוח בעת חירום.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to={createPageUrl("ShelterForm")} className="block w-full">
              <Button 
                className="w-full py-8 text-lg bg-[#3498DB] hover:bg-[#2980B9] rounded-2xl shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-6 h-6 ml-2" />
               דיווח על מקלט
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {!loading && user ? (
              user.is_coordinator ? (
               
                  <Link to={createPageUrl("CoordinatorDashboard")} className="block w-full">
                    <Button 
                      className="w-full py-8 text-lg bg-[#F39C12] hover:bg-[#D35400] rounded-2xl shadow-lg transition-all hover:shadow-xl"
                    >
                      <Building2 className="w-6 h-6 ml-2" />
                      ניהול מקלטים בארגון
                    </Button>
                  </Link>
                ) : (
                <Link to={createPageUrl("BusinessVerification")} className="block w-full">
                  <Button 
                    className="w-full py-8 text-lg bg-[#F39C12] hover:bg-[#D35400] rounded-2xl shadow-lg transition-all hover:shadow-xl"
                  >
                    <Shield className="w-6 h-6 ml-2" />
                    בקשת גישה כרכז/ת נגישות
                  </Button>
                </Link>
              )
            ) : (
              <Button 
                onClick={handleCoordinatorLogin}
                className="w-full py-8 text-lg bg-[#F39C12] hover:bg-[#D35400] rounded-2xl shadow-lg transition-all hover:shadow-xl"
              >
                <User className="w-6 h-6 ml-2" />
                התחברות
              </Button>
            )}
          </motion.div>
        </div>

        {/* Search Section with centered button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 w-full max-w-2xl"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-50 rounded-full">
                <Map className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mr-3">חיפוש מקלטים נגישים</h3>
            </div>
            
            <p className="text-gray-600 mb-5">
              חפשו מקלטים נגישים בקרבתכם על פי כתובת, סננו לפי צרכים ספציפיים וקבלו מידע מדויק על נגישות המקלט.
              <span className="block mt-2 text-sm text-amber-600 font-medium">
                שימו לב: מערכת החיפוש נמצאת בפיתוח, וייתכן שחלק מהנתונים אינם מלאים עדיין.
              </span>
            </p>
            
            <div className="flex justify-center">
              <Link to={createPageUrl("SearchShelters")}>
                <Button className="bg-[#2ECC71] hover:bg-[#27AE60]">
                  <Map className="w-4 h-4 ml-2" />
                  חיפוש מקלטים נגישים
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center max-w-2xl"
        >
          <h2 className="text-2xl font-semibold mb-3 text-[#2C3E50]">
            למה חשוב להשתתף?
          </h2>
          <p className="text-gray-600">
            בעת חירום, אנשים עם מוגבלות נתקלים באתגרים ייחודיים בחיפוש אחר מקלט נגיש.
            בעזרת המידע שתספקו, נוכל ליצור מאגר מידע מקיף וזמין שיסייע לאנשים למצוא מקלט מתאים במהירות.
          </p>
          
        </motion.div>
      </div>
    </div>
  );
}
