# File Upload Setup Guide

This application now supports uploading MIDI and audio files to AWS S3. Here's what you need to set up:

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region (e.g., us-east-1)
AWS_S3_BUCKET=your_s3_bucket_name
```

## AWS S3 Bucket Setup

1. Create an S3 bucket in your AWS account
2. Configure CORS for your bucket to allow uploads from your domain:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

3. Create an IAM user with the following permissions:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`

## Features Implemented

### File Upload Functionality
- **Supported file types**: MIDI (.mid, .midi) and Audio (.mp3, .ogg, .wav, .flac, .aac)
- **File limits**: Maximum 20 files per song, 10MB total size limit
- **Upload method**: Direct upload to S3 using presigned URLs
- **UI**: Drag-and-drop interface using Uppy Dashboard

### Database Integration
- **Song creation**: Creates both Track and Songs objects in the database
- **File organization**: Files are stored in S3 under `songs/{songId}/` directory
- **File tracking**: Uploaded files are tracked and displayed in the UI

### User Flow
1. User searches for a track on Deezer
2. User selects a track and confirms
3. System creates Track and Songs objects in the database
4. User is presented with file upload interface
5. User can drag/drop or select files to upload
6. Files are uploaded directly to S3 using presigned URLs
7. User can finish the process

## API Endpoints

### tRPC Router: `s3.generatePresignedUrl`
- **Input**: `{ filename, songId, contentType? }`
- **Output**: `{ presignedUrl, key, contentType, fileType }`

### REST API: `/api/s3/presigned-url`
- **Method**: POST
- **Body**: `{ filename, songId, contentType? }`
- **Response**: Same as tRPC endpoint

## Components

### FileUpload Component
- Located at `src/app/_components/FileUpload.tsx`
- Uses Uppy for file handling and upload
- Integrates with AWS S3 via presigned URLs
- Provides real-time upload progress and file management

### Updated AddSongForm
- Located at `src/app/songs/AddSongForm.tsx`
- Two-step process: track selection → file upload
- Integrates with the FileUpload component
- Creates songs in the database

## Utilities

### S3 Utilities (`src/utils/s3.ts`)
- `generatePresignedUrl()`: Creates presigned URLs for S3 uploads
- `validateFileType()`: Validates file extensions
- `getContentType()`: Maps file extensions to MIME types
- `createSongDirectory()`: Creates S3 directory structure

## Notes

- The current implementation uses a placeholder user ID ("user") for song creation
- File metadata (midis/musics arrays) are currently empty and would need to be updated after upload
- Error handling is implemented for file type validation and upload failures
- The UI provides feedback on file limits and upload progress 