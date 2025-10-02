"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Mic,
  Play,
  Upload,
  Download,
  Volume2,
  VideoIcon,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  FileAudio,
  Film,
  Plus,
  Loader2,
} from "lucide-react";

interface Video {
  id: string;
  url: string;
  title?: string;
}

export default function TextToSpeech() {
  const [text, setText] = useState("");
  interface Voice {
    voice_id?: string;
    voiceId?: string;
    name: string;
  }
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [mountedVideo, setMountedVideo] = useState<Video | null>(null);
  const [loadingMount, setLoadingMount] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [inputHidden, setInputHidden] = useState(false);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ;

  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    const headers = options.headers || {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...options, headers, credentials: "include" });
  };

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/video-tts/voices`);
        const data = await res.json();
        setVoices(data.voices || []);
        if (data.voices?.length) {
          setSelectedVoice(data.voices[0].voice_id || data.voices[0].voiceId);
        }
      } catch (error) {
        console.log("API not available, using mock data");
        // Fallback to mock data
        const mockVoices = [
          { voice_id: "voice1", name: "Sarah - Professional" },
          { voice_id: "voice2", name: "David - Conversational" },
          { voice_id: "voice3", name: "Emma - Energetic" },
          { voice_id: "voice4", name: "James - Authoritative" },
        ];
        setVoices(mockVoices);
        setSelectedVoice(mockVoices[0].voice_id);
      } finally {
        setLoadingVoices(false);
      }
    };

    loadVoices();
  }, []);

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/videos`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const videoArray: Video[] = await res.json();
      setVideos(videoArray);
    } catch (err) {
      console.log("API not available, using mock data");
      // Fallback to mock data
      const mockVideos = [
        {
          id: "video1",
          url: "/abstract-geometric-animation.png",
          title: "Product Demo",
        },
        {
          id: "video2",
          url: "/abstract-geometric-motion.png",
          title: "Tutorial Video",
        },
        { id: "video3", url: "/sample-video-3.png", title: "Marketing Clip" },
      ];
      setVideos(mockVideos);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const generateAudio = async () => {
    if (!text.trim()) return alert("Please enter text!");
    setLoadingAudio(true);
    setAudioUrl(null);
    setCurrentStep(2);

    try {
      const audioRes = await fetchWithAuth(`${API_BASE_URL}/video-tts/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!audioRes.ok) throw new Error("TTS request failed");
      const audioBlob = await audioRes.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
      setCurrentStep(3);
      setInputHidden(true);
    } catch (err) {
      console.log("API not available, using mock audio");
      setTimeout(() => {
        setAudioUrl("/audio-waveform.png"); // Mock audio URL
        setCurrentStep(3);
        setInputHidden(true);
      }, 2000);
    } finally {
      setLoadingAudio(false);
    }
  };

  const mountVideoWithAudio = async () => {
    if (!selectedVideo) return alert("Select a video first");
    if (!audioUrl) return alert("Generate audio first");

    setLoadingMount(true);
    setCurrentStep(4);

    try {
      const audioBlob = await fetch(audioUrl).then((res) => res.blob());

      const formData = new FormData();
      formData.append("file", audioBlob, "tts-audio.mp3");

      const uploadRes = await fetchWithAuth(
        `${API_BASE_URL}/api/upload-audio`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error("Audio upload failed");
      const { url: publicAudioUrl } = await uploadRes.json();

      const requestBody = {
        videoUrl: selectedVideo.url,
        audioUrl: publicAudioUrl,
      };

      const res = await fetchWithAuth(`${API_BASE_URL}/api/video/mount-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to mount video with audio");

      const data = await res.json();
      setMountedVideo({
        id: data.s3Key,
        url: data.url,
        title: "Mounted Video",
      });
      setCurrentStep(5);

      fetchVideos();
    } catch (err) {
      console.log("API not available, using mock video mounting");
      setTimeout(() => {
        setMountedVideo({
          id: "mounted-video",
          url: "/final-mounted-video.jpg",
          title: "Final Video with Audio",
        });
        setCurrentStep(5);
      }, 3000);
    } finally {
      setLoadingMount(false);
    }
  };

  const resetWorkflow = () => {
    setText("");
    setAudioUrl(null);
    setSelectedVideo(null);
    setMountedVideo(null);
    setCurrentStep(1);
    setInputHidden(false); // Restore input section
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "pending";
  };

  const selectedVoiceName =
    voices.find((v) => (v.voice_id || v.voiceId) === selectedVoice)?.name ||
    "Select Voice";

  return (
    <DashboardLayout>
      <div
        className="min-h-screen bg-storiq-dark"
      >
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-storiq-purple/20 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-storiq-purple to-storiq-blue bg-clip-text text-transparent">
                AI Voice Studio
              </h1>
            </div>
            <p className="text-white/60 max-w-2xl mx-auto text-base leading-relaxed">
              Transform your text into professional voiceovers and seamlessly
              mount them to your videos with AI-powered voice synthesis
            </p>
          </div>

          <div className="mb-8 sm:mb-12">
            <div className="flex justify-between items-center relative px-4 sm:px-0">
              <div className="absolute top-5 left-4 sm:left-0 right-4 sm:right-0 h-0.5 bg-storiq-border"></div>
              <div
                className="absolute top-5 left-4 sm:left-0 h-0.5 bg-gradient-to-r from-storiq-purple to-storiq-blue transition-all duration-700 ease-out"
                style={{
                  width: `calc(${((currentStep - 1) / 4) * 100}% - ${
                    currentStep === 5 ? "0px" : "16px"
                  })`,
                }}
              ></div>

              {[
                { num: 1, label: "Write Text", icon: Mic },
                { num: 2, label: "Generate Audio", icon: Volume2 },
                { num: 3, label: "Select Video", icon: VideoIcon },
                { num: 4, label: "Mount Audio", icon: Upload },
                { num: 5, label: "Complete", icon: Check },
              ].map(({ num, label, icon: Icon }) => (
                <div
                  key={num}
                  className="relative flex flex-col items-center z-10"
                >
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg
                    ${
                      getStepStatus(num) === "completed"
                        ? "bg-gradient-to-r from-storiq-purple to-storiq-blue border-storiq-purple text-white shadow-storiq-purple/25"
                        : getStepStatus(num) === "current"
                        ? "bg-gradient-to-r from-storiq-purple to-storiq-blue border-storiq-purple text-white shadow-storiq-purple/25 scale-110"
                        : "bg-storiq-card-bg/60 border-storiq-border text-white/40"
                    }
                    `}
                  >
                    {getStepStatus(num) === "completed" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`
                    mt-3 text-xs sm:text-sm font-medium transition-colors duration-300 text-center max-w-20
                    ${
                      getStepStatus(num) === "completed" ||
                      getStepStatus(num) === "current"
                        ? "text-white"
                        : "text-gray-500"
                    }
                  `}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Left Column - Text Input & Voice Selection */}
            <div className="space-y-6">
              {/* Text Input Card */}
              <div
                className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-600/20">
                    <Mic className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Script Input
                  </h3>
                  <div className="ml-auto text-sm text-gray-400">
                    <span
                      className={text.length > 4500 ? "text-orange-400" : ""}
                    >
                      {text.length}
                    </span>
                    <span className="text-gray-500">/5000</span>
                  </div>
                </div>

                <div className="relative">
                  {/* Use normalized Textarea component */}
                  <Textarea
                    className="bg-black/40 border border-gray-700 text-white placeholder:text-white/40 min-h-[120px] text-base rounded-xl focus:ring-2 focus:ring-storiq-purple/50 focus:border-storiq-purple transition resize-none px-4 py-3"
                    placeholder="Enter your script here... This text will be converted to speech using AI voice synthesis."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={5000}
                  />
                  {text && (
                    <div className="absolute top-3 right-3">
                      <div className="p-1 rounded bg-purple-600/20">
                        <FileAudio className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  )}
                </div>

                {text.length > 4500 && (
                  <div className="mt-2 text-sm text-orange-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Approaching character limit
                  </div>
                )}
              </div>

              {/* Voice Selection Card */}
              <div
                className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Voice Selection
                  </h3>
                  {loadingVoices && (
                    <div className="ml-auto">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    </div>
                  )}
                </div>

                {loadingVoices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
                    <span className="text-gray-400">Loading voices...</span>
                  </div>
                ) : voices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Volume2 className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      No Voices Available
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Unable to load voice options. Please try refreshing the
                      page.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                      className="w-full bg-black/40 border border-gray-700 text-white rounded-xl p-4 flex items-center justify-between hover:border-storiq-purple transition-all duration-200"
                    >
                      <span className="truncate">{selectedVoiceName}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform flex-shrink-0 ml-2 ${
                          showVoiceDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showVoiceDropdown && (
                      <div
                        className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-none"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {voices.map((voice) => (
                          <button
                            key={voice.voice_id || voice.voiceId}
                            onClick={() => {
                              setSelectedVoice(voice.voice_id || voice.voiceId);
                              setShowVoiceDropdown(false);
                            }}
                            className={`w-full text-left p-3 hover:bg-gray-700 text-white transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              (voice.voice_id || voice.voiceId) ===
                              selectedVoice
                                ? "bg-purple-600/30 text-purple-200"
                                : ""
                            }`}
                            style={{ scrollbarWidth: "none" }}
                          >
                            {voice.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generate Audio Button */}
              <div className="flex justify-center">
                <Button
                  onClick={generateAudio}
                  disabled={
                    loadingAudio ||
                    !text.trim() ||
                    !selectedVoice ||
                    loadingVoices
                  }
                  className="w-full max-w-xs h-14 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold text-lg rounded-xl transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {loadingAudio ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-3" />
                      Generate AI Voice
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Column - Audio Preview & Controls */}
            <div className="space-y-6">
              {/* Audio Preview Card */}
              {audioUrl && (
                <div
                  className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-600/20">
                      <FileAudio className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Generated Audio
                    </h3>
                    <div className="ml-auto">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Check className="w-4 h-4" />
                        Ready
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-4 border bg-black/40 border-gray-700"
                  >
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = audioUrl;
                        a.download = "generated-audio.mp3";
                        a.click();
                      }}
                      className="flex-1 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold rounded-xl transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Reset Workflow */}
              {currentStep > 1 && (
                <Button
                  onClick={resetWorkflow}
                  variant="outline"
                  className="w-full border-storiq-border text-white/80 hover:bg-storiq-card-bg hover:text-white transition"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              )}

              {currentStep === 1 && (
                <div className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-storiq-purple" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-storiq-purple mt-2 flex-shrink-0"></div>
                      Write clear, natural sentences for best results
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-storiq-blue mt-2 flex-shrink-0"></div>
                      Try different voices to find the perfect match
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                      Keep scripts under 5000 characters for optimal quality
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {audioUrl && (
            <div className="mt-8">
              <div
                className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-orange-600/20">
                    <Film className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Select Video to Mount
                  </h3>
                  <div className="ml-auto text-sm text-gray-400">
                    {videos.length} video{videos.length !== 1 ? "s" : ""}{" "}
                    available
                  </div>
                </div>

                {loadingVideos ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-400 mr-3" />
                    <span className="text-gray-400">Loading videos...</span>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                      <Film className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">
                      No Videos Available
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Upload some videos first to mount your generated audio.
                      You can add videos through the dashboard.
                    </p>
                    <Button
                      onClick={() => setLoadingVideos(true)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Videos
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className={`group relative rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer transform hover:scale-105 ${
                            selectedVideo?.id === video.id
                              ? "border-purple-500 ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/25"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                          onClick={() => setSelectedVideo(video)}
                        >
                          <AspectRatio ratio={16 / 9}>
                            <AdvancedVideoPlayer
                              src={video.url}
                              className="w-full h-full"
                            />
                          </AspectRatio>
                          {selectedVideo?.id === video.id && (
                            <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                              <div className="bg-purple-600 rounded-full p-3 shadow-lg">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-sm font-medium truncate">
                              {video.title || `Video ${video.id.slice(-6)}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mount Button */}
                    <Button
                      onClick={mountVideoWithAudio}
                      disabled={!selectedVideo || !audioUrl || loadingMount}
                      className="w-full h-14 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold text-lg rounded-xl transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                      {loadingMount ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Mounting Video...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-3" />
                          Mount Audio to Video
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {mountedVideo && (
            <div className="mt-8">
              <div className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-storiq-purple/20 shadow-lg">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Video Successfully Created! 🎉
                    </h3>
                    <p className="text-white/60">
                      Your AI-generated audio has been mounted to the video
                    </p>
                  </div>
                </div>

                <AspectRatio
                  ratio={16 / 9}
                  className="rounded-lg overflow-hidden shadow-2xl mb-6"
                >
                  <AdvancedVideoPlayer
                    src={mountedVideo.url}
                    className="w-full h-full"
                  />
                </AspectRatio>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => window.open(mountedVideo.url, "_blank")}
                    className="flex-1 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold rounded-xl transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Final Video
                  </Button>
                  <Button
                    onClick={resetWorkflow}
                    variant="outline"
                    className="border-storiq-border text-white/80 hover:bg-storiq-card-bg hover:text-white transition"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
