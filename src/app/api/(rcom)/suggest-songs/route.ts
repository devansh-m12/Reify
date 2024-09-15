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
        const prompt = `You are a friendly Spotify search expert. For the user query "${query}", provide:

                        searchQuery||market||Choicesummary

                        searchQuery: Extract 2-3 key terms. Use Spotify syntax (artist, album, track, year, genre, isrc, upc, tag:new, tag:hipster). Format: term1+term2+field:filter. URL encode special characters.

                        market: Use relevant ISO 3166-1 alpha-2 country code.

                        Choicesummary: In 2-3 lines, provide a polite, human-like summary:
                        1. "According to your search, we find you have great interest in..."
                        2. Suggest related artists or genres: "You might like..."
                        3. End with: "Here are the best results we found on Spotify according to your preference."

                        Example:
                        remaster%20track:Doxy%20artist:Miles%20Davis||US||According to your search, we find you have great interest in Miles Davis and jazz remastered tracks. You might like other jazz legends such as John Coltrane or Thelonious Monk. Here are the best results we found on Spotify according to your preference.

                        Provide only the searchQuery||market||Choicesummary format without extra text.`;

        const questions = await generateQuestions({ prompt });
        console.log("questions :: ", questions);

        const parseQuestions = (question: string) => {
            const [query, market, Choicesummary] = question.split("||");
            return { query, market, Choicesummary };
        };
        const parsedQuestions = parseQuestions(questions);
        console.log("parsedQuestions :: ", parsedQuestions);
        const response = await searchItem(parsedQuestions.query, parsedQuestions.market);
        return Response.json({
            success: true,
            tracks: response?.tracks?.items,
            Choicesummary: parsedQuestions.Choicesummary
        }, { status: 200 })
    } catch (error) {
        console.log("error :: ", error);
        return Response.json({
            success: false,
            message: "Error suggestings Songs"
        }, { status: 500 })
    }
}

