import { generateQuestions } from "@/lib/gemni";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@/auth";
import { searchItem } from "./searchItem";

export async function POST(req: Request, res: Response) {
    await dbConnect();
    const session = await auth();

    if(!session || !session?.user?.accessToken) { 
        return Response.json({ 
            success: false,
            message: "You are not logged in to Spotify"
         }, { status: 401 })
    }

    let query = await req.json();
    console.log("query :: ", query);
    if(!query || query.length === 0 || query === "") {
        query = 'I want to listen to some music be unique and different based on current music trends and think of some good search query'
    }
    try {
        const prompt = `You are a music expert with a strong understanding of how Spotify's search algorithm works. Given the user query "${query}", generate a search query for Spotify. Provide the output as plain text in the following format:

                        searchQuery||market

                        Where:
                        - searchQuery is your generated Spotify search query
                        - market is an ISO 3166-1 alpha-2 country code

                        Guidelines for constructing the searchQuery:
                        1. Use field filters to narrow down the search. Available filters: album, artist, track, year, upc, tag:hipster, tag:new, isrc, and genre.
                        2. Field filter usage:
                        - artist, year: For albums, artists, and tracks. Year can be single or range (e.g., 1955-1960).
                        - album: For albums and tracks.
                        - genre: For artists and tracks.
                        - isrc, track: For tracks only.
                        - upc, tag:new, tag:hipster: For albums only. tag:new returns albums from the last two weeks, tag:hipster returns albums in the lowest 10% popularity.

                        3. Format: search+terms+field:filter

                        For the market field:
                        - Use an ISO 3166-1 alpha-2 country code.
                        - This determines content availability in the specified market.
                        - If omitted, content may be considered unavailable.

                        Example output:
                        remaster%20track:Doxy%20artist:Miles%20Davis||US

                        Ensure your response is in the format searchQuery||market without any additional text or explanation.`;

        const questions = await generateQuestions({ prompt });
        console.log("questions :: ", questions);

        const parseQuestions = (question: string) => {
            const [query, market] = question.split("||");
            return { query, market };
        };
        const parsedQuestions = parseQuestions(questions);
        console.log("parsedQuestions :: ", parsedQuestions);

        const response = await searchItem(parsedQuestions.query, parsedQuestions.market);
        console.log("response :: ", response);
        return Response.json({
            success: true,
            tracks: response?.tracks?.items
        }, { status: 200 })
    } catch (error) {
        console.log("error :: ", error);
        return Response.json({
            success: false,
            message: "Error suggestings Songs"
        }, { status: 500 })
    }
}

