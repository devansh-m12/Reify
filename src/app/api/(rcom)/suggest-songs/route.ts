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
        const prompt = `You are a music expert specializing in Spotify searches. Given the user query "${query}", extract the most relevant information for a Spotify search. Provide the output as:

                        searchQuery||market

                        Guidelines for searchQuery:
                        1. Extract 2-3 key terms from the query, even if it's lengthy.
                        2. Use Spotify's search syntax and available filters: album, artist, track, year, upc, tag:hipster, tag:new, isrc, and genre.
                        3. Apply filters based on the search context:
                        - artist, year: For albums, artists, and tracks (year can be single or range, e.g., 1955-1960)
                        - album: For albums and tracks
                        - genre: For artists and tracks
                        - isrc, track: For tracks only
                        - upc, tag:new, tag:hipster: For albums only (tag:new for albums from last two weeks, tag:hipster for lowest 10% popularity)
                        4. Format: term1+term2+field:filter
                        5. URL encode special characters

                        For market, use a relevant ISO 3166-1 alpha-2 country code.

                        Example outputs:
                        remaster%20track:Doxy%20artist:Miles%20Davis||US
                        genre:rock%20year:1970-1979||GB

                        Provide only the searchQuery||market format without any extra text.`;

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

