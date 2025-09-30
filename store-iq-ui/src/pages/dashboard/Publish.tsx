/* global gapi */
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import Loader from "@/components/ui/Loader";
import useYouTubeConnect from "@/hooks/useYouTubeConnect";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast";

// Google OAuth config
// (YouTube OAuth config now handled by useYouTubeConnect)
const IG_OAUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/instagram`; // Placeholder, replace with actual

const Publish = () => {
  // YouTube connection via shared hook
  const { ytConnected, loading: ytLoading, handleYouTubeOAuth, fetchConnectionStatus } = useYouTubeConnect();
  const [igConnected, setIgConnected] = useState(false);

  // Unified YouTube connect/disconnect handler
  const handleYouTubeButton = async () => {
    if (!ytConnected) {
      await handleYouTubeOAuth();
    } else {
      // Disconnect flow
      try {
        const res = await fetch("/api/auth/disconnect-youtube", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to disconnect YouTube");
        fetchConnectionStatus();
        setToast({ type: "success", message: "YouTube disconnected." });
      } catch (err) {
        setToast({
          type: "error",
          message: (err as Error)?.message || "YouTube action failed.",
        });
      }
    }
  };

  // Videos state
  interface Video {
    id?: string;
    url: string;
    title?: string;
    thumbnail?: string;
    duration?: number;
    s3Key?: string;
    publishCount?: number;
    publishedToYouTube?: boolean;
  }

  const [videos, setVideos] = useState<Video[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imagesLoading, setImagesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Platform connection
  // Real OAuth connect: redirect to backend OAuth endpoint
  // (YouTube OAuth logic now handled by useYouTubeConnect)

  const handleConnect = (platform: "youtube" | "instagram") => {
    if (platform === "youtube") {
      handleYouTubeOAuth();
    } else if (platform === "instagram") {
      window.location.href = IG_OAUTH_URL;
    }
  };

  // Fetch user videos on mount
  // On mount: check connection status for YouTube/Instagram
  // Check OAuth connection status from backend
  // Only Instagram connection status is handled locally now
  const fetchInstagramConnectionStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/status`, { credentials: "include" });
      if (res.ok) {
        const status = await res.json();
        setIgConnected(!!status.instagram);
      }
    } catch {
      setIgConnected(false);
    }
  };

  // Fetch videos from backend
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/videos", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error)?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVideos();
    fetchConnectionStatus();
    fetchInstagramConnectionStatus();
    // Fetch images
    const fetchImages = async () => {
      setImagesLoading(true);
      setImagesError(null);
      try {
        const res = await fetch("/api/images", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch images");
        const data = await res.json();
        setImages(Array.isArray(data) ? data : []);
      } catch (err) {
        setImagesError((err as Error)?.message || "Unknown error");
      } finally {
        setImagesLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Platform selection per video
  type PlatformSelections = { [videoId: string]: { yt: boolean; ig: boolean } };
  const [platformSelections, setPlatformSelections] =
    useState<PlatformSelections>({});

  const handlePlatformChange = (
    videoId: string,
    platform: "youtube" | "instagram"
  ) => {
    setPlatformSelections((prev) => ({
      ...prev,
      [videoId]: {
        yt: platform === "youtube" ? !prev[videoId]?.yt : !!prev[videoId]?.yt,
        ig: platform === "instagram" ? !prev[videoId]?.ig : !!prev[videoId]?.ig,
      },
    }));
  };

  // Handle posting per video
  const handlePost = async (video: Video) => {
    const selection = platformSelections[video.id || video.s3Key || ""] || {
      yt: false,
      ig: false,
    };
    if ((!selection.yt && !selection.ig) || (!ytConnected && !igConnected)) {
      setToast({
        type: "error",
        message: "Please connect platforms and select at least one.",
      });
      return;
    }
    setPostingId(video.id || video.s3Key || "");
    setToast(null);

    try {
      // Prepare payload
      const payload = {
        s3Key: video.s3Key,
        // Add more metadata here if needed
      };

      // Track results for each platform
      let success = false;
      let errorMsg = "";
      
      // Post to YouTube if selected
      if (selection.yt && ytConnected) {
        const res = await fetch("/api/publish/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errorMsg += `YouTube: ${err?.message || "Failed to post"} `;
        } else {
          success = true;
        }
      }

      // Post to Instagram if selected
      if (selection.ig && igConnected) {
        const res = await fetch("/api/publish/instagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errorMsg += `Instagram: ${err?.message || "Failed to post"} `;
        } else {
          success = true;
        }
      }

      setPostingId(null);

      if (success) {
        setToast({ type: "success", message: "Video posted successfully!" });
        setPlatformSelections((prev) => ({
          ...prev,
          [video.id || video.s3Key || ""]: { yt: false, ig: false },
        }));
        // Refresh video list after successful publish
        await fetchVideos();
      } else {
        setToast({
          type: "error",
          message: errorMsg.trim() || "Failed to post video.",
        });
      }
    } catch (err) {
      setPostingId(null);
      setToast({
        type: "error",
        message: (err as Error)?.message || "Failed to post video.",
      });
    }
  };

  return (
    <ToastProvider>
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Content Publishing
            </h1>
            <p className="text-white/70 text-sm md:text-base">
              Connect your accounts, select videos, and publish to multiple
              platforms
            </p>
          </div>

          {/* Social Connect Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Platform Connections
            </h2>
            <p className="text-white/60 text-sm mb-6">
              Connect your social accounts to enable publishing
            </p>

            <div className="flex flex-col md:flex-row gap-6">
              {/* YouTube Card */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">YouTube</h3>
                    <p className="text-xs text-white/60">
                      {ytConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {ytConnected ? (
                  <Button
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-700/50 mt-auto"
                    onClick={handleYouTubeButton}
                    disabled={ytLoading}
                  >
                    {ytLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Disconnecting...
                      </span>
                    ) : (
                      "Disconnect YouTube"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white mt-auto"
                    onClick={handleYouTubeButton}
                    disabled={ytLoading}
                  >
                    {ytLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      "Connect YouTube"
                    )}
                  </Button>
                )}
              </div>

              {/* Instagram Card */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Instagram</h3>
                    <p className="text-xs text-white/60">
                      {igConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {igConnected ? (
                  <div className="px-3 py-2 bg-green-900/20 text-green-400 text-sm rounded text-center border border-green-800/50 mt-auto">
                    Connected
                  </div>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white mt-auto"
                    onClick={() => handleConnect("instagram")}
                  >
                    Connect Instagram
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Split videos and images by file extension */}
          {(() => {
            function isVideoFile(url) {
              return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
            }
            const videoItems = videos.filter((v) => isVideoFile(v.url));
            return (
              <>
                {/* Videos Section */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Your Videos
                      </h2>
                      <p className="text-white/60 text-sm mt-1">
                        Select videos to publish to connected platforms
                      </p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-900/20 border border-red-800/50 text-red-200 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  ) : videoItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                      <svg
                        className="w-12 h-12 text-gray-600 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <p className="text-white/60 mb-4">No videos available</p>
                      <Button onClick={() => window.location.href = "/dashboard/create-video"}>
                        Create Your First Video
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {videoItems.map((video) => (
                        <VideoPublishCard
                          key={video.id || video.s3Key}
                          video={video}
                          ytConnected={ytConnected}
                          igConnected={igConnected}
                          platformSelections={platformSelections}
                          handlePlatformChange={handlePlatformChange}
                          handlePost={handlePost}
                          postingId={postingId}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Images Section */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Your Images
                      </h2>
                      <p className="text-white/60 text-sm mt-1">
                        Generated images you can post to Instagram
                      </p>
                    </div>
                  </div>
                  {imagesLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : imagesError ? (
                    <div className="bg-red-900/20 border border-red-800/50 text-red-200 px-4 py-3 rounded-lg">
                      {imagesError}
                    </div>
                  ) : images.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                      <svg
                        className="w-12 h-12 text-gray-600 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4-4-4-4m8 8l4-4-4-4"
                        ></path>
                      </svg>
                      <p className="text-white/60 mb-4">No images available</p>
                      <Button onClick={() => window.location.href = "/dashboard/create-video"}>
                        Generate Your First Image
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {images.map((img, idx) => (
                        <div
                          key={img.id || img.s3Key || img.url || `image-${idx}`}
                          className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 flex flex-col"
                        >
                          <div className="relative aspect-square bg-black flex items-center justify-center">
                            <img
                              src={img.s3Url || img.url}
                              alt={img.title || "Generated Image"}
                              className="object-contain w-full h-full"
                              style={{ maxHeight: 280 }}
                            />
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-white font-medium mb-2 truncate">
                              {img.title || img.s3Key || "Untitled Image"}
                            </h3>
                            <div className="flex-1"></div>
                            <Button
                              className="w-full mt-2"
                              onClick={() => handlePost(img)}
                              disabled={postingId === (img.id || img.s3Key)}
                              variant={igConnected ? "default" : "outline"}
                            >
                              {postingId === (img.id || img.s3Key)
                                ? "Posting..."
                                : igConnected
                                ? "Post to Instagram"
                                : "Connect Instagram to Post"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* ... toast and loader ... */}
        </div>
      </DashboardLayout>
    </ToastProvider>
  );
};

// New Video Publish Card Component
const VideoPublishCard = ({
  video,
  ytConnected,
  igConnected,
  platformSelections,
  handlePlatformChange,
  handlePost,
  postingId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const videoId = video.id || video.s3Key || "";
  const selection = platformSelections[videoId] || { yt: false, ig: false };

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
      {/* Video thumbnail and basic info */}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="relative aspect-video bg-gray-900">
          <video
            src={video.url}
            className="w-full h-full object-cover"
            tabIndex={-1}
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setOpen(true)}
              >
                Preview
              </Button>
            </DialogTrigger>
          </div>
          {video.duration && (
            <div className="absolute top-3 right-3 bg-black/70 text-xs text-white px-2 py-1 rounded">
              {Math.floor(video.duration / 60)}:
              {String(video.duration % 60).padStart(2, "0")}
            </div>
          )}
        </div>
        <DialogContent className="max-w-2xl w-full">
          <DialogTitle>Video Preview</DialogTitle>
          <div className="aspect-video w-full bg-black flex items-center justify-center">
            <video
              src={video.url}
              className="w-full h-full"
              controls
              autoPlay
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4">
        <h3 className="text-white font-medium mb-2 truncate">
          {video.title || "Untitled Video"}
        </h3>
        {/* Publish info */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/60">
            Published {video.publishCount ?? 0} time{(video.publishCount ?? 0) === 1 ? "" : "s"}
          </span>
          {video.publishedToYouTube && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-700 text-green-100 text-xs font-semibold ml-2">
              Published
            </span>
          )}
        </div>

        {/* Platform selection - always visible */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <PlatformButton
              platform="youtube"
              connected={ytConnected}
              selected={selection.yt}
              onClick={() => handlePlatformChange(videoId, "youtube")}
            />
            <PlatformButton
              platform="instagram"
              connected={igConnected}
              selected={selection.ig}
              onClick={() => handlePlatformChange(videoId, "instagram")}
            />
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Expanded options */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <label className="text-xs text-white/60 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  defaultValue={video.title || ""}
                  className="w-full bg-transparent text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-2 py-1"
                  placeholder="Enter title"
                />
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <label className="text-xs text-white/60 block mb-1">
                  Description
                </label>
                <button className="w-full text-left text-white/70 text-sm hover:text-white">
                  Add description...
                </button>
              </div>
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg mb-4">
              <label className="text-xs text-white/60 block mb-2">
                Schedule
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-white text-sm">
                  Publish immediately
                </div>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Publish button */}
        <Button
          className="w-full"
          onClick={() => handlePost(video)}
          disabled={postingId === videoId || (!selection.yt && !selection.ig)}
          variant={!selection.yt && !selection.ig ? "outline" : "default"}
        >
          {postingId === videoId ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Publishing...
            </span>
          ) : (
            `Publish to ${getPlatformCount(selection)} platform${
              getPlatformCount(selection) !== 1 ? "s" : ""
            }`
          )}
        </Button>
      </div>
    </div>
  );
};

// Platform Button Component
const PlatformButton = ({ platform, connected, selected, onClick }) => {
  const platformConfig = {
    youtube: {
      name: "YouTube",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
      color: "red",
    },
    instagram: {
      name: "Instagram",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      color: "purple",
    },
  };

  const config = platformConfig[platform];

  return (
    <button
      onClick={onClick}
      disabled={!connected}
      className={`
        flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${
          selected
            ? `bg-${config.color}-500 text-white`
            : connected
            ? `bg-gray-700 text-white/80 hover:bg-gray-600 hover:text-white`
            : `bg-gray-800 text-white/40 cursor-not-allowed`
        }
      `}
      title={
        connected
          ? `Publish to ${config.name}`
          : `Connect ${config.name} to enable publishing`
      }
    >
      {config.icon}
      <span className="sr-only">{config.name}</span>
    </button>
  );
};

// Helper function to count selected platforms
const getPlatformCount = (selection) => {
  return (selection.yt ? 1 : 0) + (selection.ig ? 1 : 0);
};

export default Publish;
