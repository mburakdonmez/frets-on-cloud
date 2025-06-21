"use client";
import React, { useEffect, useState } from "react";
import AddSongForm from "./AddSongForm";
import type { Tables } from "@/database.types";
import { createClient } from "../../supabase/client";

// --- CRUD Operation Stubs ---
export async function fetchSongs(): Promise<Tables<"Track">[]> {
  return [];
}

export async function deleteSong(songId: string): Promise<void> {
  // TODO: Implement delete logic
}

// --- Page UI ---
export default function SongsPage() {
  const [showForm, setShowForm] = useState(false);
  const [songs, setSongs] = useState<Tables<"Track">[]>([]);

  const client = createClient();

  useEffect(() => {
    const getSongs = async () => {
      const songs = await client.from("Track").select();
    };

    void getSongs();
  }, [client]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Songs</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          Add New Song...
        </button>
      </div>
      {/* Song List Skeleton */}
      <div className="mb-8 rounded border bg-gray-50 p-6 text-center text-gray-400">Song list will appear here.</div>
      {/* Add Song Form Component */}
      <AddSongForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
