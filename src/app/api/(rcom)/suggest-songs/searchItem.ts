import { auth } from "@/auth";
import axios from "axios";

export async function searchItem(query: string, market: string) {
    const session = await auth();
    try {
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&market=${market}&limit=10`, {
            headers: {
                Authorization: `Bearer ${session?.user?.accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error searching for item", error);
        throw new Error("Error searching for item");
    }
}