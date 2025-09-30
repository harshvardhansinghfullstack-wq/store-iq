// ImageEditor.tsx
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { authFetch } from "@/lib/authFetch";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Download,
  RefreshCw,
  Image as ImageIcon,
  Wand2,
  UploadCloud,
} from "lucide-react";

import imageEditorPrompt from "@/assets/images/image-editor-prompt.png";

const ImageEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [editedImageLoaded, setEditedImageLoaded] = useState(false);

  const editedImageRef = useRef<HTMLImageElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setEditedImageUrl(null);
    setError(null);
    if (file) {
      setOriginalPreview(URL.createObjectURL(file));
    } else {
      setOriginalPreview(null);
    }
  };

  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMaskFile(file);
    if (file) {
      setMaskPreview(URL.createObjectURL(file));
    } else {
      setMaskPreview(null);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEditedImageUrl(null);
    setEditedImageLoaded(false);

    if (!imageFile) {
      setError("Please upload an image.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (maskFile) formData.append("mask", maskFile);
      formData.append("prompt", prompt);

      const res = await authFetch("/api/ai/edit-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to edit image.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Accept editedImageUrl, imageUrl, or url from backend
      const url = data?.editedImageUrl || data?.imageUrl || data?.url;
      if (url) {
        setEditedImageUrl(url);
      } else {
        setError("No edited image returned from server.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (editedImageUrl) {
      const link = document.createElement("a");
      link.href = editedImageUrl;
      link.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-2 sm:p-4 md:p-6 max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            <span className="inline-block align-middle mr-3">
              <Wand2 className="w-8 h-8 text-storiq-purple animate-pulse" />
            </span>
            <span className="align-middle">AI Image Editor</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg text-center">
            Edit your images with AI-powered magic. Upload an image, optionally
            a mask, describe your edit, and see the result!
          </p>
        </div>

        {/* Main image area: loader > error > edited image > prompt placeholder */}
        {loading ? (
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 flex flex-col items-center mx-auto backdrop-blur-sm mb-8">
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in w-full">
              <div className="w-full max-w-md mx-auto flex justify-center">
                <Loader
                  message="Editing your image..."
                  size="small"
                  overlay={false}
                />
              </div>
              <p className="text-gray-400 text-sm animate-pulse">
                This may take a few moments...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 flex flex-col items-center mx-auto backdrop-blur-sm mb-8">
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in w-full">
              <div className="p-3 bg-red-500/10 rounded-full animate-bounce">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <div className="text-red-400 text-center font-medium">
                {error}
              </div>
              <Button
                onClick={handleSubmit}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all duration-200"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : editedImageUrl ? (
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 flex flex-col items-center mx-auto backdrop-blur-sm mb-8">
            <div className="space-y-6 animate-fade-in w-full">
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                <div className="flex flex-col items-center">
                  <img
                    src={originalPreview || ""}
                    alt="Original"
                    className="rounded-lg max-h-64 border border-gray-700 mb-2"
                  />
                  <span className="text-xs text-gray-400">Original</span>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    ref={editedImageRef}
                    src={editedImageUrl}
                    alt="Edited"
                    className={`rounded-lg max-h-64 border border-storiq-purple/70 mb-2 transition-all duration-700 ${
                      editedImageLoaded
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105"
                    }`}
                    onLoad={() => setEditedImageLoaded(true)}
                  />
                  <span className="text-xs text-storiq-purple">Edited</span>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="mt-2 bg-black/80 hover:bg-black text-white backdrop-blur-sm border border-gray-600 transition-transform duration-200 hover:scale-110"
                    title="Download edited image"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800 transition-all duration-200 hover:border-gray-700 mt-4">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  Prompt used:
                </p>
                <p className="text-sm text-gray-300 font-medium leading-relaxed">
                  {prompt}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 flex flex-col items-center mx-auto backdrop-blur-sm mb-8">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <img
                src={imageEditorPrompt}
                alt="Prompt placeholder"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-xl shadow-lg border border-gray-700 bg-black/30"
                draggable={false}
              />
              <div className="w-full flex flex-col items-center mt-2">
                <h4 className="text-white/60 text-sm font-semibold mb-1">
                  Prompt
                </h4>
                <pre className="text-white/70 text-sm font-medium whitespace-pre-line text-center">
                  Ultra-realistic split-panel image. Left side: A man standing
                  on a quiet park pathway. Right side: The same man, now with
                  another person standing next to him. In between, add a bold
                  arrow pointing from left to right. Rich natural details, soft
                  shadows, and lifelike textures.
                </pre>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">
                ✨ Upload an image, optionally a mask, and enter your prompt to
                get started
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 mb-8 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label
                className="text-white font-medium flex items-center gap-2"
                htmlFor="image-upload"
              >
                <ImageIcon className="w-4 h-4 text-storiq-purple" />
                Image (required)
              </label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="bg-storiq-card-bg border-storiq-border text-white file:bg-storiq-purple/80 file:text-white file:border-0 file:rounded-lg"
                required
              />
              {originalPreview && (
                <div className="mt-2">
                  <img
                    src={originalPreview}
                    alt="Original preview"
                    className="rounded-lg max-h-48 border border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Original Image Preview
                  </p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <label
                className="text-white font-medium flex items-center gap-2"
                htmlFor="mask-upload"
              >
                <UploadCloud className="w-4 h-4 text-storiq-purple" />
                Mask (optional)
              </label>
              <Input
                id="mask-upload"
                type="file"
                accept="image/*"
                onChange={handleMaskChange}
                disabled={loading}
                className="bg-storiq-card-bg border-storiq-border text-white file:bg-storiq-purple/80 file:text-white file:border-0 file:rounded-lg"
              />
              {maskPreview && (
                <div className="mt-2">
                  <img
                    src={maskPreview}
                    alt="Mask preview"
                    className="rounded-lg max-h-48 border border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">Mask Preview</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <label
              className="text-white font-medium flex items-center gap-2"
              htmlFor="prompt"
            >
              <Wand2 className="w-4 h-4 text-storiq-purple" />
              Describe your edit
            </label>
            <Textarea
              id="prompt"
              placeholder="e.g. Make the sky sunset orange, add birds..."
              value={prompt}
              onChange={handlePromptChange}
              disabled={loading}
              required
              className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[96px] py-3 text-base resize-y transition-all duration-200 focus:ring-2 focus:ring-storiq-purple/50 focus:border-storiq-purple"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !imageFile || !prompt.trim()}
            className="w-full bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold h-12 text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-storiq-purple/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Editing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Edit Image
              </span>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ImageEditor;
