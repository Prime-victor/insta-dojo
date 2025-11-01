import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Film, Loader } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { useFeedStore } from '../../stores/feedStore';
import { createPost } from '../../utils/api';
import { createContentHash } from '../../utils/web3';
import { uploadMultipleToIPFS } from '../../utils/ipfs';

export default function PostComposer() {
  const { isPostComposerOpen, closePostComposer, addNotification } = useUiStore();
  const { addPost } = useFeedStore();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isPostComposerOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 4) {
      addNotification('error', 'Maximum 4 files allowed');
      return;
    }

    setFiles([...files, ...selectedFiles]);

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      addNotification('error', 'Please add content or media');
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUploads: any[] = [];

      if (files.length > 0) {
        addNotification('info', 'Uploading to IPFS...');
        const uploads = await uploadMultipleToIPFS(files);
        mediaUploads = uploads.map((upload, idx) => ({
          type: files[idx].type.startsWith('video') ? 'video' : 'image',
          ipfsHash: upload.hash,
          url: upload.url
        }));
      }

      const contentHash = createContentHash(content, mediaUploads);
      const postType = files.length > 0
        ? (files[0].type.startsWith('video') ? 'video' : 'image')
        : 'text';

      const result = await createPost(content, contentHash, mediaUploads, postType);

      if (result.success && result.data) {
        addPost(result.data);
        addNotification('success', 'Post created successfully');
        setContent('');
        setFiles([]);
        setPreviews([]);
        closePostComposer();
      } else {
        addNotification('error', result.error || 'Failed to create post');
      }
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button
            onClick={closePostComposer}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full min-h-[120px] text-lg resize-none focus:outline-none"
            disabled={isSubmitting}
          />

          {previews.length > 0 && (
            <div className={`mt-4 grid gap-2 ${previews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {previews.map((preview, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-100">
                  {files[idx].type.startsWith('video') ? (
                    <video src={preview} className="w-full h-48 object-cover" />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isSubmitting}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || files.length >= 4}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || files.length >= 4}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition disabled:opacity-50"
            >
              <Film className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <span className="text-sm text-gray-500">
              {content.length}/2000
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && files.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
