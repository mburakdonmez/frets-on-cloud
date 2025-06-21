import { z } from "zod/v4";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { generatePresignedUrl } from "@/utils/s3";
import { getContentType, validateFileType } from "@/utils/utils";

export const s3Router = createTRPCRouter({
  generatePresignedUrl: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        songId: z.string(),
        contentType: z.string().optional(),
        contentLength: z.int(),
      }),
    )
    .mutation(async ({ input }) => {
      const { filename, songId, contentType, contentLength } = input;
      const expiresIn = 3600; // 1 hour
      const MAX_FILE_SIZE = 10_000_000; // 10 MB

      if (contentLength > MAX_FILE_SIZE)
        throw new Error(`File too big, MAX_FILE_SIZE: ${MAX_FILE_SIZE}, Received: ${contentLength}`);

      // Validate file type
      const validation = validateFileType(filename);
      if (!validation.isValid) throw new Error(`Invalid file type: ${filename}`);

      // Create the S3 key
      const directory = `songs/${songId}/`;
      const key = `${directory}${filename}`;

      // Get content type
      const fileContentType = contentType ?? getContentType(filename);

      // Generate presigned URL
      const presignedUrl = await generatePresignedUrl({
        key,
        contentType: fileContentType,
        expiresIn, // 1 hour
        contentLength,
      });

      return {
        presignedUrl,
        key,
        contentType: fileContentType,
        fileType: validation.type,
        expiresIn,
      };
    }),
});
