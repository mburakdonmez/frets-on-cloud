"use server";

import { PrismaClient } from "@prisma/client";
import { fetchDeezerAlbum, fetchDeezerArtist, fetchDeezerTrack, searchDeezerTracks } from "@/utils/deezer";

const prisma = new PrismaClient();

export async function createTrack(track_id: string) {
  const trackData = await fetchDeezerTrack(track_id);

  const artistDataPromise = fetchDeezerArtist(trackData.artist.id);
  const albumDataPromise = fetchDeezerAlbum(trackData.album.id);

  const artistData = await artistDataPromise;

  const artist = await prisma.artist.upsert({
    select: { id: true },
    create: { ...artistData, nb_album: artistData.nb_album ?? null },
    update: { ...artistData, nb_album: artistData.nb_album ?? null },
    where: { id: artistData.id },
  });

  const albumData = await albumDataPromise;

  const album = await prisma.album.upsert({
    select: { id: true },
    create: { ...albumData, artist: artist.id },
    update: { ...albumData, artist: artist.id },
    where: { id: albumData.id },
  });

  const track = await prisma.track.upsert({
    select: { id: true },
    create: { ...trackData, artist: artist.id, album: album.id },
    update: { ...trackData, artist: artist.id, album: album.id },
    where: { id: trackData.id },
  });

  return track;
}

export async function createSong(track_id: string, created_by: string) {
  // First create the track
  const track = await createTrack(track_id);

  // Then create the song referencing the track
  const song = await prisma.songs.create({
    data: { track: track.id, created_by },
  });

  return song;
}

export async function searchDeezerTracksServer(query: string) {
  "use server";
  if (!query || query.length < 2) return { data: [] };
  return await searchDeezerTracks(query);
}
