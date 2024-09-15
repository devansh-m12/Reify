import { z } from "zod";

// Schema for Songs
const SongsSchema = z.object({
  trackId: z.string(),
});

// Schema for Artist
const ArtistSchema = z.object({
  artistId: z.string(),
});

// Schema for Genre
const GenreSchema = z.object({
  genre: z.string(),
});

// Schema for User
export const UserSchema = z.object({
  spotifyId: z.string(),
  email: z.string().email("Please enter a valid email"),
  preferences: z.object({}),
  genres: z.array(GenreSchema),
  artists: z.array(ArtistSchema),
  likedSongs: z.array(SongsSchema),
});

// Types inferred from the schema
export type User = z.infer<typeof UserSchema>;
export type Songs = z.infer<typeof SongsSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
export type Genre = z.infer<typeof GenreSchema>;
