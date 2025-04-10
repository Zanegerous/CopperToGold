import { AccessibilityInfo, Alert, Linking } from "react-native";

export const ebayConfig = {
  baseURL: "https://api.ebay.com",
  clientId: "ColemanZ-browseap-PRD-7833b1855-9e455503",
  redirect_uri: "Coleman_Zuehlke-ColemanZ-browse-lhfnzinzp",
};

export const loginWithEbay = async (uid: any) => {
  console.log("UID recieved: ", uid)
  const scopes = [
    "https://api.ebay.com/oauth/api_scope",
    "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.marketing",
    "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.account",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
    "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.finances",
    "https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
    "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.reputation",
    "https://api.ebay.com/oauth/api_scope/sell.reputation.readonly",
    "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
    "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly",
    "https://api.ebay.com/oauth/api_scope/sell.stores",
    "https://api.ebay.com/oauth/api_scope/sell.stores.readonly",
    "https://api.ebay.com/oauth/scope/sell.edelivery",
  ].join(' ');

  const authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${ebayConfig.clientId}&response_type=code&redirect_uri=${ebayConfig.redirect_uri}&scope=${scopes}&state=${uid}`;


  try {
    const supported = await Linking.canOpenURL(authUrl);
    if (supported) {
      await Linking.openURL(authUrl);
    } else {
      Alert.alert('Unable to open URL');
    }
  } catch (error) {
    Alert.alert('An error occurred', error instanceof Error ? error.message : String(error));
  }
};
