import axios from "axios";
import { ebayConfig, loginWithEbay } from "./ebayConfig";
import { ref as dbRef, getDatabase, get, remove, set, ref } from 'firebase/database'
import { useState } from "react";
import { auth } from "./app/firebaseconfig/firebase";


const retrieveToken = async (uid: string) => {
  try {
    const db = getDatabase();
    const ref = dbRef(db, `users/${uid}/token`);
    const user = auth.currentUser;

    const data = await get(ref);

    if (!data.exists()) {
      alert('log in and try again');
      loginWithEbay(user!.uid);
      return 'none';
    } else {
      // console.log(data.val().ebayToken);
      return (data.val().ebayToken);
    }

  } catch (error) {
    console.log(error);
    return '';
  }
}

const refreshToken = async (uid: string) => {
  // refreshes the token in the database on the back end
  try {
    const response = await axios.get(`https://tokenrefresh-5ezxsoqfna-uc.a.run.app?state=${uid}`);
    if (response.status == 200) {
      console.log("successful refresh");
    } else { // Add in logic here for an else if for when the return says new login is needed.
      console.log("error");
    }
  } catch (error) {
    console.log('Error', error);
  }
}

interface EbayItem {
  title: string;
  price: { value: string; currency: string };
  image: string;
  condition: string;
  id: string;
}

// Function to search items on eBay
export const searchEbay = async (query: string): Promise<EbayItem[]> => {
  const DESIRED_ITEMS = 1000;
  const SEARCH_LIMIT = 200; // must be under 200
  const user = auth.currentUser;
  let returnItems: EbayItem[] = [];
  let searchOffset = 0;
  let retry = false;

  // retry's if refresh is an option
  for (let attempt = 1; attempt <= 2; attempt++) {
    let accessToken = await retrieveToken(user!.uid); // always grabs the latest token
    if (accessToken == 'none') {
      break;
    }
    try {
      do {
        const response: any = await axios.get(
          `${ebayConfig.baseURL}/buy/browse/v1/item_summary/search`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              q: query, // Search query
              limit: SEARCH_LIMIT,
              offset: searchOffset,
            },
          }
        );

        const fetchedItems = response.data.itemSummaries.map((item: any) => ({
          title: item.title,
          price: item.price,
          image: item.image?.imageUrl,
          condition: item.condition,
          id: item.itemId,
        }));

        returnItems = [...returnItems, ...fetchedItems];

        // If check to see if it has hit tne end of the search so it doesnt get stuck in a loop
        if (fetchedItems.length < SEARCH_LIMIT) {
          break;
        }

        searchOffset += SEARCH_LIMIT;
      } while (searchOffset < DESIRED_ITEMS);
    } catch (error: any) {

      if (error.response) {
        if (error.response.status === 400) {
          return returnItems;
        }
        if (error.response.status == 401) {
          console.log(" Refresh Attempt ")
          await refreshToken(user!.uid);
          retry = true;
        } else {
          console.error(error);
          return returnItems;
        }
      }

      if (attempt == 2) {
        console.error(error);
        throw new Error("Failed to fetch eBay search results.");
      }
    }

    if (retry == false) {
      break;
    }

  }
  return returnItems;
};

export const searchEbayByImage = async (imageQuery: string): Promise<EbayItem[]> => {
  const DESIRED_ITEMS = 1000;
  const SEARCH_LIMIT = 200; // must be under 200
  const user = auth.currentUser;
  let returnItems: EbayItem[] = [];
  let searchOffset = 0;
  let retry = false;

  // retry's once if token is expired 
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const accessToken = await retrieveToken(user!.uid);
      if (accessToken == 'none') {
        break;
      }
      do {
        const response = await axios.post(
          `${ebayConfig.baseURL}/buy/browse/v1/item_summary/search_by_image`,
          {
            image: imageQuery,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              limit: SEARCH_LIMIT,
              offset: searchOffset,
            }
          }
        );

        const fetchedItems = response.data.itemSummaries.map((item: any) => ({
          title: item.title,
          price: item.price,
          image: item.image?.imageUrl,
          condition: item.condition,
          id: item.itemId,
        }));

        // If check to see if it has hit the end of the search so it doesnt get stuck in a loop
        if (fetchedItems.length < SEARCH_LIMIT) {
          break;
        }
        returnItems = [...returnItems, ...fetchedItems];

        searchOffset += SEARCH_LIMIT;
      } while (searchOffset < DESIRED_ITEMS);

    } catch (error: any) {
      console.error("Error fetching eBay data:", error);

      if (error.response) {
        if (error.response.status == 401) {
          console.log(" Refresh Attempt ")
          await refreshToken(user!.uid);
          retry = true;
        } else {
          console.error(error);
          return returnItems;
        }
      }

      if (attempt >= 2) {
        console.error(error);
        throw new Error("Failed to fetch eBay search results.");

      }
    }
    // data had no error retrieving
    if (retry == false) {
      break;
    }
  }
  return returnItems;
};
