export function omit<T extends Record<string | number | symbol, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const copy = { ...obj };
  for (const key of keys) delete copy[key];
  return copy;
}

export function getContentType(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop();

  switch (extension) {
    case "mid":
    case "midi":
      return "audio/midi";
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    case "wav":
      return "audio/wav";
    case "flac":
      return "audio/flac";
    case "aac":
      return "audio/aac";
    default:
      return "application/octet-stream";
  }
}

export function validateFileType(filename: string): { isValid: boolean; type: "midi" | "audio" | "invalid" } {
  const extension = filename.toLowerCase().split(".").pop();

  if (!extension) return { isValid: false, type: "invalid" };

  const midiExtensions = ["mid", "midi"];
  const audioExtensions = ["mp3", "ogg", "wav", "flac", "aac"];

  if (midiExtensions.includes(extension)) {
    return { isValid: true, type: "midi" };
  }

  if (audioExtensions.includes(extension)) {
    return { isValid: true, type: "audio" };
  }

  return { isValid: false, type: "invalid" };
}
