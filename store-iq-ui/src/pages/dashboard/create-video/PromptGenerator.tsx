import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import {
  Wand2,
  Copy,
  ChevronDown,
  ChevronUp,
  History,
  FileText,
  Zap,
  Lightbulb,
  Star,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpen,
  Clock,
  Trash2,
  Sparkles,
  Bot,
  Video,
  Mic,
  Music,
  Palette
} from "lucide-react";

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  );
}

import DashboardLayout from "@/components/DashboardLayout";

const PromptGenerator: React.FC = () => {
  const { user } = useAuth();

  // --- STATE MANAGEMENT ---
  type Status = "idle" | "loading" | "success" | "error";
  const [prompt, setPrompt] = useState(
    `Create a video about sustainable living tips.

Feature a young female character.

Each scene should have a different background. Use a modern sans-serif font and vibrant nature visuals.`
  );
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  // Status for script generation
  const [scriptStatus, setScriptStatus] = useState<Status>("idle");
  const [scriptError, setScriptError] = useState<string | null>(null);

  // Form validation error
  const [formError, setFormError] = useState<string | null>(null);

  // --- SCRIPT HISTORY ---
  type ScriptHistoryItem = {
    _id: string;
    prompt: string;
    script: string;
    createdAt: string;
    rating?: number;
  };
  const [scriptHistory, setScriptHistory] = useState<ScriptHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [clearAllLoading, setClearAllLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [clearAllError, setClearAllError] = useState<string | null>(null);

  // --- NEW FEATURES STATE ---
  const [expandedCards, setExpandedCards] = useState<boolean[]>([]);
  const [copiedCards, setCopiedCards] = useState<boolean[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [scriptTone, setScriptTone] = useState<"professional" | "casual" | "funny" | "dramatic">("professional");
  const [scriptLength, setScriptLength] = useState<"short" | "medium" | "long">("medium");
  const [includeElements, setIncludeElements] = useState<string[]>(["visuals", "audio"]);
  const [userRating, setUserRating] = useState<{[key: string]: number}>({});

  // Template prompts
  const templatePrompts = [
    {
      title: "Product Demo",
      icon: Video,
      prompt: "Create a product demonstration video for a new tech gadget. Show key features, benefits, and include a call-to-action.",
      category: "Marketing"
    },
    {
      title: "Educational Content",
      icon: BookOpen,
      prompt: "Explain a complex topic in simple terms for beginners. Use analogies and visual examples to make it engaging.",
      category: "Education"
    },
    {
      title: "Social Media Ad",
      icon: Zap,
      prompt: "Create a short, attention-grabbing video ad for social media. Focus on hooking viewers in the first 3 seconds.",
      category: "Advertising"
    },
    {
      title: "Storytelling",
      icon: Music,
      prompt: "Tell a compelling story that connects with emotions. Include character development and a meaningful message.",
      category: "Entertainment"
    }
  ];

  // Tone options
  const toneOptions = [
    { value: "professional", label: "Professional", icon: FileText },
    { value: "casual", label: "Casual", icon: Zap },
    { value: "funny", label: "Funny", icon: Sparkles },
    { value: "dramatic", label: "Dramatic", icon: Video }
  ];

  // Element options
  const elementOptions = [
    { value: "visuals", label: "Visual Cues", icon: Palette },
    { value: "audio", label: "Audio Notes", icon: Mic },
    { value: "music", label: "Music Suggestions", icon: Music },
    { value: "transitions", label: "Transitions", icon: RefreshCw }
  ];

  // Keep per-card state arrays in sync with scriptHistory length
  useEffect(() => {
    setExpandedCards(scriptHistory.map(() => false));
    setCopiedCards(scriptHistory.map(() => false));
  }, [scriptHistory]);

  // Fetch history
  const hasFetchedHistory = React.useRef(false);
  useEffect(() => {
    if (hasFetchedHistory.current) return;
    hasFetchedHistory.current = true;
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    const userId = user?.id || user?.email;
    try {
      const res = await fetch(`/api/scripts/history?userId=${encodeURIComponent(userId || "")}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setScriptHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistoryError("Failed to load script history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      setFormError("Please enter a prompt description");
      return;
    }
    
    setFormError(null);
    setScriptStatus("loading");
    setScriptError(null);

    const enhancedPrompt = `${prompt}\n\nTone: ${scriptTone}\nLength: ${scriptLength}\nInclude: ${includeElements.join(", ")}`;

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: enhancedPrompt }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      
      if (!data?.script) throw new Error("No script returned");
      
      setGeneratedScript(data.script);
      setScriptStatus("success");
      
      if (user) {
        // Optimistic update
        const newItem = {
          _id: Math.random().toString(36).slice(2),
          prompt: enhancedPrompt,
          script: data.script,
          createdAt: new Date().toISOString(),
        };
        setScriptHistory(prev => [newItem, ...prev]);
        
        // Save to backend
        await fetch("/api/scripts/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: user.id || user.email, 
            prompt: enhancedPrompt, 
            script: data.script 
          }),
          credentials: "include",
        });
      }
    } catch (err) {
      setScriptError(isErrorWithMessage(err) ? err.message : "Generation failed");
      setScriptStatus("error");
    }
  };

  const handleUseTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    setActiveTab("generate");
  };

  const handleRateScript = async (scriptId: string, rating: number) => {
    setUserRating(prev => ({ ...prev, [scriptId]: rating }));
    // Here you would typically send the rating to your backend
  };

  const handleDownloadScript = (script: string, title: string) => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareScript = async (script: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Script',
          text: script.substring(0, 100) + '...',
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(script);
      }
    } else {
      navigator.clipboard.writeText(script);
    }
  };

  const handleDeleteHistoryItem = async (_id: string) => {
    setDeleteLoading(_id);
    try {
      await fetch(`/api/scripts/history/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setScriptHistory(prev => prev.filter(item => item._id !== _id));
    } catch (err) {
      setDeleteError("Failed to delete item");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    setClearAllLoading(true);
    try {
      await fetch(`/api/scripts/history?userId=${encodeURIComponent(user.id || user.email)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setScriptHistory([]);
    } catch (err) {
      setClearAllError("Failed to clear history");
    } finally {
      setClearAllLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-storiq-dark to-storiq-darker p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-storiq-card-bg/50 border border-storiq-border rounded-2xl px-6 py-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-storiq-purple to-storiq-purple-light rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                AI Script Generator
              </h1>
            </div>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Transform your ideas into professional video scripts with AI-powered creativity
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 bg-storiq-card-bg/30 border border-storiq-border rounded-2xl p-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === "generate"
                  ? "bg-storiq-purple text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Generate Script
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-storiq-purple text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Script History
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Templates & Settings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Templates */}
              <Card className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Quick Templates
                </h3>
                <div className="space-y-3">
                  {templatePrompts.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleUseTemplate(template.prompt)}
                      className="w-full text-left p-3 bg-storiq-dark hover:bg-storiq-purple/20 border border-storiq-border rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-storiq-purple/20 rounded-lg">
                          <template.icon className="w-4 h-4 text-storiq-purple" />
                        </div>
                        <span className="text-white font-medium group-hover:text-storiq-purple">
                          {template.title}
                        </span>
                      </div>
                      <span className="text-xs text-white/60 bg-storiq-card-bg px-2 py-1 rounded">
                        {template.category}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Script Settings */}
              <Card className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-storiq-purple" />
                  Script Settings
                </h3>
                
                {/* Tone Selection */}
                <div className="mb-4">
                  <label className="text-white/80 text-sm font-medium mb-2 block">Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setScriptTone(tone.value as any)}
                        className={`p-2 rounded-lg border transition-all ${
                          scriptTone === tone.value
                            ? "border-storiq-purple bg-storiq-purple/20 text-white"
                            : "border-storiq-border bg-storiq-dark text-white/60 hover:text-white"
                        }`}
                      >
                        <tone.icon className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length Selection */}
                <div className="mb-4">
                  <label className="text-white/80 text-sm font-medium mb-2 block">Length</label>
                  <div className="flex gap-2">
                    {["short", "medium", "long"].map((length) => (
                      <button
                        key={length}
                        onClick={() => setScriptLength(length as any)}
                        className={`flex-1 py-2 rounded-lg border transition-all ${
                          scriptLength === length
                            ? "border-storiq-purple bg-storiq-purple/20 text-white"
                            : "border-storiq-border bg-storiq-dark text-white/60 hover:text-white"
                        }`}
                      >
                        <span className="text-xs capitalize">{length}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include Elements */}
                <div>
                  <label className="text-white/80 text-sm font-medium mb-2 block">Include</label>
                  <div className="space-y-2">
                    {elementOptions.map((element) => (
                      <label key={element.value} className="flex items-center gap-3 text-white/80 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeElements.includes(element.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIncludeElements([...includeElements, element.value]);
                            } else {
                              setIncludeElements(includeElements.filter(el => el !== element.value));
                            }
                          }}
                          className="rounded border-storiq-border bg-storiq-dark text-storiq-purple"
                        />
                        <element.icon className="w-4 h-4" />
                        <span className="text-sm">{element.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "generate" ? (
                <>
                  {/* Prompt Input */}
                  <Card className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-storiq-purple" />
                        Describe Your Video
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="w-4 h-4" />
                        {scriptLength === 'short' ? '30-60s' : scriptLength === 'medium' ? '1-3min' : '3-5min'}
                      </div>
                    </div>

                    <Textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="Describe your video concept, target audience, key messages, and any specific requirements..."
                      className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[200px] resize-none focus:border-storiq-purple font-medium"
                    />

                    {formError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleGenerateScript}
                      disabled={scriptStatus === "loading"}
                      className="w-full mt-4 bg-gradient-to-r from-storiq-purple to-storiq-purple-light hover:from-storiq-purple/90 hover:to-storiq-purple-light/90 text-white font-semibold h-12 text-base transition-all duration-200"
                    >
                      {scriptStatus === "loading" ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating Script...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          Generate Script
                        </span>
                      )}
                    </Button>

                    {scriptError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{scriptError}</AlertDescription>
                      </Alert>
                    )}
                  </Card>

                  {/* Generated Script */}
                  {generatedScript && (
                    <Card className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          Generated Script
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadScript(generatedScript, "script")}
                            className="border-storiq-purple text-storiq-purple hover:bg-storiq-purple/20"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareScript(generatedScript)}
                            className="border-storiq-purple text-storiq-purple hover:bg-storiq-purple/20"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4">
                        <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                          {generatedScript}
                        </div>
                        
                        {/* Rating Section */}
                        <div className="mt-4 pt-4 border-t border-storiq-border">
                          <p className="text-white/60 text-sm mb-2">Rate this script:</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateScript("current", star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (userRating["current"] || 0)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-white/40"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                /* History Tab */
                <Card className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <History className="w-5 h-5 text-storiq-purple" />
                      Script History
                    </h3>
                    {scriptHistory.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllHistory}
                        disabled={clearAllLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {clearAllLoading ? "Clearing..." : "Clear All"}
                      </Button>
                    )}
                  </div>

                  {historyLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-storiq-purple mx-auto mb-2" />
                      <p className="text-white/60">Loading history...</p>
                    </div>
                  ) : scriptHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No script history yet</p>
                      <p className="text-white/40 text-sm mt-1">Your generated scripts will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scriptHistory.map((item, index) => (
                        <div key={item._id} className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-white font-medium line-clamp-2">{item.prompt.split('\n')[0]}</p>
                              <p className="text-white/40 text-xs mt-1">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.script);
                                  setCopiedCards(prev => {
                                    const newCards = [...prev];
                                    newCards[index] = true;
                                    setTimeout(() => {
                                      setCopiedCards(prev => {
                                        const resetCards = [...prev];
                                        resetCards[index] = false;
                                        return resetCards;
                                      });
                                    }, 2000);
                                    return newCards;
                                  });
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                {copiedCards[index] ? "Copied!" : "Copy"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setExpandedCards(prev => {
                                    const newCards = [...prev];
                                    newCards[index] = !newCards[index];
                                    return newCards;
                                  });
                                }}
                              >
                                {expandedCards[index] ? (
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                )}
                                {expandedCards[index] ? "Collapse" : "Expand"}
                              </Button>
                            </div>
                          </div>

                          <div className={`text-white/70 transition-all duration-300 ${
                            expandedCards[index] ? "max-h-96" : "max-h-20"
                          } overflow-hidden`}>
                            {item.script}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-storiq-border">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRateScript(item._id, star)}
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= (userRating[item._id] || 0)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-white/40"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteHistoryItem(item._id)}
                              disabled={deleteLoading === item._id}
                            >
                              {deleteLoading === item._id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PromptGenerator;