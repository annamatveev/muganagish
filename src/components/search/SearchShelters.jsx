import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

const SearchShelters = ({ shelter }) => {
  const navigate = useNavigate();

  const handleClaimShelter = async (shelter) => {
    try {
      // Check if user is logged in
      let user = null;
      try {
        user = await User.me();
      } catch (error) {
        // Not logged in
      }

      if (!user) {
        // Prompt to login first
        if (confirm("עליך להתחבר כדי לדרוש בעלות על מקלט. האם ברצונך להתחבר?")) {
          User.login();
        }
        return;
      }
      
      // If user is a coordinator, redirect to shelter form with claim param
      if (user.is_coordinator) {
        navigate(createPageUrl(`ShelterForm?claim=${shelter.id}&type=business`));
      } else {
        // Otherwise redirect to business verification
        navigate(createPageUrl(`BusinessVerification?shelter_id=${shelter.id}`));
      }
    } catch (error) {
      console.error("Error handling shelter claim:", error);
      alert("אירעה שגיאה. אנא נסה שנית.");
    }
  };

  return null; // This component doesn't render anything directly
};

export default SearchShelters;