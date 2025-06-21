import { z } from "zod/v4";
import type { Album, Artist, Track, Prisma } from "@prisma/client";

// --- Zod Schemas for Deezer API ---
export type DeezerArtistSchema = z.infer<typeof DeezerArtistSchema>;
export const DeezerArtistSchema = z.object({
  id: z.int(),
  name: z.string(),
  picture: z.url(),
  nb_album: z.int(),
} satisfies Record<keyof Omit<Prisma.ArtistCreateInput, "created_at" | "Album" | "Track">, unknown>);

export type DeezerAlbumSchema = z.infer<typeof DeezerAlbumSchema>;
export const DeezerAlbumSchema = z.object({
  id: z.int(),
  title: z.string(),
  cover: z.url(),
  release_date: z.iso.date().transform((v) => new Date(v)),
  duration: z.int(),
  upc: z.string(),
  label: z.string(),
  record_type: z.string(),
  explicit_lyrics: z.boolean(),
} satisfies Record<keyof Omit<Prisma.AlbumCreateInput, "created_at" | "Artist" | "Track">, unknown>);

export type DeezerTrackSchema = z.infer<typeof DeezerTrackSchema>;
export const DeezerTrackSchema = z.object({
  id: z.int(),
  title: z.string(),
  title_short: z.string(),
  title_version: z.string(),
  duration: z.int(),
  release_date: z.iso.date().transform((v) => new Date(v)),
  explicit_lyrics: z.boolean(),
  preview: z.url(),
  bpm: z.float64(),
  isrc: z.string(),
  disk_number: z.int(),
  gain: z.float64(),
  track_token: z.string(),
  artist: DeezerArtistSchema.pick({
    id: true,
    name: true,
    picture: true,
  }),
  album: DeezerAlbumSchema.pick({
    id: true,
    title: true,
    cover: true,
    release_date: true,
  }),
} satisfies Record<
  keyof Omit<Prisma.TrackCreateInput, "created_at" | "Album" | "Artist" | "Songs"> | "artist" | "album",
  unknown
>);

// --- Deezer Track Search API ---
export const DeezerTrackSearchResultSchema = z.object({
  id: z.number(),
  readable: z.boolean(),
  title: z.string(),
  title_short: z.string(),
  title_version: z.string().optional(),
  link: z.url(),
  duration: z.number(),
  rank: z.number(),
  explicit_lyrics: z.boolean(),
  preview: z.url(),
  artist: z.object({
    id: z.number(),
    name: z.string(),
    link: z.url(),
    picture: z.url(),
    picture_small: z.url(),
    picture_medium: z.url(),
    picture_big: z.url(),
    picture_xl: z.url(),
  }),
  album: z.object({
    id: z.number(),
    title: z.string(),
    cover: z.url(),
    cover_small: z.url(),
    cover_medium: z.url(),
    cover_big: z.url(),
    cover_xl: z.url(),
  }),
});

export const DeezerTrackSearchResponseSchema = z.object({
  data: z.array(DeezerTrackSearchResultSchema),
  total: z.number(),
  next: z.url().optional(),
});

export type DeezerTrackSearchResult = z.infer<typeof DeezerTrackSearchResultSchema>;
export type DeezerTrackSearchResponse = z.infer<typeof DeezerTrackSearchResponseSchema>;

// --- Fetch and Validate Deezer API ---
export async function fetchDeezerTrack(trackId: string | number) {
  const res = await fetch(`https://api.deezer.com/track/${trackId}`);
  const data = await res.json();
  const parsed = DeezerTrackSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

export async function fetchDeezerAlbum(albumId: string | number) {
  const res = await fetch(`https://api.deezer.com/album/${albumId}`);
  const data = await res.json();
  const parsed = DeezerAlbumSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

export async function fetchDeezerArtist(artistId: string | number) {
  const res = await fetch(`https://api.deezer.com/artist/${artistId}`);
  const data = await res.json();
  const parsed = DeezerArtistSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

export async function searchDeezerTracks(query: string) {
  const res = await fetch(`https://api.deezer.com/search/track?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  const parsed = DeezerTrackSearchResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}
