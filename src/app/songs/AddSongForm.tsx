"use client";
import React, { useRef, useTransition, useState } from "react";
import { createSong, searchDeezerTracksServer } from "./actions";
import { type DeezerTrackSearchResult } from "@/utils/deezer";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { useDebounce } from "@uidotdev/usehooks";
import SongEntry from "@/app/_components/SongEntry";
import FileUpload from "@/app/_components/FileUpload";

// --- UI Skeleton ---
export type AddSongFormProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddSongForm({ open, onClose }: AddSongFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [results, setResults] = useState<DeezerTrackSearchResult[]>([]);
  const [selected, setSelected] = useState<DeezerTrackSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [songId, setSongId] = useState<string | null>(null);
  const [step, setStep] = useState<"search" | "upload">("search");

  // Live search handler
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setSelected(null);
    setError(null);
  }

  React.useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchDeezerTracksServer(debouncedSearch)
      .then((data) => {
        if (!cancelled) setResults(data.data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to fetch tracks");
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  function handlePlay(track: DeezerTrackSearchResult) {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.preview || "";
        audioRef.current.play();
      }
      setPlayingId(track.id);
    }
  }

  function handleAudioEnded() {
    setPlayingId(null);
  }

  function handleTrackSelection() {
    if (!selected) return;

    startTransition(async () => {
      try {
        // Create the song in the database
        const song = await createSong(selected.id.toString(), "user"); // TODO: Get actual user ID
        setSongId(song.id.toString());
        setStep("upload");
      } catch (error) {
        console.error("Failed to create song:", error);
        setError("Failed to create song. Please try again.");
      }
    });
  }

  function handleUploadComplete() {}

  function handleFinish() {
    // TODO: Update song with uploaded file information
    formRef.current?.reset();
    setSearch("");
    setResults([]);
    setSelected(null);
    setSongId(null);
    setStep("search");

    onClose();
  }

  function handleBack() {
    setStep("search");
    setSongId(null);
  }

  if (!open) return null;

  return (
    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-8 shadow-lg">
        <button
          className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="mb-4 text-xl font-semibold">{step === "search" ? "Add New Song" : "Upload Your Song Files"}</h2>

        {step === "search" ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-1">
              <span className="font-medium">Search a track</span>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full rounded border px-3 py-2 pr-10"
                  placeholder="Type to search for a track..."
                  disabled={isPending}
                  autoComplete="off"
                />
                {searching && (
                  <span className="absolute inset-y-0 right-2 flex items-center">
                    <LoadingSpinner className="h-5 w-5 animate-spin text-gray-400" />
                  </span>
                )}
              </div>
            </label>

            {error && <div className="text-sm text-red-500">{error}</div>}

            {results.length > 0 && !selected && (
              <>
                <audio ref={audioRef} onEnded={handleAudioEnded} />
                <ul className="max-h-48 divide-y overflow-y-auto rounded border bg-gray-50">
                  {results.map((track) => (
                    <SongEntry
                      key={track.id}
                      track={track}
                      onSelect={() => setSelected(track)}
                      playing={playingId === track.id}
                      onPlayStart={() => setPlayingId(track.id)}
                      onPlayStop={() => setPlayingId(null)}
                    />
                  ))}
                </ul>
              </>
            )}

            {selected && (
              <div className="space-y-2">
                <SongEntry
                  track={selected}
                  onSelect={() => {}}
                  playing={playingId === selected.id}
                  onPlayStart={() => handlePlay(selected)}
                  onPlayStop={() => {
                    audioRef.current?.pause();
                    setPlayingId(null);
                  }}
                />
                <button
                  type="button"
                  className="w-full cursor-pointer rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setSelected(null)}
                >
                  Change Selection
                </button>
              </div>
            )}

            <button
              type="button"
              className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
              disabled={isPending || !selected}
              onClick={handleTrackSelection}
            >
              {isPending ? "Creating Song..." : "Continue to Upload"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {songId && <FileUpload songId={songId} />}

            <div className="flex justify-between">
              <button
                type="button"
                className="cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                onClick={handleBack}
              >
                Back to Search
              </button>

              <button
                type="button"
                className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                onClick={handleFinish}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
