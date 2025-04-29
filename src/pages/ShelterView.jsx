import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shelter } from "@/api/entities";
import { Branch } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ShelterDetails from "../components/shelter/ShelterDetails";

export default function ShelterView() {
  const navigate = useNavigate();
  const [shelter, setShelter] = useState(null);
  const [branch, setBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shelterId = urlParams.get('id');
      
      if (!shelterId) {
        navigate(createPageUrl("CoordinatorDashboard"));
        return;
      }

      // Load shelter data
      const shelterData = await Shelter.list();
      const shelterItem = shelterData.find(s => s.id === shelterId);
      
      if (!shelterItem) {
        navigate(createPageUrl("CoordinatorDashboard"));
        return;
      }

      console.log("Loaded shelter data:", shelterItem); // Debug log
      setShelter(shelterItem);
      
      // Load branch data if shelter belongs to a branch
      if (shelterItem.branch_id) {
        const branchData = await Branch.list();
        const branchItem = branchData.find(b => b.id === shelterItem.branch_id);
        if (branchItem) {
          console.log("Loaded branch data:", branchItem); // Debug log
          setBranch(branchItem);
        }
      }

      // Get current user
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error("Not logged in:", error);
        navigate(createPageUrl("HomePage"));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      navigate(createPageUrl("CoordinatorDashboard"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(createPageUrl(`ShelterForm?id=${shelter.id}`));
  };

  if (isLoading) {
    return <div className="p-8 text-center">טוען...</div>;
  }

  if (!shelter) {
    return <div className="p-8 text-center">המקלט לא נמצא</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F9F9] to-[#EDF2F7] py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(createPageUrl("CoordinatorDashboard"))}
            className="text-[#3498DB] hover:text-[#2980B9] flex items-center"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            חזרה לניהול מקלטים
          </button>

          <Button onClick={handleEdit} className="bg-[#3498DB] hover:bg-[#2980B9]">
            <Edit className="w-4 h-4 ml-2" />
            עריכת מקלט
          </Button>
        </div>

        {shelter && (
          <div>
            <pre style={{display: 'none'}}>{JSON.stringify(shelter, null, 2)}</pre> {/* Debug element */}
            <ShelterDetails
              shelter={shelter}
              branch={branch}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              viewMode="coordinator"
            />
          </div>
        )}
      </div>
    </div>
  );
}