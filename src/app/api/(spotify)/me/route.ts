import { auth } from "@/auth";
import axios, { AxiosError } from "axios";

export async function GET(req: Request, res: Response) {
    const session = await auth()
    
    if(!session || !session?.user?.accessToken) { 
        return Response.json({ 
            success: false,
            message: "You are not logged in to Spotify"
         }, { status: 401 })
    }

   try{
        const response = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${session?.user?.accessToken}`
            }
        })
        const data = await response.data
        return Response.json({
            success: true,
            data    
        }, { status: 200 })
   } catch (error) {
        if(error instanceof AxiosError) {
            console.log("Error fetching user data", error)

            return Response.json({
                    success: false,
                    message: "Error fetching user data",
                    displayMessage: error.response?.data
            }, { status: 500 })
        }
   }
    

    
}