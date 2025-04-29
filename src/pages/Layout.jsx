import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Menu, 
  X, 
  User, 
  Shield, 
  LogOut, 
  Map, 
  Home, 
  Send, 
  Plus, 
  Accessibility, 
  Building2, 
  Building, 
  GitBranch, 
  Info, 
  Heart,
  ChevronRight,
  ChevronLeft,
  Mail,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User as UserEntity } from "@/api/entities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { config } from "../config";

export default function Layout({ children, currentPageName }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const navigate = useNavigate(); // Fix: don't destructure, just use directly
  const [reviewNotification, setReviewNotification] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const userData = await UserEntity.me();
        setUser(userData);
        
        // DEMO PURPOSE ONLY - Auto-verify new users as coordinators and business verified
        // This will be removed after the demo
        if (userData) {
          let needsUpdate = false;
          const updates = {};
          
          if (!userData.is_coordinator) {
            console.log("DEMO: Auto-verifying user as coordinator");
            updates.is_coordinator = true;
            needsUpdate = true;
          }
          
          if (!userData.business_verified) {
            console.log("DEMO: Auto-verifying user as business verified");
            updates.business_verified = true;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            try {
              await UserEntity.updateMyUserData(updates);
              console.log("DEMO: User auto-verified successfully");
              userData.is_coordinator = true;
              userData.business_verified = true;
            } catch (updateError) {
              console.error("Error auto-verifying user:", updateError);
            }
          }
        }
        
        // Continue with existing code
        setShowRequestAccess(!userData?.is_coordinator);
        
        // Check if user is admin (email or role based)
        const userIsAdmin = userData.email === "contact.us.moogan@gmail.com" || userData.role === "admin";
        setIsAdmin(userIsAdmin);
        
        if (userData?.shelter_needs_review) {
          setReviewNotification(true);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  useEffect(() => {
    // If Google Maps is already loaded, do nothing
    if (window.google) {
      console.log("Google Maps API already loaded");
      return;
    }

    // Get API key directly from Base44's context
    const apiKey = config.googleMapsApiKey;
    console.log("Using Maps API key:", apiKey);
    
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Add global callback
    window.initMap = function() {
      console.log("Google Maps API loaded successfully");
      window.googleMapsLoaded = true;
    };
    
    script.onerror = (error) => {
      console.error("Error loading Google Maps:", error);
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.initMap;
    };
  }, []);

  const handleLogout = async () => {
    await UserEntity.logout();
    window.location.href = createPageUrl("HomePage");
  };

  const handleLogin = async () => {
    try {
      await UserEntity.login();
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const canAccessBusinessPages = () => {
    return !loading && user && (user.is_coordinator || user.business_verified);
  };

  return (
    <div dir="rtl" className="flex h-screen bg-[#F9F9F9] font-assistant">
      {/* Keep existing style tag */}
      <style jsx global>{`body { margin: 0; }`}</style>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 bg-white border-b z-40 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#3498DB]" />
              <span className="text-xl font-bold">מוגנגיש</span>
            </div>
          </div>

          {/* Profile Section */}
          {!loading && (
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.full_name} />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-sm font-normal text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(createPageUrl("UserProfile"))}>
                      <User className="mr-2 h-4 w-4" />
                      <span>הפרופיל שלי</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>התנתקות</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLogin} variant="outline" size="sm">
                  <User className="h-4 w-4 ml-2" />
                  התחברות
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-16 bottom-16 right-0 z-30 bg-white border-l transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex"
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="p-2">
          <Link
            to={createPageUrl("HomePage")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
              sidebarCollapsed && "justify-center"
            )}
          >
            <Home className="w-5 h-5" />
            {!sidebarCollapsed && <span>דף הבית</span>}
          </Link>
          
          <div className="border-t my-2" />
          
          <Link
            to={createPageUrl("SearchShelters")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
              sidebarCollapsed && "justify-center"
            )}
          >
            <Map className="w-5 h-5" />
            {!sidebarCollapsed && <span>חיפוש מקלטים</span>}
          </Link>
          
          <Link
            to={createPageUrl("ShelterForm")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
              sidebarCollapsed && "justify-center"
            )}
          >
            <Plus className="w-5 h-5" />
            {!sidebarCollapsed && <span>דיווח על מקלט</span>}
          </Link>

          {canAccessBusinessPages() && (
            <>
              <div className="border-t my-2" />
              <Link
                to={createPageUrl("CoordinatorDashboard")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <Building2 className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>ניהול מקלטים</span>
                    {reviewNotification && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </div>
                )}
              </Link>
              
              <Link
                to={createPageUrl("OrganizationManagement")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <Building className="w-5 h-5" />
                {!sidebarCollapsed && <span>ניהול ארגונים</span>}
              </Link>
              
              <Link
                to={createPageUrl("BranchManagement")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <GitBranch className="w-5 h-5" />
                {!sidebarCollapsed && <span>ניהול סניפים</span>}
              </Link>
            </>
          )}
          
          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="border-t my-2" />
              <div className={cn(
                "px-4 py-1 text-xs text-gray-500",
                sidebarCollapsed ? "sr-only" : ""
              )}>
                ניהול מערכת
              </div>
              
              <Link
                to={createPageUrl("AdminModeration")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <Settings className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>ממשק ניהול</span>
                  </div>
                )}
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 mt-16 mb-16",
        sidebarCollapsed ? "md:mr-16" : "md:mr-64"
      )}>
        {children}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 left-0 bg-white border-t z-40 h-16">
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link to={createPageUrl("About")} className="hover:text-gray-900 flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>אודות</span>
            </Link>
            <Link to={createPageUrl("Support")} className="hover:text-gray-900 flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>תמיכה</span>
            </Link>
            <Link to={createPageUrl("AccessibilityResources")} className="hover:text-gray-900 flex items-center gap-1">
              <Accessibility className="w-4 h-4" />
              <span>נגישות</span>
            </Link>
            <Link to={createPageUrl("ContactUs")} className="hover:text-gray-900 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>צור קשר</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

