"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

const s3Client = new S3Client({
  endpoint: env.NEXT_PUBLIC_AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: "auto",
});

export type PresignedUrlRequest = {
  key: string;
  contentType: string;
  expiresIn?: number;
  contentLength: number;
};

export async function generatePresignedUrl({ key, contentType, expiresIn = 3600, contentLength }: PresignedUrlRequest) {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn,
    signableHeaders: new Set(["content-length", "content-type"]),
  });
}
