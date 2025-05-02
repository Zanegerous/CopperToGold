/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/scheduler";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();
const db = admin.database();
const CID = "";
const CSe = "";
const imageAPIKey = defineSecret('IMAGE_TO_TEXT_APIKEY');


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const ebayAuthCallback = onRequest(async (req, res) => {
    const { code, state } = req.query;
    const uid = state;

    try {
        // logger.info("Authorization code received:", code);
        const tokenUrl = "https://api.ebay.com/identity/v1/oauth2/token";
        const redirectUri = "https://ebayauthcallback-5ezxsoqfna-uc.a.run.app";
        const authHeader = Buffer.from(`${CID}:${CSe}`).toString("base64");
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code as string);
        params.append("redirect_uri", redirectUri);

        // Make the POST request to eBay's token endpoint
        const response = await axios.post(tokenUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${authHeader}`,
            },
        });
        const {
            access_token: accessToken,
            refresh_token: refreshToken,
        } = response.data;
        const ref = db.ref(`users/${uid}/token`);
        await ref.set({
            ebayToken: accessToken,
            ebayRefresh: refreshToken,
        });
        res.send("You can return to app!");
    } catch (error) {
        logger.info("Error handling authorization callback:", error);
        res.send("Internal server error, please try again later");
    }
});

export const tokenRefresh = onRequest(async (req, res) => {
    const { state } = req.query;
    const uid = state;

    try {
        const ref = db.ref(`users/${uid}/token`);
        const snapshot = await ref.get();
        const { ebayRefresh: refreshToken } = snapshot.val();

        const authHeader = Buffer.from(`${CID}:${CSe}`).toString("base64");
        const params = new URLSearchParams();
        const tokenUrl = "https://api.ebay.com/identity/v1/oauth2/token";

        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);
        // Scope not needed to be set, it will auto do it
        // params.append("redirect_uri", redirectUri);

        const response = await axios.post(tokenUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${authHeader}`,
            },
        });

        const {
            access_token: accessToken,
        } = response.data;

        await ref.update({
            ebayToken: accessToken,
        });

        logger.info("Successfully refreshed token!", accessToken);
        res.status(200).send("Token refresh successful");
    } catch (error) {
        logger.info("Error refreshing token:", error);
        res.status(500).send("refresh token invalid, expired?");
    }

});

export const updateAmount = onRequest(async (req, res) => {
    const { state } = req.query;  // Extract userID from query parameter 'state'
    const userUID = state;  // The userID is passed as 'state' in the request
    const { target } = req.query;  // Target can be 'allowedQuery' or 'allowedTextSearch'

    // if its a target
    if (target !== "allowedQuery" && target !== "allowedTextSearch") {
        res.status(400).send("Invalid target specified.");
        return;  // Make sure to stop execution after sending the response
    }

    const availableRef = db.ref(`users/${userUID}/Account`);  // Reference to the user's account in Firebase

    try {
        const snapshot = await availableRef.get();

        // If no data exists, initialize the user with the default values, only runs if user isnt set up, only for previous accounts
        if (!snapshot.exists()) {
            await availableRef.set({
                securityLevel: 'user',  // Set default security level as 'user'
                allowedQuery: 20,
                allowedTextSearch: 20
            });
            res.status(200).send("User initialized with default values.");
            return;  // Ensure no further execution after sending response
        }

        const currentValue = snapshot.val()[target as "allowedQuery" | "allowedTextSearch"];  // Type assertion

        // Ensure the query count is greater than 0 before decrementing
        if (currentValue <= 0) {
            res.status(400).send("Insufficient calls remaining.");
            return;  // Stop execution after sending response
        }

        // reduce count by 1
        await availableRef.update({
            [target]: currentValue - 1
        });

        res.status(200).send(`${target} updated successfully.`);
    } catch (error) {
        res.status(500).send("Failed to update call amount.");
    }
});

export const resetUserLimits = onSchedule("every day 00:00", async () => {
    const usersRef = db.ref("users");
    const snapshot = await usersRef.get();

    if (!snapshot.exists()) return;

    const updates: Record<string, any> = {};

    snapshot.forEach(child => {
        // refreshes allowed calls daily at midnight
        const uid = child.key;
        updates[`users/${uid}/Account/allowedQuery`] = 20;  // general searches
        updates[`users/${uid}/Account/allowedTextSearch`] = 20; // text scans
    });

    await db.ref().update(updates);
});

export const extractTextFromImage = onRequest(
    { secrets: [imageAPIKey] }, // get the secret key from firebase
    async (req, res) => {
        const { firebaseUrl } = req.body;
        try {
            const apiKey = process.env.IMAGE_TO_TEXT_APIKEY;

            const response = await axios.get(
                `https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(firebaseUrl)}`,
                {
                    headers: {
                        apiKey,
                    },
                }
            );

            const text = response.data.all_text;
            res.status(200).send({ text });
        } catch (error: any) {
            console.error('Failed:', error);
            res.status(500).send('Failed to process image');
        }
    }
);
