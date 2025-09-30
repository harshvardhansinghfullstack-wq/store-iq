// ImageGenerator.tsx
import React, { useState, useEffect, useRef } from "react";
import henryPrompt from "@/assets/images/henry-prompt.webp";
import bearPrompt from "@/assets/images/bear-prompt.webp";
import spritePrompt from "@/assets/images/sprite-prompt.webp";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { authFetch } from "@/lib/authFetch";
import {
  Download,
  RefreshCw,
  Sparkles,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default images
  const defaultImages = [
    {
      src: henryPrompt,
      description:
        "Close-up hyper-realistic portrait of Henry Cavill in a blue suit, frozen battleground, falling snow, cinematic lighting.",
    },
    {
      src: bearPrompt,
      description:
        "A majestic bear standing in a dense forest, sun rays filtering through the trees, mystical and powerful vibe.",
    },
    {
      src: spritePrompt,
      description:
        "Dynamic digital artwork of a Sprite can split into floating segments with ice cubes, lime & lemon splashes on vibrant green background.",
    },
  ];

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [nextImageIdx, setNextImageIdx] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    "A mystical forest with glowing mushrooms and fireflies",
    "Cyberpunk cityscape at night with neon lights",
    "Majestic dragon soaring above medieval castle",
    "Underwater temple with sunbeams filtering through",
    "Steampunk airship flying through clouds",
  ];

  // Smooth image transition effect
  useEffect(() => {
    if (imageUrl || loading || error) return;

    const transitionImages = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIdx(nextImageIdx);
        setNextImageIdx((nextImageIdx + 1) % defaultImages.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 500);
    };

    const interval = setInterval(transitionImages, 5000);
    return () => clearInterval(interval);
  }, [imageUrl, loading, error, nextImageIdx]);

  const navigateImage = (direction: "prev" | "next") => {
    if (imageUrl || loading || error) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === "next") {
        setCurrentImageIdx((currentImageIdx + 1) % defaultImages.length);
        setNextImageIdx((currentImageIdx + 2) % defaultImages.length);
      } else {
        setCurrentImageIdx(
          (currentImageIdx - 1 + defaultImages.length) % defaultImages.length
        );
        setNextImageIdx((currentImageIdx + 1) % defaultImages.length);
      }
      setTimeout(() => setIsTransitioning(false), 100);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageUrl(null);
    setImageLoaded(false);

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to generate image.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        setGenerationCount((prev) => prev + 1);
      } else {
        setError("No image returned from server.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => setPrompt(suggestion);

  const handleRegenerate = () => {
    if (prompt.trim()) {
      handleSubmit(new Event("submit") as React.FormEvent);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageLoad = () => setImageLoaded(true);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-storiq-purple animate-pulse" />
              AI Image Generator
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Transform your imagination into stunning visuals with AI
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-[40%] space-y-6">
            <div className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label
                    htmlFor="prompt"
                    className="text-white font-medium flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4 text-storiq-purple" />
                    Describe your vision
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="A beautiful landscape with mountains at sunset..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    autoFocus
                    className="bg-black/40 border border-gray-700 text-white placeholder:text-white/40 min-h-[120px] text-base rounded-xl focus:ring-2 focus:ring-storiq-purple/50 focus:border-storiq-purple transition resize-none px-4 py-3"
                  />
                </div>

                {/* Suggestions */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Try these ideas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={loading}
                        className="px-3 py-2 text-sm bg-gray-900/60 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-storiq-purple/40 hover:scale-105 transition disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold h-12 text-base rounded-xl transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Image
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[60%]">
            <div className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 h-full backdrop-blur-lg">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader message="Painting your vision..." size="small" />
                  <p className="text-gray-400 text-sm animate-pulse">
                    This may take a few moments...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="p-3 bg-red-500/10 rounded-full animate-bounce">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div className="text-red-400 text-center font-medium">
                    {error}
                  </div>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 transition"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {/* Generated Image */}
              {imageUrl && !loading && (
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="rounded-xl overflow-hidden border border-gray-700 bg-black/40">
                      <img
                        src={imageUrl}
                        alt={`Generated: ${prompt}`}
                        className={`w-full h-auto max-h-96 object-contain transition-all duration-700 ${
                          imageLoaded
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-105"
                        }`}
                        onLoad={handleImageLoad}
                      />
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-storiq-purple"></div>
                        </div>
                      )}
                    </div>

                    {/* Floating Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        onClick={handleDownload}
                        size="sm"
                        className="bg-black/70 hover:bg-black text-white border border-gray-600 hover:scale-110 transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleRegenerate}
                        size="sm"
                        className="bg-black/70 hover:bg-black text-white border border-gray-600 hover:scale-110 transition"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="bg-gray-800/60 px-3 py-1 rounded-full">
                        Generation #{generationCount}
                      </span>
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-storiq-purple hover:text-storiq-purple/80 underline"
                      >
                        View full resolution
                      </a>
                    </div>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      className="border-storiq-purple/50 text-storiq-purple hover:bg-storiq-purple/10 transition"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate Another
                    </Button>
                  </div>

                  {/* Prompt */}
                  <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <Wand2 className="w-3 h-3" />
                      Prompt used:
                    </p>
                    <p className="text-sm text-gray-300 font-medium">
                      {prompt}
                    </p>
                  </div>
                </div>
              )}

              {/* Default Carousel */}
              {!imageUrl && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
                  <div className="relative w-full max-w-md">
                    <button
                      onClick={() => navigateImage("prev")}
                      disabled={isTransitioning}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 border border-gray-600 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>

                    <button
                      onClick={() => navigateImage("next")}
                      disabled={isTransitioning}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 border border-gray-600 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>

                    <div
                      ref={imageContainerRef}
                      className="relative bg-gradient-to-br from-storiq-purple/10 to-blue-500/10 rounded-2xl p-6 transition-all"
                    >
                      <div className="relative h-64 sm:h-80">
                        <img
                          src={defaultImages[currentImageIdx].src}
                          alt="Prompt example"
                          className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-all duration-500 ${
                            isTransitioning
                              ? "opacity-0 scale-95"
                              : "opacity-100 scale-100"
                          }`}
                        />
                        <img
                          src={defaultImages[nextImageIdx].src}
                          alt="Next prompt example"
                          className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-all duration-500 ${
                            isTransitioning
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-105"
                          }`}
                        />
                      </div>
                      <div className="mt-6 px-2">
                        <h4 className="text-white/70 text-base font-semibold mb-3 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-storiq-purple" />
                          Example Prompt
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {defaultImages[currentImageIdx].description}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center mt-4 space-x-2">
                      {defaultImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (i !== currentImageIdx) {
                              setIsTransitioning(true);
                              setTimeout(() => {
                                setCurrentImageIdx(i);
                                setNextImageIdx((i + 1) % defaultImages.length);
                                setTimeout(
                                  () => setIsTransitioning(false),
                                  100
                                );
                              }, 500);
                            }
                          }}
                          className={`w-2 h-2 rounded-full transition ${
                            i === currentImageIdx
                              ? "bg-storiq-purple w-6"
                              : "bg-gray-600 hover:bg-gray-500"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm animate-pulse">
                    ✨ Enter your prompt above to create amazing images
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {(imageUrl || loading) && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              Powered by AI • Images are generated on-demand
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ImageGenerator;
