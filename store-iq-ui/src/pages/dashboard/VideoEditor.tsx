// VideoEditor.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Slider } from "@/components/ui/slider";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/ui/Loader";
import { 
  Play, 
  Pause, 
  Scissors, 
  Download, 
  RotateCcw, 
  RotateCw,
  Maximize,
  Settings
} from "lucide-react";

interface Video {
  id?: string;
  url: string;
  title?: string;
  duration?: number;
}

const MOCK_VIDEOS: Video[] = [
  {
    id: "1",
    url: "/videos/sample1.mp4",
    title: "Sample Video 1",
    duration: 120,
  },
  {
    id: "2",
    url: "/videos/sample2.mp4",
    title: "Sample Video 2",
    duration: 95,
  },
];

function fetchVideoById(id: string | undefined): Promise<Video | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const found = MOCK_VIDEOS.find((v) => v.id === id);
      resolve(found || null);
    }, 300);
  });
}

const VideoEditor: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();
  console.log('user', user);
  const userId = user && user.id ? user.id : null;
  const wildcard = params['*'];
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDisabled, setExportDisabled] = useState(false);

  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Aspect ratio state
  const [aspectRatio, setAspectRatio] = useState("16:9");

  // Map aspect ratio string to numeric value
  const aspectRatioMap: Record<string, number> = {
    "1:1": 1,
    "4:3": 4 / 3,
    "16:9": 16 / 9,
    "3:2": 3 / 2,
  };
  const numericAspectRatio = aspectRatioMap[aspectRatio] || 16 / 9;

  // Cropping state
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (location.state && location.state.url) {
      setVideo({
        url: location.state.url,
        title: decodeURIComponent(wildcard?.split('/').pop() || "Untitled"),
        duration: undefined,
      });
      setStart(0);
      setEnd(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    if (wildcard && !wildcard.includes('/')) {
      fetchVideoById(wildcard)
        .then((v) => {
          if (v) {
            setVideo(v);
            setStart(0);
            setEnd(v.duration ?? 0);
            setDuration(v.duration ?? 0);
          } else {
            setError("Video not found");
          }
        })
        .catch(() => setError("Failed to fetch video"))
        .finally(() => setLoading(false));
    } else if (wildcard) {
      let videoUrl = wildcard;
      if (!/^https?:\/\//i.test(videoUrl)) {
        videoUrl = videoUrl.startsWith("/") ? videoUrl : "/" + videoUrl;
      }
      setVideo({
        url: videoUrl,
        title: decodeURIComponent(wildcard.split('/').pop() || "Untitled"),
        duration: undefined,
      });
      setStart(0);
      setEnd(0);
      setDuration(0);
      setLoading(false);
    } else {
      setError("No video identifier provided");
      setLoading(false);
    }
  }, [wildcard, location.state]);

  // Set duration from video metadata and handle time updates
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleLoadedMetadata = () => {
      setDuration(vid.duration);
      setEnd((prevEnd) => (prevEnd === 0 || prevEnd > vid.duration ? vid.duration : prevEnd));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(vid.currentTime);
      if (previewing && vid.currentTime >= end) {
        vid.pause();
        setIsPlaying(false);
        setPreviewing(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    vid.addEventListener("loadedmetadata", handleLoadedMetadata);
    vid.addEventListener("timeupdate", handleTimeUpdate);
    vid.addEventListener("play", handlePlay);
    vid.addEventListener("pause", handlePause);

    return () => {
      vid.removeEventListener("loadedmetadata", handleLoadedMetadata);
      vid.removeEventListener("timeupdate", handleTimeUpdate);
      vid.removeEventListener("play", handlePlay);
      vid.removeEventListener("pause", handlePause);
    };
  }, [video, previewing, end]);

  // Video control functions
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.pause();
    } else {
      vid.play();
    }
  };

  const seekTo = (time: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    
    vid.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(vid.currentTime);
  };

  const setStartToCurrent = () => {
    setStart(currentTime);
    if (currentTime > end) setEnd(currentTime);
  };

  const setEndToCurrent = () => {
    setEnd(currentTime);
    if (currentTime < start) setStart(currentTime);
  };

  const resetCrop = () => {
    setStart(0);
    setEnd(duration);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-white text-lg">Loading video...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !video) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-red-500 text-lg font-medium">{error || "Video not found"}</div>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isExporting && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.8)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Loader message="Exporting video, please wait..." />
        </div>
      )}
      
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Video Editor
          </h1>
          <p className="text-white/60">{video.title || "Untitled"}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Preview Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Aspect Ratio Controls */}
            <div className="bg-storiq-card-bg rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-white font-medium flex items-center gap-2">
                  <Settings size={16} />
                  Aspect Ratio
                </label>
                <span className="text-white/60 text-sm bg-storiq-border px-2 py-1 rounded">
                  {aspectRatio}
                </span>
              </div>
              <RadioGroup
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                value={aspectRatio}
                onValueChange={setAspectRatio}
                aria-labelledby="aspect-ratio-label"
                role="radiogroup"
              >
                {[
                  { value: "1:1", label: "1:1", desc: "Square" },
                  { value: "4:3", label: "4:3", desc: "Standard" },
                  { value: "16:9", label: "16:9", desc: "Widescreen" },
                  { value: "3:2", label: "3:2", desc: "Classic" },
                ].map(({ value, label, desc }) => (
                  <div key={value} className="flex flex-col items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={value}
                        id={`aspect-${value.replace(':', '-')}`}
                        className="w-4 h-4"
                      />
                      <label 
                        htmlFor={`aspect-${value.replace(':', '-')}`} 
                        className="text-white cursor-pointer text-sm"
                      >
                        {label}
                      </label>
                    </div>
                    <span className="text-white/40 text-xs">{desc}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Video Player */}
            <div className="bg-storiq-card-bg rounded-lg p-4">
              <AspectRatio
                ratio={numericAspectRatio}
                className="bg-black rounded-lg overflow-hidden mb-4 relative group"
              >
                <video
                  ref={videoRef}
                  src={video.url}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                  style={{ 
                    outline: previewing ? "3px solid #a855f7" : undefined,
                    outlineOffset: previewing ? "-3px" : undefined
                  }}
                />
                {/* Custom Play Button Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={togglePlay}
                      className="bg-purple-600/80 hover:bg-purple-600 rounded-full p-4 transition-all transform hover:scale-110"
                    >
                      <Play size={32} className="text-white ml-1" />
                    </button>
                  </div>
                )}
              </AspectRatio>

              {/* Custom Video Controls */}
              <div className="flex items-center justify-between bg-storiq-border rounded-lg p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/10"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                
                <div className="flex-1 mx-4">
                  <div className="text-white text-xs text-center mb-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <Slider
                    min={0}
                    max={duration}
                    step={0.1}
                    value={[currentTime]}
                    onValueChange={([time]) => seekTo(time)}
                    className="cursor-pointer"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-white hover:bg-white/10"
                >
                  <Maximize size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Editing Controls Sidebar */}
          <div className="space-y-6">
            {/* Crop Controls */}
            <div className="bg-storiq-card-bg rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Scissors size={16} />
                  Crop Segment
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCrop}
                  className="text-white/60 hover:text-white text-xs"
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-4">
                {/* Timeline Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span className="text-white/60">Start: {formatTime(start)}</span>
                    <span className="text-white/60">End: {formatTime(end)}</span>
                  </div>
                  <Slider
                    min={0}
                    max={duration}
                    step={0.1}
                    value={[start, end]}
                    onValueChange={([newStart, newEnd]) => {
                      const s = Math.max(0, Math.min(newStart, newEnd, duration));
                      const e = Math.max(0, Math.max(newStart, newEnd, 0));
                      setStart(Math.min(s, e));
                      setEnd(Math.max(s, e));
                    }}
                    minStepsBetweenThumbs={1}
                    className="mb-2"
                  />
                </div>

                {/* Quick Set Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={setStartToCurrent}
                    className="flex-1 text-xs text-white"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Set Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={setEndToCurrent}
                    className="flex-1 text-xs text-white"
                  >
                    <RotateCw size={14} className="mr-1" />
                    Set End
                  </Button>
                </div>

                {/* Numeric Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/70 text-xs block mb-1">Start Time</label>
                    <input
                      type="number"
                      min={0}
                      max={end}
                      step={0.1}
                      value={start.toFixed(1)}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (isNaN(val)) val = 0;
                        val = Math.max(0, Math.min(val, end, duration));
                        setStart(val);
                        if (val > end) setEnd(val);
                      }}
                      className="w-full rounded px-3 py-2 bg-storiq-border text-white border border-storiq-border focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs block mb-1">End Time</label>
                    <input
                      type="number"
                      min={start}
                      max={duration}
                      step={0.1}
                      value={end.toFixed(1)}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (isNaN(val)) val = start;
                        val = Math.max(start, Math.min(val, duration));
                        setEnd(val);
                        if (val < start) setStart(val);
                      }}
                      className="w-full rounded px-3 py-2 bg-storiq-border text-white border border-storiq-border focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preview Button */}
                <Button
                  onClick={() => {
                    setPreviewing(true);
                    seekTo(start);
                    togglePlay();
                  }}
                  disabled={previewing || start >= end}
                  variant="outline"
                  className="w-full text-white"
                >
                  <Play size={16} className="mr-2" />
                  Preview Crop ({formatTime(end - start)})
                </Button>
              </div>
            </div>

            {/* Export Section */}
            <div className="bg-storiq-card-bg rounded-lg p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <Download size={24} className="mx-auto mb-2 text-purple-500" />
                  <h3 className="text-white font-medium">Export Video</h3>
                  <p className="text-white/60 text-sm">
                    Crop duration: {formatTime(end - start)}
                  </p>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={
                    start >= end ||
                    !userId ||
                    isExporting || 
                    exportDisabled
                  }
                  onClick={async () => {
                    if (isExporting) return;
                    setIsExporting(true);
                    try {
                      if (
                        !video?.url ||
                        typeof start !== "number" ||
                        typeof end !== "number" ||
                        start < 0 ||
                        end <= start ||
                        isNaN(start) ||
                        isNaN(end)
                      ) {
                        alert("Invalid crop parameters. Please check start/end times and video URL.");
                        setIsExporting(false);
                        return;
                      }
                      if (!userId) {
                        alert("User not authenticated. Please log in again.");
                        setIsExporting(false);
                        return;
                      }
                      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/video/crop`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          videoUrl: video.url,
                          start: Number(start),
                          end: Number(end),
                          userId: userId,
                          aspectRatio: aspectRatio,
                        }),
                        credentials: "include",
                      });
                      if (!response.ok) throw new Error("Failed to export video");
                      const data = await response.json();
                      const jobId = data.job_id || data.jobId;
                      const exportEntry = {
                        filename: video.title || "Untitled",
                        date: new Date().toISOString(),
                        crop: { start, end },
                        url: video.url,
                        job_id: jobId,
                        status: data.status,
                        export_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        userId: userId
                      };
                      const existing = JSON.parse(localStorage.getItem("exports") || "[]");
                      existing.push(exportEntry);
                      localStorage.setItem("exports", JSON.stringify(existing));
                      toast.success("Video added to export queue!", { 
                        duration: 4000,
                        icon: '✅'
                      });
                      setExportDisabled(true);
                    } catch (err) {
                      toast.error("Export failed. Please try again.", {
                        duration: 4000,
                        icon: '❌'
                      });
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : userId ? (
                    <>
                      <Download size={16} className="mr-2" />
                      Export Video
                    </>
                  ) : (
                    "Sign in to Export"
                  )}
                </Button>

                {/* Export Info */}
                <div className="text-xs text-white/40 space-y-1">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span>MP4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aspect Ratio:</span>
                    <span>{aspectRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <span>Original</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

function formatTime(sec: number) {
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default VideoEditor;