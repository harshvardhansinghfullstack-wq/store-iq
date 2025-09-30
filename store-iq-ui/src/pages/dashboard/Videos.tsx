import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  Download,
  MoreVertical,
  FileVideo,
  Eye,
  Film,
  Youtube,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Video {
  id?: string;
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  subtitle?: string;
  description?: string;
  createdAt?: string;
  s3Key?: string;
  publishCount?: number;
  publishedToYouTube?: boolean;
}

const Videos = () => {
  const navigate = useNavigate();
  // State
  const [videos, setVideos] = useState<Video[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedThumbs, setGeneratedThumbs] = useState<{
    [key: string]: string;
  }>({});
  const [modal, setModal] = useState<{
    open: boolean;
    src: string | null;
    title: string;
    videoId: string | null;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    src: null,
    title: "",
    videoId: null,
    loading: true,
    error: null,
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  // No longer needed: editedVideoUrls state removed

  // Fetch videos only (edited/original split is now backend-driven)
  useEffect(() => {
    const fetchVideosAndImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch videos
        const url = "/api/videos";
        const fetchOptions: RequestInit = { credentials: "include" };
        const res = await fetch(url, fetchOptions);
        if (res.status === 401) {
          throw new Error("Unauthorized (401): Please log in.");
        }
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
        // Fetch images
        const imgRes = await fetch("/api/images", fetchOptions);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          setImages(Array.isArray(imgData) ? imgData : []);
        } else {
          setImages([]);
        }
      } catch (err: unknown) {
        let message = "Unknown error";
        if (
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof (err as any).message === "string"
        ) {
          message = (err as any).message;
        } else if (typeof err === "string") {
          message = err;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideosAndImages();
  }, []);

  // Generate thumbnails
  useEffect(() => {
    const generateThumbnails = async () => {
      const updates: { [key: string]: string } = {};
      await Promise.all(
        videos.map(async (video: Video) => {
          if (
            !video.thumbnail &&
            video.url &&
            !generatedThumbs[video.id || video.url]
          ) {
            try {
              const thumb = await extractVideoFrame(video.url);
              if (thumb) {
                updates[video.id || video.url] = thumb;
              }
            } catch {}
          }
        })
      );
      if (Object.keys(updates).length > 0) {
        setGeneratedThumbs((prev) => ({ ...prev, ...updates }));
      }
    };
    if (videos.length > 0) generateThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos]);

  // Extract frame for thumbnail
  const extractVideoFrame = (url: string): Promise<string | null> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 1;
      video.addEventListener("loadeddata", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
      video.addEventListener("error", () => resolve(null));
    });

  // Modal handlers
  const openModal = (video: Video) => {
    setModal({
      open: true,
      src: video.url || "",
      title: video.title || "Untitled Video",
      videoId: video.id || null,
      loading: true,
      error: null,
    });
  };
  const closeModal = () => {
    setModal({
      open: false,
      src: null,
      title: "",
      videoId: null,
      loading: true,
      error: null,
    });
  };

  // Delete handler
  const handleDelete = async () => {
    console.log("[handleDelete] deleteVideoId:", deleteVideoId);
    if (!deleteVideoId) {
      console.log("[handleDelete] Early return: deleteVideoId is missing");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Find the video object to get the s3Key
      const videoToDelete = videos.find((v) => v.id === deleteVideoId);
      if (!videoToDelete || !videoToDelete.s3Key) {
        console.log(
          "[handleDelete] Early return: videoToDelete or s3Key missing",
          videoToDelete
        );
        throw new Error("Video s3Key not found");
      }
      console.log(
        "[handleDelete] Deleting video object:",
        videoToDelete,
        "s3Key:",
        videoToDelete.s3Key
      );
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-video`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ s3Key: videoToDelete.s3Key }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete video");
      setVideos((prev) => prev.filter((v) => v.id !== deleteVideoId));
      setDeleteVideoId(null);
      setDeleteConfirmOpen(false);
      closeModal();
    } catch (err: unknown) {
      let message = "Unknown error";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as any).message === "string"
      ) {
        message = (err as any).message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard accessibility for modal (ESC to close)
  useEffect(() => {
    if (!modal.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal.open]);

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to open delete dialog safely
  function handleOpenDeleteDialog(videoId: string | null) {
    console.log("[handleOpenDeleteDialog] called with videoId:", videoId);
    if (videoId) {
      setDeleteVideoId(videoId);
      setDeleteConfirmOpen(true);
    }
  }

  // Helper: check if file is a video (not image)
  function isVideoFile(url: string) {
    return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
  }
  function isImageFile(url: string) {
    return /\.(png|jpg|jpeg|webp)$/i.test(url);
  }

  // Filter out images from videos
  const onlyVideos = videos.filter((video: any) => isVideoFile(video.url));
  const onlyImages = images;
  const originalVideos = onlyVideos.filter((video: any) => !video.isEdited);
  const editedVideos = onlyVideos.filter((video: any) => video.isEdited);

  // Image modal state
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    src: string | null;
    title: string;
    imageId: string | null;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    src: null,
    title: "",
    imageId: null,
    loading: true,
    error: null,
  });
  const [deleteImageConfirmOpen, setDeleteImageConfirmOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  // Modal handlers for images
  const openImageModal = (img: any) => {
    setImageModal({
      open: true,
      src: img.s3Url || img.url || "",
      title: img.title || img.s3Key || "Untitled Image",
      imageId: img.id || img.s3Key || null,
      loading: false,
      error: null,
    });
  };
  const closeImageModal = () => {
    setImageModal({
      open: false,
      src: null,
      title: "",
      imageId: null,
      loading: false,
      error: null,
    });
  };

  // Delete handler for images
  const handleDeleteImage = async () => {
    if (!deleteImageId) return;
    try {
      setLoading(true);
      setError(null);
      // Find the image object to get the s3Key
      const imageToDelete = onlyImages.find(
        (v) => (v.id || v.s3Key) === deleteImageId
      );
      if (!imageToDelete || !imageToDelete.s3Key) {
        throw new Error("Image s3Key not found");
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-video`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ s3Key: imageToDelete.s3Key }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      setVideos((prev) =>
        prev.filter((v) => (v.id || v.s3Key) !== deleteImageId)
      );
      setDeleteImageId(null);
      setDeleteImageConfirmOpen(false);
      closeImageModal();
    } catch (err: unknown) {
      let message = "Unknown error";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as any).message === "string"
      ) {
        message = (err as any).message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to open delete dialog safely for images
  function handleOpenDeleteImageDialog(imageId: string | null) {
    if (imageId) {
      setDeleteImageId(imageId);
      setDeleteImageConfirmOpen(true);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Collection
              </h1>
              <p className="text-white/60 text-lg">
                Manage and preview all your videos and images in one collection
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/create-video")}
              className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Film className="h-5 w-5 mr-2" />
              Create New Video
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total Videos (videos + images) */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Videos in Collection</p>
                  <p className="text-2xl font-bold text-white">
                    {onlyVideos.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Film className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>
            {/* Total Images */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Images in Collection</p>
                  <p className="text-2xl font-bold text-white">
                    {onlyImages.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <img src="/image.png" alt="Image" className="h-6 w-6" />
                </div>
              </div>
            </div>
            {/* Original Videos */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Original Videos in Collection</p>
                  <p className="text-2xl font-bold text-white">
                    {originalVideos.length}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Play className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>
            {/* Edited Videos */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Edited Videos in Collection</p>
                  <p className="text-2xl font-bold text-white">
                    {editedVideos.length}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Edit3 className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog
          open={modal.open}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-700">
              <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-400" />
                {modal.title}
              </DialogTitle>
            </DialogHeader>

            {/* Video Player Container */}
            <div className="relative px-6 py-4">
              <AspectRatio
                ratio={16 / 9}
                className="bg-black rounded-xl overflow-hidden border border-gray-700"
              >
                {/* Overlay: Loading spinner */}
                {modal.loading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 transition-opacity animate-fade-in">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-white text-lg font-medium">
                      Loading video...
                    </span>
                  </div>
                )}

                {/* Overlay: Error */}
                {modal.error && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 transition-opacity animate-fade-in p-6">
                    <div className="bg-red-500/20 rounded-full p-4 mb-4">
                      <FileVideo className="h-8 w-8 text-red-400" />
                    </div>
                    <span className="text-red-400 text-lg font-semibold mb-2">
                      Failed to load video
                    </span>
                    <span className="text-white/70 text-center text-sm mb-6">
                      {modal.error}
                    </span>
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Close Preview
                    </Button>
                  </div>
                )}

                {/* Video Player */}
                {modal.src && (
                  <AdvancedVideoPlayer
                    src={modal.src}
                    className="w-full h-full"
                    aria-label="Video preview"
                    onLoadedData={() => {
                      setModal((prev) => ({
                        ...prev,
                        loading: false,
                        error: null,
                      }));
                    }}
                    onError={() => {
                      setModal((prev) => ({
                        ...prev,
                        loading: false,
                        error:
                          "This video could not be loaded. Please try again later.",
                      }));
                    }}
                  />
                )}
              </AspectRatio>
            </div>

            {/* Action Buttons */}
            <DialogFooter className="flex justify-between items-center px-6 pb-6 pt-4 bg-gray-800/50">
              <div className="text-white/60 text-sm">
                Video ID: {modal.videoId || "N/A"}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleOpenDeleteDialog(modal.videoId)}
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Video
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        {deleteVideoId && (
          <ConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={(open) => {
              setDeleteConfirmOpen(open);
              if (!open) setDeleteVideoId(null);
            }}
            title="Delete Video"
            description="Are you sure you want to delete this video? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDelete}
            variant="destructive"
          />
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden border-gray-700 bg-gray-800/50 backdrop-blur-sm rounded-xl"
              >
                <Skeleton className="h-48 w-full rounded-none bg-gradient-to-br from-gray-700 to-gray-600" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-3 bg-gray-600" />
                  <Skeleton className="h-4 w-full mb-2 bg-gray-600" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-gray-600" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-20 bg-gray-600" />
                    <Skeleton className="h-8 w-20 bg-gray-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-800/30 rounded-2xl border border-gray-700 backdrop-blur-sm">
            <div className="rounded-full bg-red-500/20 p-5 mb-5">
              <FileVideo className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Unable to load videos
            </h3>
            <p className="text-white/50 mb-8 max-w-md text-lg">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-800/30 rounded-2xl border border-gray-700 backdrop-blur-sm">
            <div className="rounded-full bg-gray-700/50 p-6 mb-6 border border-gray-600">
              <Film className="h-16 w-16 text-white/30" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              No videos yet
            </h3>
            <p className="text-white/40 mb-8 text-lg max-w-sm">
              Start creating amazing videos to see them appear here
            </p>
            <Button
              onClick={() => navigate("/dashboard/create-video")}
              className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
            >
              Create Your First Video
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Original Videos Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Play className="h-5 w-5 text-green-400" />
                    </div>
                    Original Videos in Collection
                    <Badge
                      variant="secondary"
                      className="ml-3 bg-green-500/20 text-green-400"
                    >
                      {originalVideos.length}
                    </Badge>
                  </h2>
                  <p className="text-white/40 mt-1">
                    Videos you've uploaded directly
                  </p>
                </div>
              </div>

              {originalVideos.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
                  <FileVideo className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-lg">
                    No original videos found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {originalVideos.map((video: Video, index) => (
                    <VideoCard
                      key={video.id || index}
                      video={video}
                      generatedThumbs={generatedThumbs}
                      onPreview={() => openModal(video)}
                      onEdit={() => {
                        if (video.s3Key) {
                          navigate(`/dashboard/video-editor/${video.s3Key}`, {
                            state: { url: video.url },
                          });
                        } else if (video.id) {
                          navigate(`/dashboard/video-editor/${video.id}`, {
                            state: { url: video.url },
                          });
                        }
                      }}
                      onDelete={() => handleOpenDeleteDialog(video.id)}
                      formatDuration={formatDuration}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Edited Videos Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Edit3 className="h-5 w-5 text-purple-400" />
                    </div>
                    Edited Videos in Collection
                    <Badge
                      variant="secondary"
                      className="ml-3 bg-purple-500/20 text-purple-400"
                    >
                      {editedVideos.length}
                    </Badge>
                  </h2>
                  <p className="text-white/40 mt-1">
                    Videos you've modified and enhanced
                  </p>
                </div>
              </div>

              {editedVideos.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
                  <Edit3 className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-lg">
                    No edited videos found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {editedVideos.map((video: Video, index) => (
                    <VideoCard
                      key={video.id || index}
                      video={video}
                      generatedThumbs={generatedThumbs}
                      onPreview={() => openModal(video)}
                      onEdit={() => {
                        if (video.s3Key) {
                          navigate(`/dashboard/video-editor/${video.s3Key}`, {
                            state: { url: video.url },
                          });
                        } else if (video.id) {
                          navigate(`/dashboard/video-editor/${video.id}`, {
                            state: { url: video.url },
                          });
                        }
                      }}
                      onDelete={() => handleOpenDeleteDialog(video.id)}
                      formatDuration={formatDuration}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Images Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <img src="/image.png" alt="Image" className="h-5 w-5" />
                    </div>
                    Images in Collection
                    <Badge
                      variant="secondary"
                      className="ml-3 bg-blue-500/20 text-blue-400"
                    >
                      {onlyImages.length}
                    </Badge>
                  </h2>
                  <p className="text-white/40 mt-1">AI-generated images (part of your collection)</p>
                </div>
              </div>
              {onlyImages.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
                  <img
                    src="/image.png"
                    className="h-12 w-12 mx-auto mb-4 opacity-40"
                    alt="No images"
                  />
                  <p className="text-white/40 text-lg">No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {onlyImages.map((img, idx) => (
                    <Card
                      key={img.id || img.s3Key || idx}
                      className="group overflow-hidden border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl rounded-xl"
                    >
                      <div className="relative h-48 overflow-hidden flex items-center justify-center bg-black">
                        <img
                          src={img.s3Url || img.url}
                          alt={img.title || img.s3Key || "Image"}
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                          onClick={() => openImageModal(img)}
                          style={{ cursor: "pointer" }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            onClick={() => openImageModal(img)}
                            className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
                            size="icon"
                          >
                            <Eye className="h-6 w-6 fill-current ml-1" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-white font-semibold line-clamp-2 flex-1 mr-2 text-lg leading-tight">
                            {img.title || img.s3Key || "Untitled Image"}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-gray-800 border-gray-700"
                            >
                              <DropdownMenuItem
                                onClick={() => openImageModal(img)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-500/20"
                                onClick={() =>
                                  handleOpenDeleteImageDialog(
                                    img.id || img.s3Key
                                  )
                                }
                                disabled={
                                  img.id === undefined &&
                                  img.s3Key === undefined
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-white/60 text-sm mb-2 line-clamp-2 leading-relaxed">
                          {img.prompt ||
                            img.description ||
                            "No description available"}
                        </p>
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {img.createdAt
                              ? formatDate(img.createdAt)
                              : "Unknown date"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      {/* Image Preview Modal */}
      <Dialog
        open={imageModal.open}
        onOpenChange={(open) => {
          if (!open) closeImageModal();
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-700">
            <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              {imageModal.title}
            </DialogTitle>
          </DialogHeader>
          <div className="relative px-6 py-4 flex items-center justify-center bg-black">
            {imageModal.src && (
              <img
                src={imageModal.src}
                alt={imageModal.title}
                className="object-contain max-h-[60vh] w-full"
                // fallback for modal: if src is not s3Url, try to find the image by id in onlyImages
                onError={(e) => {
                  const imgObj = onlyImages.find(
                    (img) =>
                      img.id === imageModal.imageId ||
                      img.s3Key === imageModal.imageId
                  );
                  if (imgObj && imgObj.s3Url) {
                    (e.target as HTMLImageElement).src = imgObj.s3Url;
                  }
                }}
              />
            )}
          </div>
          <DialogFooter className="flex justify-between items-center px-6 pb-6 pt-4 bg-gray-800/50">
            <div className="text-white/60 text-sm">
              Image ID: {imageModal.imageId || "N/A"}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeImageModal}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleOpenDeleteImageDialog(imageModal.imageId)}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete Image
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog for Images */}
      {deleteImageId && (
        <ConfirmDialog
          open={deleteImageConfirmOpen}
          onOpenChange={(open) => {
            setDeleteImageConfirmOpen(open);
            if (!open) setDeleteImageId(null);
          }}
          title="Delete Image"
          description="Are you sure you want to delete this image? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteImage}
          variant="destructive"
        />
      )}
    </DashboardLayout>
  );
};

// Video Card Component for better organization
interface VideoCardProps {
  video: Video;
  generatedThumbs: { [key: string]: string };
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDuration: (seconds: number) => string;
  formatDate: (dateString: string) => string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  generatedThumbs,
  onPreview,
  onEdit,
  onDelete,
  formatDuration,
  formatDate,
}) => {
  return (
    <Card className="group overflow-hidden border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl rounded-xl">
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            video.thumbnail
              ? video.thumbnail
              : generatedThumbs[video.id || video.url]
              ? generatedThumbs[video.id || video.url]
              : "/placeholder.svg"
          }
          alt={video.title || "Untitled Video"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={onPreview}
            className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="icon"
          >
            <Play className="h-6 w-6 fill-current ml-1" />
          </Button>
        </div>
        {video.duration && (
          <Badge className="absolute bottom-3 right-3 bg-black/80 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        )}
        {video.publishedToYouTube && (
          <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 border-0">
            <Youtube className="h-3 w-3 mr-1" />
            YouTube
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-semibold line-clamp-2 flex-1 mr-2 text-lg leading-tight">
            {video.title || "Untitled Video"}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700"
            >
              <DropdownMenuItem
                onClick={onPreview}
                className="text-white hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEdit}
                className="text-white hover:bg-gray-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-500/20"
                onClick={onDelete}
                disabled={video.id === undefined || video.id === null}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Publish info */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-blue-400 font-medium">
            Published {video.publishCount ?? 0} time
            {(video.publishCount ?? 0) === 1 ? "" : "s"}
          </span>
          {video.publishedToYouTube && (
            <Badge
              variant="outline"
              className="text-green-400 border-green-400/30 text-xs"
            >
              Published
            </Badge>
          )}
        </div>

        <p className="text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed">
          {video.subtitle || video.description || "No description available"}
        </p>

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {video.createdAt ? formatDate(video.createdAt) : "Unknown date"}
          </div>
          <div className="flex items-center gap-1">
            <Film className="h-3 w-3" />
            {video.isEdited ? "Edited" : "Original"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          size="sm"
          onClick={onPreview}
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Play className="h-4 w-4" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 gap-2 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500 rounded-lg transition-colors"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Videos;
