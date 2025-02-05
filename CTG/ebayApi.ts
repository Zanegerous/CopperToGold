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
  try {
    const response = await axios.get(
      `${ebayConfig.baseURL}/buy/browse/v1/item_summary/search`,
      {
        headers: {
          Authorization: `Bearer ${ebayConfig.accessToken}`,
        },
        params: {
          q: query, // Search query
          limit: 200, // Limit to 10 results
        },
      }
    );


    return response.data.itemSummaries.map((item: any) => ({
      title: item.title,
      price: item.price,
      image: item.image?.imageUrl,
      condition: item.condition,
      id: item.itemId,
    }));
  } catch (error) {
    console.error("Error fetching eBay data:", error);
    throw new Error("Failed to fetch eBay search results.");
  }
};

export const searchEbayByImage = async (imageQuery: string): Promise<EbayItem[]> => {
  try {
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
          limit: 200
        }
      }

    );

    try {
      return response.data.itemSummaries.map((item: any) => ({
        title: item.title,
        price: item.price,
        image: item.image?.imageUrl,
        condition: item.condition,
        id: item.itemId,
      }));
    } catch (error) {
      console.log("Cant send: ", error)
      return ([])
    }

  } catch (error) {
    console.error("Error fetching eBay data:", error);
    throw new Error("Failed to fetch eBay search results.");
  }
};
