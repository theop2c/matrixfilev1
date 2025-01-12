import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { STRIPE_PRICE_IDS } from "@/config/config.ts";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  // Function to fetch the latest subscription from Firestore
  const fetchLatestSubscription = async (userId: string) => {
    try {
      const subscriptionsRef = collection(db, `customers/${userId}/subscriptions`);
      const q = query(subscriptionsRef, orderBy("created", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const latestSubscription = querySnapshot.docs[0].data();
        console.log("Latest subscription data:", latestSubscription); // Debug latest subscription

        const items = latestSubscription?.items;
        if (items && items[0]?.price?.id) {
          return items[0].price.id; // Return the price ID
        } else {
          console.error("No items or price ID found in the latest subscription");
          return null;
        }
      } else {
        console.error("No subscriptions found for the user");
        return null;
      }
    } catch (error) {
      console.error("Error fetching the latest subscription:", error);
      return null;
    }
  };

  useEffect(() => {
    const updateUserData = async () => {
      const userId = auth.currentUser?.uid; // Get the authenticated user's ID
      if (!userId) {
        alert("User not authenticated");
        navigate("/"); // Redirect to home if user is not authenticated
        return;
      }

      try {
        // Fetch the latest subscription to get the price ID
        const priceId = await fetchLatestSubscription(userId);
        if (!priceId) {
          console.error("Failed to retrieve price ID from subscription");
          return;
        }

        const userDocRef = doc(db, `users`, userId);

        // Ensure the user document exists before updating
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const today = new Date();
          const endSubscriptionDate = new Date(today.setMonth(today.getMonth() + 1));

          const role = priceId === STRIPE_PRICE_IDS.PREMIUM ? "premium" : "gold";
          console.log("Calculated role:", role); // Debug calculated role

          // Update the user document
          await updateDoc(userDocRef, {
            endSubscriptionDate: endSubscriptionDate.toISOString(),
            role: role,
            subscriptionStatus: "active",
          });

          console.log("User subscription updated successfully");
        } else {
          console.error("User document does not exist. Cannot update subscription details.");
        }
      } catch (error) {
        console.error("Error updating user subscription:", error);
      }
    };

    updateUserData();
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate("/"); // Navigate to dashboard with reload state
    window.location.reload(); // Force dashboard page to reload
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Payment Successful</h1>
      <p>Your subscription has been activated successfully!</p>
      <button
        onClick={handleGoToDashboard}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default SuccessPage;
