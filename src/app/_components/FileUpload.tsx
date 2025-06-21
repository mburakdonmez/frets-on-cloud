"use client";
import React, { useEffect, useRef, useState } from "react";
import Uppy from "@uppy/core";
import AwsS3, { type AwsBody } from "@uppy/aws-s3";
import { Dashboard } from "@uppy/react";
import { api } from "@/trpc/react";
import { env } from "@/env";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

function createUppy(
  songId: string,
  generatePresignedUrlMutation: ReturnType<typeof api.s3.generatePresignedUrl.useMutation>,
) {
  const uppy = new Uppy<Record<string, unknown>, AwsBody>({
    restrictions: {
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      maxNumberOfFiles: 20,
      allowedFileTypes: [".mid", ".midi", ".mp3", ".ogg", ".wav", ".flac", ".aac"],
    },
    autoProceed: false,
  }).use(AwsS3, {
    endpoint: env.NEXT_PUBLIC_AWS_S3_ENDPOINT,
    async getUploadParameters(file) {
      if (!file.name) throw new Error("File.name is undefined");
      try {
        const result = await generatePresignedUrlMutation.mutateAsync({
          filename: file.name,
          songId,
          contentType: file.type || "application/octet-stream",
          contentLength: file.data.size,
        });

        console.log(result.presignedUrl);

        return {
          method: "PUT",
          url: result.presignedUrl,
          fields: {},
          headers: { "content-type": result.contentType },
          expires: result.expiresIn,
        };
      } catch (error) {
        console.error("Failed to generate presigned URL:", error);
        throw error;
      }
    },
  });

  return uppy;
}

export type FileUploadProps = {
  songId: string;
};

export default function FileUpload({ songId }: FileUploadProps) {
  const generatePresignedUrlMutation = api.s3.generatePresignedUrl.useMutation();
  const [uppy, _setUppy] = useState(() => createUppy(songId, generatePresignedUrlMutation));

  return (
    <>
      <p className="text-sm text-gray-500">
        Upload MIDI and audio files (MP3, OGG, WAV, FLAC, AAC). Max 20 files, 10MB total.
      </p>

      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:bg-gray-100">
        <Dashboard uppy={uppy} height="50vh" />
      </div>
    </>
  );
}
