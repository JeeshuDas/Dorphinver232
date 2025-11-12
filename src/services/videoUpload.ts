/**
 * Direct video upload to Supabase Storage (bypasses Edge Function payload limits)
 */

import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-148a8522`;

// Mock user ID for demo purposes (matches AuthContext mock user)
const MOCK_USER_ID = 'demo-user-id';

export async function uploadVideoToStorage(
  videoFile: File,
  thumbnailFile: File | null,
  metadata: {
    title: string;
    description?: string;
    category: 'short' | 'long';
    shortCategory?: string;
    duration: number;
  }
): Promise<any> {
  console.log('📹 Starting direct storage upload...');
  console.log('📦 Video file size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');

  const supabase = createClient();
  
  // Get current user session (if available)
  const { data: { session } } = await supabase.auth.getSession();
  
  // Use session user ID if available, otherwise use mock user ID
  const userId = session?.user?.id || MOCK_USER_ID;
  const accessToken = session?.access_token || publicAnonKey;
  
  console.log('👤 Using user ID:', userId);

  const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Upload video directly to Supabase Storage
  console.log('📤 Uploading video to storage...');
  const videoExt = videoFile.name.split('.').pop();
  const videoPath = `${userId}/${videoId}.${videoExt}`;
  
  const { data: videoUploadData, error: videoUploadError } = await supabase.storage
    .from('make-148a8522-dorphin-videos')
    .upload(videoPath, videoFile, {
      contentType: videoFile.type,
      upsert: false,
    });

  if (videoUploadError) {
    console.error('❌ Video upload error:', videoUploadError);
    throw new Error(`Failed to upload video: ${videoUploadError.message}`);
  }

  console.log('✅ Video uploaded to storage:', videoUploadData.path);

  // Upload thumbnail if provided
  let thumbnailPath = '';
  if (thumbnailFile) {
    console.log('📤 Uploading thumbnail...');
    const thumbnailExt = thumbnailFile.name.split('.').pop();
    thumbnailPath = `${userId}/${videoId}_thumb.${thumbnailExt}`;
    
    const { error: thumbnailUploadError } = await supabase.storage
      .from('make-148a8522-dorphin-thumbnails')
      .upload(thumbnailPath, thumbnailFile, {
        contentType: thumbnailFile.type,
        upsert: false,
      });

    if (thumbnailUploadError) {
      console.warn('⚠️ Thumbnail upload error:', thumbnailUploadError);
      // Don't fail the entire upload if thumbnail fails
    } else {
      console.log('✅ Thumbnail uploaded to storage');
    }
  }

  // Now call the backend API to save metadata (much smaller payload)
  console.log('💾 Saving video metadata to database...');
  
  const response = await fetch(`${API_BASE_URL}/videos/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      videoId,
      videoPath,
      thumbnailPath,
      title: metadata.title,
      description: metadata.description || '',
      category: metadata.category,
      shortCategory: metadata.shortCategory,
      duration: metadata.duration,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Metadata save error:', errorData);
    throw new Error(errorData.error || 'Failed to save video metadata');
  }

  const result = await response.json();
  console.log('✅ Video metadata saved successfully!');
  
  return result.video;
}