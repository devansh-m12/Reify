import { auth } from "@/auth";

export async function GET(req: Request, res: Response) {
    const session = await auth()
    
    if(!session || !session?.user?.accessToken) { 
        return Response.json({ 
            success: false,
            message: "You are not logged in to Spotify"
         }, { status: 401 })
    }

   try{
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`
        }
    })

    const data = await response.json()
    return Response.json({
        success: true,
        data    
    }, { status: 200 })
   } catch (error) {
    console.log("Error fetching user data", error)
    return Response.json({
        success: false,
        message: "Error fetching user data"
    }, { status: 500 })
   }
    

    
}