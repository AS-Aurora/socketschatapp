"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ProfileImageUploadProps {
  currImgId?: string;
  userId: string;
  onSuccess?: (imageUrl: string) => void;
}

const ProfileImageUpload = ({
  currImgId = "/default.img",
  userId,
  onSuccess,
}: ProfileImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState(currImgId);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if(!file.type.startsWith('image/')) {
        setError('Invalid file type. Please upload correct image.');
        return;
    }

    if(file.size > 5* 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
    }

    setError('')
    setIsUploading(true)

    try {
        const formData = new FormData();
        formData.append('image', file)

        const response = await axios.post('/api/profile/upload', formData)

        if(!response.data.success) {
            throw new Error(response.data.message || 'An error occurred')
        }

        setImageUrl(response.data.user.profilePicture)

        if(onSuccess) {
            onSuccess(response.data.user.profilePicture)
        }

        router.refresh()

    } catch (error: any) {
        setError(error.message)
    } finally {
        setIsUploading(false)
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-colors"
        onClick={handleImageClick}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile Picture"
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <button
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        onClick={handleImageClick}
      >
        Change Profile Picture
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ProfileImageUpload;