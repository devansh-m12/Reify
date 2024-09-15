import mongoose, { Schema,Document } from "mongoose";

export interface ISongs extends Document {
    trackId: string;
}

const SongsSchema:Schema<ISongs> = new Schema({
    trackId: { type: String, required: true },
});

export interface IArtist extends Document {
    artistId: string;
}

const ArtistSchema:Schema<IArtist> = new Schema({
    artistId: { type: String, required: true },
});

export interface IGenre extends Document {
    genre: string;
}

const GenreSchema:Schema<IGenre> = new Schema({
    genre: { type: String, required: true },
});


export interface IUser extends Document {
    spotifyId: string;
    email: string;
    preferences: {
        mood: string;
        tempo: string;
        genre: string;
    };
    genres: IGenre[];
    artists: IArtist[];
    likedSongs: ISongs[];
}

const UserSchema:Schema<IUser> = new Schema({
    spotifyId: { type: String, required: [true, "Spotify ID is required"] },
    email: { type: String, required: [true, "Email is required"], match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"] },
    preferences: {
        mood: { type: String, required: [true, "Mood is required"] },
        tempo: { type: String, required: [true, "Tempo is required"] },
        genre: { type: String, required: [true, "Genre is required"] },
    },
    genres: [GenreSchema],
    artists: [ArtistSchema],
    likedSongs: [SongsSchema],
});
const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export default User;