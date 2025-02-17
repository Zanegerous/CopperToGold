import axios from "axios";
import { ebayConfig } from "./ebayConfig";

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

  let returnItems: EbayItem[] = [];
  let searchOffset = 0;
  try {
    do {
      const response: any = await axios.get(
        `${ebayConfig.baseURL}/buy/browse/v1/item_summary/search`,
        {
          headers: {
            Authorization: `Bearer ${ebayConfig.accessToken}`,
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

  } catch (error) {
    console.error("Error fetching eBay data:", error);
    throw new Error("Failed to fetch eBay search results.");
  }
  return returnItems;
};

export const searchEbayByImage = async (imageQuery: string): Promise<EbayItem[]> => {
  const DESIRED_ITEMS = 1000;
  const SEARCH_LIMIT = 200; // must be under 200

  let returnItems: EbayItem[] = [];
  let searchOffset = 0;
  try {
    do {
      const response = await axios.post(
        `${ebayConfig.baseURL}/buy/browse/v1/item_summary/search_by_image`,
        {
          image: imageQuery,
        },
        {
          headers: {
            Authorization: `Bearer ${ebayConfig.accessToken}`,
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

  } catch (error) {
    console.error("Error fetching eBay data:", error);
    throw new Error("Failed to fetch eBay search results.");
  }

  return returnItems;
};
