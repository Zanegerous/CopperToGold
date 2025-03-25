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

admin.initializeApp();
const db = admin.database();
const CID = "XXXXXXXXXXXXXXXXXXXXXXX";
const CSe = "XXXXXXXXXXXXXXXXXXXXXXX";


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
