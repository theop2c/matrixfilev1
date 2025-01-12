import React, { useState } from "react";
import { auth, db } from "@/lib/firebase"; // Import Firebase configuration
import { STRIPE_PRICE_IDS } from "@/config/config.ts"; // Import the config file
import { collection, addDoc, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const UpgradePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate(); // Moved useNavigate to the top level

  const handleSelectPlan = async (priceId: string) => {
    const userId = auth.currentUser?.uid; // Get the authenticated user's ID
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true); // Show loading indicator
      setSelectedPlan(priceId); // Set the selected plan

      // Reference to the checkout_sessions subcollection
      const checkoutSessionsRef = collection(db, `customers/${userId}/checkout_sessions`);

      // Add a new document to trigger Stripe Checkout
      const docRef = await addDoc(checkoutSessionsRef, {
        price: priceId, // Stripe Price ID
        success_url: window.location.origin + '/success', // Redirect on success
        cancel_url: window.location.origin + '/cancel',   // Redirect on cancel
      });

      // Listen for updates to the document
      onSnapshot(doc(db, `customers/${userId}/checkout_sessions`, docRef.id), async (docSnapshot) => {
        const sessionData = docSnapshot.data();
        if (sessionData?.url) {
          window.location.href = sessionData.url; // Redirect to Stripe Checkout
        }

        // Handle /success callback
        if (sessionData?.status === 'success') {
          const userDocRef = doc(db, `users`, userId);

          // Ensure the user document exists before updating
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            console.log("User document data:", userData); // Debug user document data

            const today = new Date();
            const endSubscriptionDate = new Date(today.setMonth(today.getMonth() + 1));

            const role = priceId === STRIPE_PRICE_IDS.PREMIUM ? 'premium' : 'gold';
            console.log("Calculated role:", role); // Debug calculated role
            console.log("Price ID:", priceId); // Debug price ID

            await updateDoc(userDocRef, {
              endSubscriptionDate: endSubscriptionDate.toISOString(),
              role: role,
            });

            console.log("User subscription updated successfully");
          } else {
            console.error("User document does not exist. Cannot update subscription details.");
          }
        }
      });
    } catch (error) {
      console.error("Error creating checkout session document:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleCancelSubscription = () => {
    navigate("/stopfee"); // Navigate to the cancel page
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Upgrade Your Plan</h1>
      <p>Select a plan that suits your needs:</p>
      <div style={{ marginTop: "20px" }}>
        {/* Premium Plan */}
        <button
          onClick={() => handleSelectPlan(STRIPE_PRICE_IDS.PREMIUM)} // Premium plan price ID
          disabled={loading && selectedPlan === STRIPE_PRICE_IDS.PREMIUM} // Disable button while loading
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: loading && selectedPlan === STRIPE_PRICE_IDS.PREMIUM ? "#ccc" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading && selectedPlan === STRIPE_PRICE_IDS.PREMIUM ? "not-allowed" : "pointer",
            margin: "10px",
          }}
        >
          {loading && selectedPlan === STRIPE_PRICE_IDS.PREMIUM
            ? "Processing..."
            : "Premium Plan ($10/month)"}
        </button>
        {/* Gold Plan */}
        <button
          onClick={() => handleSelectPlan(STRIPE_PRICE_IDS.GOLD)} // Gold plan price ID
          disabled={loading && selectedPlan === STRIPE_PRICE_IDS.GOLD} // Disable button while loading
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: loading && selectedPlan === STRIPE_PRICE_IDS.GOLD ? "#ccc" : "#FFD700",
            color: "black",
            border: "none",
            borderRadius: "5px",
            cursor: loading && selectedPlan === STRIPE_PRICE_IDS.GOLD ? "not-allowed" : "pointer",
            margin: "10px",
          }}
        >
          {loading && selectedPlan === STRIPE_PRICE_IDS.GOLD
            ? "Processing..."
            : "Gold Plan (€19/month)"}
        </button>
      </div>
   
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={handleCancelSubscription}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#DC3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Annuler mon abonnement en cours
        </button>
      </div>
    </div>
  );
};

export default UpgradePage;
