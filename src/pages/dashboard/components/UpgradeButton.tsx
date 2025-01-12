import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase"; // Firebase configuration
import { doc, getDoc } from "firebase/firestore";

const UpgradeButton: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const userId = auth.currentUser?.uid; // Get the authenticated user's ID

      if (!userId) {
        console.error("User not authenticated");
        return;
      }

      try {
        const userDocRef = doc(db, `users`, userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setRole(userData?.role || null); // Set the user's role
        } else {
          console.error("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const handleUpgrade = () => {
    // Redirect the user to the upgrade page
    navigate("/upgrade");
  };

  if (role !== "freemium") {
    return null; // Do not render the button if the role is not freemium
  }

  return (
    <button
      onClick={handleUpgrade}
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px",
      }}
    >
      Upgrade
    </button>
  );
};

export default UpgradeButton;
