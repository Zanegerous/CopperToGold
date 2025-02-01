import axios from "axios";
import { ebayConfig } from "./ebayConfig";

interface EbayItem {
  title: string;
  price: { value: string; currency: string };
  image: string;
  condition: string;
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
          limit: 10, // Limit to 10 results
        },
      }
    );

    
    return response.data.itemSummaries.map((item: any) => ({
      title: item.title,
      price: item.price,
      image: item.image?.imageUrl,
      condition: item.condition,
    }));
  } catch (error) {
    console.error("Error fetching eBay data:", error);
    throw new Error("Failed to fetch eBay search results.");
  }
};
