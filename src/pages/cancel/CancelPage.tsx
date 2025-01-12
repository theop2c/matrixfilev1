import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/dashboard"); // Redirect to the Dashboard
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "#DC3545", fontSize: "24px", marginBottom: "20px" }}>Paiement échoué</h1>
      <p style={{ fontSize: "16px", color: "#555", marginBottom: "30px" }}>
        Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.
      </p>
      <button
        onClick={handleGoToDashboard}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Retour au Dashboard
      </button>
    </div>
  );
};

export default PaymentFailedPage;
