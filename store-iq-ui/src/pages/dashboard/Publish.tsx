"use client"

/* global gapi */
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import useYouTubeConnect from "@/hooks/useYouTubeConnect"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Google OAuth config
// (YouTube OAuth config now handled by useYouTubeConnect)
const IG_OAUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/instagram` // Placeholder, replace with actual

const Publish = () => {
  const navigate = useNavigate()
  // YouTube connection via shared hook
  const { ytConnected, loading: ytLoading, handleYouTubeOAuth, fetchConnectionStatus } = useYouTubeConnect()
  const [igConnected, setIgConnected] = useState(false)

  // Show toast when ytConnected transitions from false to true
  const ytConnectedRef = React.useRef(ytConnected)
  React.useEffect(() => {
    if (!ytConnectedRef.current && ytConnected) {
      if (sessionStorage.getItem("ytConnectInitiated")) {
        toast.success("Successfully connected to YouTube!")
        sessionStorage.removeItem("ytConnectInitiated")
      }
    }
    ytConnectedRef.current = ytConnected
  }, [ytConnected])

  // Unified YouTube connect/disconnect handler
  const handleYouTubeButton = async () => {
    if (!ytConnected) {
      sessionStorage.setItem("ytConnectInitiated", "1")
      await handleYouTubeOAuth()
    } else {
      // Disconnect flow
      try {
        const res = await fetch("/api/auth/disconnect-youtube", {
          method: "POST",
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to disconnect YouTube")
        fetchConnectionStatus()
        toast.success("YouTube disconnected.")
      } catch (err) {
        toast.error((err as Error)?.message || "YouTube action failed.")
      }
    }
  }

  // Videos state
  interface Video {
    id?: string
    url: string
    title?: string
    thumbnail?: string
    duration?: number
    s3Key?: string
    publishCount?: number
    publishedToYouTube?: boolean
  }

  const [videos, setVideos] = useState<Video[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [imagesLoading, setImagesLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [imagesError, setImagesError] = useState<string | null>(null)
  const [postingId, setPostingId] = useState<string | null>(null)

  // Platform connection
  // Real OAuth connect: redirect to backend OAuth endpoint
  // (YouTube OAuth logic now handled by useYouTubeConnect)

  const handleConnect = (platform: "youtube" | "instagram") => {
    if (platform === "youtube") {
      handleYouTubeOAuth()
    } else if (platform === "instagram") {
      window.location.href = IG_OAUTH_URL
    }
  }

  // Fetch user videos on mount
  // On mount: check connection status for YouTube/Instagram
  // Check OAuth connection status from backend
  // Only Instagram connection status is handled locally now
  const fetchInstagramConnectionStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/status`, { credentials: "include" })
      if (res.ok) {
        const status = await res.json()
        setIgConnected(!!status.instagram)
      }
    } catch {
      setIgConnected(false)
    }
  }

  // Fetch videos from backend
  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/videos", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch videos")
      const data = await res.json()
      setVideos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError((err as Error)?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchVideos()
    fetchConnectionStatus()
    fetchInstagramConnectionStatus()
    // Fetch images
    const fetchImages = async () => {
      setImagesLoading(true)
      setImagesError(null)
      try {
        const res = await fetch("/api/images", { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch images")
        const data = await res.json()
        setImages(Array.isArray(data) ? data : [])
      } catch (err) {
        setImagesError((err as Error)?.message || "Unknown error")
      } finally {
        setImagesLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Platform selection per video
  type PlatformSelections = { [videoId: string]: { yt: boolean; ig: boolean } }
  const [platformSelections, setPlatformSelections] = useState<PlatformSelections>({})

  const handlePlatformChange = (videoId: string, platform: "youtube" | "instagram") => {
    setPlatformSelections((prev) => ({
      ...prev,
      [videoId]: {
        yt: platform === "youtube" ? !prev[videoId]?.yt : !!prev[videoId]?.yt,
        ig: platform === "instagram" ? !prev[videoId]?.ig : !!prev[videoId]?.ig,
      },
    }))
  }

  // Handle posting per video
  const handlePost = async (video: Video) => {
    const selection = platformSelections[video.id || video.s3Key || ""] || {
      yt: false,
      ig: false,
    }
    if ((!selection.yt && !selection.ig) || (!ytConnected && !igConnected)) {
      toast.error("Please connect platforms and select at least one.")
      return
    }
    setPostingId(video.id || video.s3Key || "")

    try {
      // Prepare payload
      const payload = {
        s3Key: video.s3Key,
        // Add more metadata here if needed
      }

      // Track results for each platform
      let ytSuccess = false
      let igSuccess = false
      let errorMsg = ""

      // Post to YouTube if selected
      if (selection.yt && ytConnected) {
        const res = await fetch("/api/publish/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          errorMsg += `YouTube: ${err?.message || "Failed to post"} `
        } else {
          ytSuccess = true
        }
      }

      // Post to Instagram if selected
      if (selection.ig && igConnected) {
        const res = await fetch("/api/publish/instagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          errorMsg += `Instagram: ${err?.message || "Failed to post"} `
        } else {
          igSuccess = true
        }
      }

      setPostingId(null)

      if (ytSuccess) {
        if (igSuccess) {
          toast.success("Congratulations, your video was published to YouTube and Instagram!")
        } else {
          toast.success("Congratulations, your video was published to YouTube!")
        }
        setPlatformSelections((prev) => ({
          ...prev,
          [video.id || video.s3Key || ""]: { yt: false, ig: false },
        }))
        await fetchVideos()
      } else if (igSuccess) {
        toast.success("Video posted to Instagram!")
        setPlatformSelections((prev) => ({
          ...prev,
          [video.id || video.s3Key || ""]: { yt: false, ig: false },
        }))
        await fetchVideos()
      } else {
        toast.error(errorMsg.trim() || "Failed to post video.")
      }
    } catch (err) {
      setPostingId(null)
      toast.error((err as Error)?.message || "Failed to post video.")
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-storiq-dark">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="mb-10 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white text-left">
                Content Publishing
              </h1>
            </div>
            <p className="text-slate-300 text-base max-w-2xl text-left leading-relaxed">
              Connect your social accounts, customize your content, and publish to multiple platforms with ease
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 mb-12 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Platform Connections</h2>
            </div>
            <p className="text-slate-400 text-base mb-8 leading-relaxed">
              Connect your social media accounts to start publishing your content across multiple platforms
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50 rounded-2xl p-6 transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">YouTube</h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${ytConnected ? "bg-green-400" : "bg-slate-500"} animate-pulse`}
                        />
                        <p className={`text-sm font-medium ${ytConnected ? 'text-green-400' : 'text-white/80'}`}>
                          {ytConnected ? "Connected & Ready" : "Not Connected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {ytConnected ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Successfully Connected</span>
                        </div>
                        <p className="text-green-300/80 text-sm">Your YouTube account is ready for publishing</p>
                      </div>
                      <Button
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/50 transition-all duration-300"
                        onClick={handleYouTubeButton}
                        disabled={ytLoading}
                      >
                        {ytLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
                            Disconnecting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Disconnect YouTube
                          </span>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      onClick={handleYouTubeButton}
                      disabled={ytLoading}
                    >
                      {ytLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          Connect YouTube
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50 rounded-2xl p-6 transition-all duration-300 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Instagram</h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${igConnected ? "bg-green-400" : "bg-slate-500"} animate-pulse`}
                        />
                        <p className={`text-sm font-medium ${igConnected ? 'text-green-400' : 'text-white/80'}`}>
                          {igConnected ? "Connected & Ready" : "Not Connected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {igConnected ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Successfully Connected</span>
                      </div>
                      <p className="text-green-300/80 text-sm">Your Instagram account is ready for publishing</p>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => handleConnect("instagram")}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        Connect Instagram
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Split videos and images by file extension */}
          {(() => {
            function isVideoFile(url) {
              return /\.(mp4|mov|webm|avi|mkv)$/i.test(url)
            }
            const videoItems = videos.filter((v) => isVideoFile(v.url))
            return (
              <>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 mb-12 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Your Videos</h2>
                        <p className="text-slate-400 text-base mt-1">
                          Select and customize videos to publish across platforms
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-600/50">
                      <span className="text-sm text-slate-400">Total:</span>
                      <span className="text-lg font-bold text-white">{videoItems.length}</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin animation-delay-150"></div>
                      </div>
                      <p className="text-slate-400 mt-4 font-medium">Loading your videos...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  ) : videoItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-600/50 rounded-2xl bg-slate-800/20">
                      <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No videos yet</h3>
                      <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Create your first video to start publishing across social platforms
                      </p>
                      <Button
                        className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate("/dashboard/create-video")}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Create Your First Video
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Your Images</h2>
                        <p className="text-slate-400 text-base mt-1">Generated images ready to share on Instagram</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-600/50">
                      <span className="text-sm text-slate-400">Total:</span>
                      <span className="text-lg font-bold text-white">{images.length}</span>
                    </div>
                  </div>

                  {imagesLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-teal-500 rounded-full animate-spin animation-delay-150"></div>
                      </div>
                      <p className="text-slate-400 mt-4 font-medium">Loading your images...</p>
                    </div>
                  ) : imagesError ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{imagesError}</span>
                    </div>
                  ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-600/50 rounded-2xl bg-slate-800/20">
                      <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No images yet</h3>
                      <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Generate your first image to start sharing on Instagram
                      </p>
                      <Button
                        className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate("/dashboard/create-image")}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Generate Your First Image
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {images.map((img, idx) => (
                        <ImagePublishCard
                          key={img.id || img.s3Key || img.url || `image-${idx}`}
                          image={img}
                          igConnected={igConnected}
                          handlePost={handlePost}
                          postingId={postingId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </DashboardLayout>
  )
}

const VideoPublishCard = ({
  video,
  ytConnected,
  igConnected,
  platformSelections,
  handlePlatformChange,
  handlePost,
  postingId,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(false)
  const videoId = video.id || video.s3Key || ""
  const selection = platformSelections[videoId] || { yt: false, ig: false }

  return (
    <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl overflow-hidden border border-slate-600/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 backdrop-blur-sm">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          <video
            src={video.url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            tabIndex={-1}
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 shadow-lg"
                onClick={() => setOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a2 2 0 012-2h8a2 2 0 012 2v2M9 18h6"
                  />
                </svg>
                Preview
              </Button>
            </DialogTrigger>
          </div>
          {video.duration && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-xs text-white px-3 py-1.5 rounded-full font-medium">
              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
            </div>
          )}
          {video.publishedToYouTube && (
            <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Published
            </div>
          )}
        </div>

        <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-700">
          <DialogTitle className="text-white text-xl font-bold">Video Preview</DialogTitle>
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            <video src={video.url} className="w-full h-full" controls autoPlay />
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-purple-200 transition-colors">
              {video.title || "Untitled Video"}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">
                Published {video.publishCount ?? 0} time{(video.publishCount ?? 0) === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-4 p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-200"
          >
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Platform selection */}
        <div className="flex gap-3 mb-6">
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

        {/* Expanded options */}
        {expanded && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Title</label>
                <input
                  type="text"
                  defaultValue={video.title || ""}
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Description</label>
                <textarea
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                  rows={3}
                  placeholder="Add a description for your video..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium text-sm">Schedule Publishing</p>
                <p className="text-slate-400 text-xs">Publish immediately or schedule for later</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 bg-transparent"
              >
                Schedule
              </Button>
            </div>
          </div>
        )}

        {/* Publish button */}
        <Button
          className={`w-full font-medium transition-all duration-300 ${
            !selection.yt && !selection.ig
              ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 border border-slate-600/50"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
          }`}
          onClick={() => handlePost(video)}
          disabled={postingId === videoId || (!selection.yt && !selection.ig)}
        >
          {postingId === videoId ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {!selection.yt && !selection.ig
                ? "Select platforms to publish"
                : `Publish to ${getPlatformCount(selection)} platform${getPlatformCount(selection) !== 1 ? "s" : ""}`}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

const ImagePublishCard = ({ image, igConnected, handlePost, postingId }) => {
  const imageId = image.id || image.s3Key || ""

  return (
    <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl overflow-hidden border border-slate-600/50 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 backdrop-blur-sm">
      <div className="relative aspect-square bg-slate-900 overflow-hidden">
        <img
          src={image.s3Url || image.url}
          alt={image.title || "Generated Image"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-white font-bold text-lg mb-4 truncate group-hover:text-emerald-200 transition-colors">
          {image.title || image.s3Key || "Untitled Image"}
        </h3>

        <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Instagram</p>
            <p className="text-slate-400 text-xs">{igConnected ? "Ready to post" : "Connect to post"}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${igConnected ? "bg-green-400" : "bg-slate-500"} animate-pulse`} />
        </div>

        <Button
          className={`w-full font-medium transition-all duration-300 ${
            !igConnected
              ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 border border-slate-600/50"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
          }`}
          onClick={() => handlePost(image)}
          disabled={postingId === imageId || !igConnected}
        >
          {postingId === imageId ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {igConnected ? "Post to Instagram" : "Connect Instagram to Post"}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

const PlatformButton = ({ platform, connected, selected, onClick }) => {
  const platformConfig = {
    youtube: {
      name: "YouTube",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
      selectedClass: "bg-red-500 hover:bg-red-600 text-white shadow-lg",
      unselectedClass:
        "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white border border-slate-600/50",
      disabledClass: "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50",
    },
    instagram: {
      name: "Instagram",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      selectedClass:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg",
      unselectedClass:
        "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white border border-slate-600/50",
      disabledClass: "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50",
    },
  }

  const config = platformConfig[platform]

  return (
    <button
      onClick={onClick}
      disabled={!connected}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${!connected ? config.disabledClass : selected ? config.selectedClass : config.unselectedClass}
      `}
      title={
        connected
          ? `${selected ? "Remove from" : "Publish to"} ${config.name}`
          : `Connect ${config.name} to enable publishing`
      }
    >
      {config.icon}
      <span>{config.name}</span>
      {selected && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

// Helper function to count selected platforms
const getPlatformCount = (selection) => {
  return (selection.yt ? 1 : 0) + (selection.ig ? 1 : 0)
}

export default Publish
