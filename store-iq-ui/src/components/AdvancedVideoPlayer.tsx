// AdvancedVideoPlayer.tsx
import React, { useRef, useState, useEffect } from "react";

interface AdvancedVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  onDelete?: () => void;
  actionButtons?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({
  src,
  onDelete,
  actionButtons,
  className = "",
  style,
  ...videoProps
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement &&
        document.fullscreenElement === video.parentElement
      );
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setCurrentTime(video.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    setCurrentTime(time);
    video.currentTime = time;
  };

  const handleSeekMouseDown = () => setIsSeeking(true);
  const handleSeekMouseUp = () => setIsSeeking(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = Number(e.target.value);
    setVolume(vol);
    video.volume = vol;
  };

  const handleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        handlePlayPause();
        break;
      case "ArrowRight":
        video.currentTime = Math.min(video.currentTime + 5, duration);
        break;
      case "ArrowLeft":
        video.currentTime = Math.max(video.currentTime - 5, 0);
        break;
      case "ArrowUp":
        video.volume = Math.min(video.volume + 0.1, 1);
        setVolume(video.volume);
        break;
      case "ArrowDown":
        video.volume = Math.max(video.volume - 0.1, 0);
        setVolume(video.volume);
        break;
      case "f":
        handleFullscreen();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`w-full bg-storiq-card-bg border border-storiq-border rounded-lg shadow-lg overflow-hidden flex flex-col ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Advanced video player"
      style={style}
    >
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          tabIndex={-1}
          onClick={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          {...videoProps}
          aria-label="Video content"
        />
        {/* Optional Action Buttons */}
        {(onDelete || actionButtons) && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            {actionButtons}
            {onDelete && (
              <button
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Delete video"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2 px-4 py-3 bg-storiq-card-bg border-t border-storiq-border">
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          className="text-white hover:text-storiq-purple focus:outline-none focus:ring-2 focus:ring-storiq-purple rounded p-1"
          aria-label={playing ? "Pause video" : "Play video"}
          type="button"
        >
          {playing ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polygon points="6,4 20,12 6,20" fill="currentColor" />
            </svg>
          )}
        </button>
        {/* Seek Bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xs text-white/60 w-12 text-right select-none" aria-label="Current time">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={isSeeking ? undefined : currentTime}
            onChange={handleSeek}
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            className="w-full accent-storiq-purple h-1"
            aria-label="Seek video"
          />
          <span className="text-xs text-white/60 w-12 text-left select-none" aria-label="Duration">
            {formatTime(duration)}
          </span>
        </div>
        {/* Volume */}
        <div className="flex items-center gap-1 ml-2">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-storiq-purple"
            aria-label="Volume"
          />
        </div>
        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="ml-2 text-white hover:text-storiq-purple focus:outline-none focus:ring-2 focus:ring-storiq-purple rounded p-1"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          type="button"
        >
          {isFullscreen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L5 5m0 0v4m0-4h4M15 15l4 4m0 0v-4m0 4h-4" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6m0-6L10 14M9 21H3v-6m0 6l11-11" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdvancedVideoPlayer;