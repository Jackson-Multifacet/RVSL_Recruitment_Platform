import * as React from 'react';
import { useState } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Camera, Loader2 } from 'lucide-react';

interface ProfilePhotoUploadProps {
  userId: string;
  collectionName: 'candidates' | 'staff' | 'clients';
  currentPhotoUrl?: string;
  onUploadSuccess?: (url: string) => void;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ userId, collectionName, currentPhotoUrl, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max size is 5MB.');
      return;
    }

    setUploading(true);
    try {

      const timestamp = Date.now();
      const storageRef = ref(storage, `profile_photos/${userId}/${timestamp}_${file.name}`);

      const uploadResult = await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(uploadResult.ref);

      await updateDoc(doc(db, collectionName, userId), {
        photoUrl: photoUrl
      });

      if (onUploadSuccess) {
        onUploadSuccess(photoUrl);
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      let message = 'Failed to upload photo. Please try again.';
      if (error.code === 'storage/unauthorized') {
        message = 'Permission denied. Please check your Firebase Storage rules.';
      }
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-200">
        {currentPhotoUrl ? (
          <img src={currentPhotoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Camera className="w-8 h-8" />
          </div>
        )}
      </div>
      <label className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-lg">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>
    </div>
  );
};
