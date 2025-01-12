import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import fetch from "node-fetch"; // Ensure you have this installed: `npm install node-fetch`
// Importer les dépendances nécessaires
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getDatabase } from 'firebase-admin/database';

admin.initializeApp();

// Fonction callable pour enregistrer un message dans Firebase Realtime Database
export const addMessage = onCall((request) => {
  // Vérification de l'authentification
  if (!request.auth) {
      throw new HttpsError(
          'unauthenticated',
          'Vous devez être authentifié pour appeler cette fonction.'
      );
  }

  // Récupération des données de la requête
  const text = request.data.text;
  if (typeof text !== 'string' || text.trim() === '') {
      throw new HttpsError(
          'invalid-argument',
          'Le texte doit être une chaîne non vide.'
      );
  }

  // Récupération des informations d'utilisateur
  const uid = request.auth.uid;
  const name = request.auth.token.name || null;
  const picture = request.auth.token.picture || null;
  const email = request.auth.token.email || null;

  // Référence à la base de données Firebase
  const db = getDatabase();
  const ref = db.ref('messages');
  const newMessageRef = ref.push();

  // Sauvegarder le message dans la base de données
  const sanitizedText = text.replace(/\b(swearword1|swearword2)\b/gi, '****');
  newMessageRef.set({
      text: sanitizedText,
      uid,
      name,
      picture,
      email,
      timestamp: Date.now(),
  });

  // Retourner une réponse de confirmation
  return { message: 'Message ajouté avec succès !', sanitizedText };
});

export const stopMembership = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    console.log("Function `stopMembership` invoked.");

    // Fetch Stripe secret key from Firebase config
    const stripeSecretKey = functions.config().stripe?.secret;
    if (!stripeSecretKey) {
      console.error("Stripe secret key is missing in Firebase config.");
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Stripe secret key is not configured in Firebase."
      );
    }
    console.log("Stripe secret key fetched successfully.");

    // Validate input data
    const { subscriptionId } = request.data;
    const uid = request.auth?.uid; // Retrieve user ID from authenticated request

    if (!subscriptionId) {
      console.error("Missing subscriptionId in request.");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The subscriptionId is required."
      );
    }

    if (!uid) {
      console.error("Unauthenticated request.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated."
      );
    }

    try {
      console.log(`Attempting to cancel subscription with ID: ${subscriptionId}`);

      // Call Stripe API to cancel subscription
      const response = await fetch(
        `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${stripeSecretKey}:`).toString(
              "base64"
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            cancel_at_period_end: "true",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from Stripe API:", errorData);
        throw new functions.https.HttpsError(
          "internal",
          "Failed to cancel subscription on Stripe.",
          errorData
        );
      }

      const stripeResponse = await response.json();
      console.log("Stripe cancellation response:", stripeResponse);

      // Update Firestore document with "dying" subscription status
      console.log(`Updating Firestore document for userId: ${uid}`);
      const userDocRef = admin.firestore().doc(`users/${uid}`);
      await userDocRef.update({
        subscriptionStatus: "dying",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Firestore document updated successfully.");

      // Return success message and Stripe response
      return {
        message: "Subscription cancellation initiated successfully.",
        stripeResponse,
      };
    } catch (error: unknown) {
      console.error("Error in stopMembership function:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      throw new functions.https.HttpsError(
        "internal",
        "An error occurred while canceling the subscription.",
        { details: errorMessage }
      );
    }
  }
);
