import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Play, Heart, MessageCircle, Search, Filter, Calendar, Users, Clock, Download, Share2, ExternalLink, ThumbsUp, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from "axios";
import { useEffect } from "react";

const SearchVideos = () => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("Viral Videos");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    sortOrder: "viewCount",
    minLikes: 0,
    language: "english",
    dateRange: { from: "2024-01-01", to: new Date().toISOString().split('T')[0] },
    duration: "any"
  });

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const suggestedTags = [
    "how to go viral on TikTok", 
    "best AI tools",
    "create personal brand",
    "digital marketing tips",
    "social media strategy",
    "content creation",
    "video editing tutorials",
    "YouTube growth"
  ];

  const popularCategories = [
    { name: "Trending", icon: "🔥" },
    { name: "Education", icon: "📚" },
    { name: "Entertainment", icon: "🎬" },
    { name: "Technology", icon: "💻" },
    { name: "Gaming", icon: "🎮" },
    { name: "Music", icon: "🎵" }
  ];

  const fetchYouTubeVideos = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.post(`${apiBaseUrl}/youtube/search`, {
        query: searchTerm,
        from: `${filters.dateRange.from}T00:00:00Z`,
        to: `${filters.dateRange.to}T23:59:59Z`,
        order: filters.sortOrder,
        maxResults: 20
      });

      let mappedVideos = res.data.map((video: any) => ({
        id: video.id,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        platform: "YouTube",
        title: video.snippet.title,
        description: video.snippet.description,
        views: parseInt(video.statistics?.viewCount) || 0,
        likes: parseInt(video.statistics?.likeCount) || 0,
        comments: parseInt(video.statistics?.commentCount) || 0,
        author: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: "N/A",
        channelId: video.snippet.channelId
      }));

      // Apply filters
      mappedVideos = mappedVideos.filter(video => video.likes >= filters.minLikes);

      setVideoResults(mappedVideos);

      // Update search history
      if (!searchHistory.includes(searchTerm)) {
        const newHistory = [searchTerm, ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem("youtubeSearchHistory", JSON.stringify(newHistory));
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setVideoResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("youtubeSearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    fetchYouTubeVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchYouTubeVideos();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("youtubeSearchHistory");
  };

  const formatNumber = (num: number | undefined) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadVideoInfo = (video: any) => {
    const videoData = {
      title: video.title,
      author: video.author,
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      publishedAt: video.publishedAt,
      url: `https://www.youtube.com/watch?v=${video.id}`
    };

    const blob = new Blob([JSON.stringify(videoData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-video-${video.id}-info.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover YouTube Videos</h1>
          <p className="text-white/60">Search and analyze viral YouTube content with advanced filters</p>
        </div>

        {/* Search Section */}
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-storiq-dark border-storiq-border text-white placeholder:text-white/40 h-12 text-lg pl-10 pr-4"
                placeholder="Search for YouTube videos..."
              />
            </div>
            <Button 
              className="bg-storiq-purple hover:bg-storiq-purple-light text-white px-8 h-12 flex items-center gap-2"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-white/60 text-sm">Recent searches:</span>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(term);
                      setTimeout(handleSearch, 100);
                    }}
                    className="text-sm bg-storiq-dark hover:bg-storiq-purple/20 text-white px-3 py-1 rounded-full transition-colors border border-storiq-border"
                  >
                    {term}
                  </button>
                ))}
                <button
                  onClick={clearSearchHistory}
                  className="text-sm text-white/40 hover:text-white/60 transition-colors"
                  title="Clear history"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Quick Categories */}
          <div className="mb-2">
            <span className="text-white/60 text-sm">Popular categories:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(category.name);
                    setTimeout(handleSearch, 100);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-storiq-dark hover:bg-storiq-purple/20 border border-storiq-border rounded-lg text-white text-sm transition-colors"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
          {suggestedTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchTerm(tag);
                setTimeout(handleSearch, 100);
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                tag === searchTerm
                  ? "bg-storiq-purple text-white shadow-lg"
                  : "bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20 hover:border-storiq-purple/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 text-white hover:text-storiq-purple transition-colors mb-4 p-3 bg-storiq-card-bg border border-storiq-border rounded-lg"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Advanced Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {showAdvancedFilters && (
            <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 space-y-6">
              {/* Filter Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sorting */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Sorting order
                  </label>
                  <Select 
                    value={filters.sortOrder}
                    onValueChange={(value) => setFilters({...filters, sortOrder: value})}
                  >
                    <SelectTrigger className="bg-storiq-dark border-storiq-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-storiq-card-bg border-storiq-border">
                      <SelectItem value="relevance" className="text-white hover:bg-storiq-purple/20">Most relevant</SelectItem>
                      <SelectItem value="date" className="text-white hover:bg-storiq-purple/20">Most recent</SelectItem>
                      <SelectItem value="viewCount" className="text-white hover:bg-storiq-purple/20">Most popular</SelectItem>
                      <SelectItem value="rating" className="text-white hover:bg-storiq-purple/20">Highest rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum likes */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Minimum likes
                  </label>
                  <Input
                    type="number"
                    value={filters.minLikes}
                    onChange={(e) => setFilters({...filters, minLikes: parseInt(e.target.value) || 0})}
                    className="bg-storiq-dark border-storiq-border text-white"
                    placeholder="0"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Language
                  </label>
                  <Select 
                    value={filters.language}
                    onValueChange={(value) => setFilters({...filters, language: value})}
                  >
                    <SelectTrigger className="bg-storiq-dark border-storiq-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-storiq-card-bg border-storiq-border">
                      <SelectItem value="english" className="text-white hover:bg-storiq-purple/20">English</SelectItem>
                      <SelectItem value="spanish" className="text-white hover:bg-storiq-purple/20">Spanish</SelectItem>
                      <SelectItem value="french" className="text-white hover:bg-storiq-purple/20">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration
                  </label>
                  <Select 
                    value={filters.duration}
                    onValueChange={(value) => setFilters({...filters, duration: value})}
                  >
                    <SelectTrigger className="bg-storiq-dark border-storiq-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-storiq-card-bg border-storiq-border">
                      <SelectItem value="any" className="text-white hover:bg-storiq-purple/20">Any duration</SelectItem>
                      <SelectItem value="short" className="text-white hover:bg-storiq-purple/20">Short (&lt; 4 min)</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-storiq-purple/20">Medium (4-20 min)</SelectItem>
                      <SelectItem value="long" className="text-white hover:bg-storiq-purple/20">Long ({'>'} 20 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">From</label>
                    <Input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, from: e.target.value}})}
                      className="bg-storiq-dark border-storiq-border text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">To</label>
                    <Input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, to: e.target.value}})}
                      className="bg-storiq-dark border-storiq-border text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSearch}
                  className="bg-storiq-purple hover:bg-storiq-purple-light text-white"
                  disabled={loading}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        {!loading && videoResults.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Found {videoResults.length} videos for "{searchTerm}"
            </h2>
            <div className="text-white/60 text-sm">
              Sorted by {filters.sortOrder === 'viewCount' ? 'popularity' : filters.sortOrder}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-storiq-purple mx-auto mb-4"></div>
              <p className="text-white/60">Searching YouTube videos...</p>
            </div>
          </div>
        )}

        {/* Error/Empty State */}
        {!loading && videoResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-storiq-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-storiq-purple" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
            <p className="text-white/60">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Video Results */}
        {!loading && videoResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videoResults.map((video) => (
              <div
                key={video.id}
                className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden hover:border-storiq-purple/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handleVideoClick(video)}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  
                  {/* Platform Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-white">▶</span>
                    </div>
                    <span className="text-white text-xs font-medium">YouTube</span>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded px-1.5 py-1">
                    <span className="text-white text-xs font-medium">{video.duration}</span>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* View Count */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs font-medium">
                      {formatNumber(video.views)} views
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-storiq-purple transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-white/60 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {video.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(video.publishedAt)}
                    </span>
                  </div>

                  {/* Video Stats */}
                  <div className="flex items-center justify-between text-white/60 text-sm">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{formatNumber(video.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatNumber(video.comments)}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadVideoInfo(video);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white"
                      title="Download video info"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Playback Modal */}
        <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
          <DialogContent className="max-w-4xl bg-storiq-card-bg border-storiq-border text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedVideo?.title}</DialogTitle>
              <DialogDescription className="text-white/60">
                {selectedVideo?.platform} • {selectedVideo?.author} • {formatNumber(selectedVideo?.views)} views • Published {formatDate(selectedVideo?.publishedAt)}
              </DialogDescription>
            </DialogHeader>

            {selectedVideo?.id && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-storiq-dark rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-storiq-purple">{formatNumber(selectedVideo.likes)}</div>
                    <div className="text-white/60 text-sm">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-storiq-purple">{formatNumber(selectedVideo.comments)}</div>
                    <div className="text-white/60 text-sm">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-storiq-purple">{formatNumber(selectedVideo.views)}</div>
                    <div className="text-white/60 text-sm">Views</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-storiq-purple hover:bg-storiq-purple-light text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch on YouTube
                  </a>
                  <button
                    onClick={() => downloadVideoInfo(selectedVideo)}
                    className="flex items-center gap-2 px-4 py-2 border border-storiq-border hover:bg-storiq-purple/20 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Info
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SearchVideos;