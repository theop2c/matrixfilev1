import React, { useState } from "react";
import { auth, db } from "@/lib/firebase"; // Firebase configuration for authentication
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const CancelPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchLatestSubscriptionDocId = async (userId: string): Promise<string | null> => {
    try {
      const subscriptionsRef = collection(db, `customers/${userId}/subscriptions`);
      const q = query(subscriptionsRef, orderBy("created", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const latestSubscriptionDocId = querySnapshot.docs[0].id; // Get the document ID
        console.log("Latest subscription document ID:", latestSubscriptionDocId); // Debug document ID
        return latestSubscriptionDocId;
      } else {
        console.error("No subscriptions found for the user");
        return null;
      }
    } catch (error) {
      console.error("Error fetching the latest subscription document ID:", error);
      return null;
    }
  };

  const handleCancelSubscription = async () => {
    const userId = auth.currentUser?.uid; // Get the authenticated user's ID

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Fetch the latest subscription document ID
      const subscriptionId = await fetchLatestSubscriptionDocId(userId);

      if (!subscriptionId) {
        alert("No subscription ID found");
        return;
      }

      // Prepare the payload for the Node.js server
      const payload = {
        userId,
        subscriptionId,
      };

      console.log("Payload sent to Node.js server:", payload);

      // Call the cancelSubscription Node.js function
      const response = await fetch("http://localhost:3000/cancel-subscription", { // URL of your Node.js server
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Subscription canceled successfully. Your data will be deleted shortly.");
        console.log("Response from server:", data);
      } else {
        const errorData = await response.json();
        setMessage(`Error canceling subscription: ${errorData.message || "Unknown error"}`);
        console.error("Error from server:", errorData);
      }
    } catch (error) {
      setMessage("An error occurred while canceling the subscription. Please try again.");
      console.error("Error calling cancelSubscription function:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Cancel Subscription</h1>
      <p style={{ marginBottom: "20px" }}>
        Are you sure you want to cancel your subscription? All your data will be deleted.
      </p>
      <button
        onClick={handleCancelSubscription}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#DC3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "20px",
        }}
      >
        {loading ? "Processing..." : "Cancel Subscription"}
      </button>
      {message && <p style={{ marginTop: "20px", color: loading ? "#555" : "#DC3545" }}>{message}</p>}
    </div>
  );
};

export default CancelPage;
