import React, { useRef, useEffect, useState } from "react";
import type { DeezerTrackSchema } from "@/utils/deezer";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getCoverUrl(cover: string, size: "small" | "medium" | "big" | "xl") {
  const url = new URL(cover);
  url.searchParams.set("size", size);
  return url.href;
}

export type SongEntryType = Pick<DeezerTrackSchema, "preview" | "explicit_lyrics" | "title" | "duration"> & {
  album: Pick<DeezerTrackSchema["album"], "cover" | "title">;
  artist: Pick<DeezerTrackSchema["artist"], "name">;
};

export type SongEntryProps = {
  track: SongEntryType;
  onSelect: () => void;
  playing: boolean;
  onPlayStart: () => void;
  onPlayStop: () => void;
};

export default function SongEntry({ track, onSelect, playing, onPlayStart, onPlayStop }: SongEntryProps) {
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play/pause audio based on 'playing' prop
  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      audioRef.current.pause();
      setAudioProgress(0);
    }
  }, [playing]);

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (playing) {
      onPlayStop();
    } else {
      onPlayStart();
    }
  }

  function handleAudioEnded() {
    setAudioProgress(0);
    onPlayStop();
  }

  function handleAudioTimeUpdate() {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime / 30);
    }
  }

  return (
    <li className={`flex cursor-pointer items-center gap-2 p-2 hover:bg-blue-100`} onClick={onSelect}>
      <audio ref={audioRef} src={track.preview || ""} onEnded={handleAudioEnded} onTimeUpdate={handleAudioTimeUpdate} />
      <button
        type="button"
        className="relative mr-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white p-0 hover:bg-gray-200"
        onClick={handlePlay}
        aria-label={playing ? "Pause preview" : "Play preview"}
      >
        {/* Progress Circle */}
        <span className="absolute inset-0 flex items-center justify-center">
          {playing && (
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeDasharray={2 * Math.PI * 14}
                strokeDashoffset={2 * Math.PI * 14 * (1 - audioProgress)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
          )}
        </span>
        <span className="absolute inset-0 z-10 flex items-center justify-center">
          {playing ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-blue-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-blue-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25l13.5 6.75-13.5 6.75V5.25z" />
            </svg>
          )}
        </span>
      </button>
      <img src={getCoverUrl(track.album.cover, "small")} alt="cover" className="h-8 w-8 rounded" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate font-medium">{track.title}</span>
          {track.explicit_lyrics && (
            <span className="ml-1 rounded bg-red-600 px-1.5 py-0.5 align-middle text-xs font-bold text-white uppercase">
              E
            </span>
          )}
        </div>
        <div className="truncate text-xs text-gray-500">
          {track.artist.name} &ndash; {track.album.title}
        </div>
      </div>
      <span className="ml-2 text-xs text-gray-500 tabular-nums">{formatDuration(track.duration)}</span>
    </li>
  );
}
