import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Mic, 
  Play, 
  Square, 
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
  Film
} from "lucide-react";

interface Video {
  id: string;
  url: string;
  title?: string;
}

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [mountedVideo, setMountedVideo] = useState<Video | null>(null);
  const [loadingMount, setLoadingMount] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);

  const token = localStorage.getItem("token");

  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    const headers = options.headers || {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...options, headers, credentials: "include" });
  };

  useEffect(() => {
    fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/video-tts/voices`)
      .then((res) => res.json())
      .then((data) => {
        setVoices(data.voices || []);
        if (data.voices?.length)
          setSelectedVoice(data.voices[0].voice_id || data.voices[0].voiceId);
      })
      .catch(console.error);
  }, []);

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/videos`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const videoArray: Video[] = await res.json();
      setVideos(videoArray);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch videos");
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
      const audioRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/video-tts/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!audioRes.ok) throw new Error("TTS request failed");
      const audioBlob = await audioRes.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      alert("Something went wrong with audio generation");
      setCurrentStep(1);
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
        `${import.meta.env.VITE_API_BASE_URL}/api/upload-audio`,
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

      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/api/video/mount-audio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to mount video with audio");

      const data = await res.json();
      setMountedVideo({ id: data.s3Key, url: data.url, title: "Mounted Video" });
      setCurrentStep(5);

      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to mount video with audio");
      setCurrentStep(3);
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
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "pending";
  };

  const selectedVoiceName = voices.find(v => 
    (v.voice_id || v.voiceId) === selectedVoice
  )?.name || "Select Voice";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Voice Studio
              </h1>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Transform your text into professional voiceovers and seamlessly mount them to your videos
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-700"></div>
              <div 
                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              ></div>
              
              {[
                { num: 1, label: "Write Text", icon: Mic },
                { num: 2, label: "Generate Audio", icon: Volume2 },
                { num: 3, label: "Select Video", icon: VideoIcon },
                { num: 4, label: "Mount Audio", icon: Upload },
                { num: 5, label: "Complete", icon: Check }
              ].map(({ num, label, icon: Icon }) => (
                <div key={num} className="relative flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10
                    ${getStepStatus(num) === 'completed' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-500 text-white' 
                      : getStepStatus(num) === 'current'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400'
                    }
                  `}>
                    {getStepStatus(num) === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`
                    mt-2 text-sm font-medium transition-colors duration-300
                    ${getStepStatus(num) === 'completed' || getStepStatus(num) === 'current'
                      ? 'text-white' 
                      : 'text-gray-500'
                    }
                  `}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Text Input & Voice Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Text Input Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-600/20">
                    <Mic className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Script Input</h3>
                  <div className="ml-auto text-sm text-gray-400">
                    {text.length}/5000 characters
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    className="w-full h-32 bg-gray-900/50 border border-gray-600 text-white rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-400"
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
              </div>

              {/* Voice Selection Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-600/20">
                    <Volume2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Voice Selection</h3>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                    className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg p-4 flex items-center justify-between hover:border-blue-500 transition-all duration-200"
                  >
                    <span>{selectedVoiceName}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showVoiceDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showVoiceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {voices.map((voice) => (
                        <button
                          key={voice.voice_id || voice.voiceId}
                          onClick={() => {
                            setSelectedVoice(voice.voice_id || voice.voiceId);
                            setShowVoiceDropdown(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-gray-700 text-white transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            (voice.voice_id || voice.voiceId) === selectedVoice ? 'bg-purple-600/30 text-purple-200' : ''
                          }`}
                        >
                          {voice.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Audio Button */}
              <Button
                onClick={generateAudio}
                disabled={loadingAudio || !text.trim()}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loadingAudio ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
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

            {/* Right Column - Audio Preview & Controls */}
            <div className="space-y-6">
              {/* Audio Preview Card */}
              {audioUrl && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-600/20">
                      <FileAudio className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Generated Audio</h3>
                    <div className="ml-auto">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Check className="w-4 h-4" />
                        Ready
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
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
                        const a = document.createElement('a');
                        a.href = audioUrl;
                        a.download = 'generated-audio.mp3';
                        a.click();
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
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
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              )}
            </div>
          </div>

          {/* Video Selection Section */}
          {audioUrl && videos.length > 0 && (
            <div className="mt-8">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-orange-600/20">
                    <Film className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Select Video to Mount</h3>
                  <div className="ml-auto text-sm text-gray-400">
                    {videos.length} videos available
                  </div>
                </div>
                
                {loadingVideos ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                    <span className="ml-3 text-gray-400">Loading videos...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                          <AdvancedVideoPlayer src={video.url} className="w-full h-full" />
                        </AspectRatio>
                        {selectedVideo?.id === video.id && (
                          <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                            <div className="bg-purple-600 rounded-full p-3">
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
                )}

                {/* Mount Button */}
                <Button
                  onClick={mountVideoWithAudio}
                  disabled={!selectedVideo || !audioUrl || loadingMount}
                  className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loadingMount ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                      Mounting Video...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-3" />
                      Mount Audio to Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Final Result */}
          {mountedVideo && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Video Successfully Created!</h3>
                    <p className="text-green-400">Your AI-generated audio has been mounted to the video</p>
                  </div>
                </div>
                
                <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden shadow-2xl">
                  <AdvancedVideoPlayer src={mountedVideo.url} className="w-full h-full" />
                </AspectRatio>

                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => window.open(mountedVideo.url, '_blank')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Final Video
                  </Button>
                  <Button
                    onClick={resetWorkflow}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
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