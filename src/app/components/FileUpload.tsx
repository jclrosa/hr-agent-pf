'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onFileUploaded?: (filename: string) => void;
  className?: string;
}

export default function FileUpload({ onFileUploaded, className = '' }: FileUploadProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!session?.user?.email) {
      toast.error('Please log in to upload files.');
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        // Get user ID from session or create user if needed
        let userId = null;
        try {
          const userResponse = await fetch(`/api/users?email=${session.user.email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.user.id;
          } else {
            // Create user if doesn't exist
            const createResponse = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                name: session.user.name || '',
                company: '',
              }),
            });
            if (createResponse.ok) {
              const userData = await createResponse.json();
              userId = userData.user.id;
            }
          }
        } catch (error) {
          console.error('Error getting user:', error);
          toast.error('Error getting user information.');
          continue;
        }

        if (!userId) {
          toast.error('Could not identify user. Please try again.');
          continue;
        }

        const response = await fetch(`/api/uploads?userId=${userId}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 403) {
            toast.error(errorData.error || 'File upload requires Self-Serve plan or higher');
          } else {
            throw new Error(errorData.error || `Failed to upload ${file.name}`);
          }
          continue;
        }

        await response.json();
        setUploadedFiles(prev => [...prev, file.name]);
        onFileUploaded?.(file.name);
        
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          multiple
          accept=".txt,.md,.pdf,.doc,.docx,.csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="space-y-2">
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              TXT, MD, PDF, DOC, DOCX, CSV files supported
            </p>
          </div>
        </label>
      </div>

      {isUploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading files...
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
          <ul className="space-y-1">
            {uploadedFiles.map((filename, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {filename}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 