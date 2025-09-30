// client/src/pages/dashboard/SearchImages.tsx

import React, { useEffect, useState } from "react";

type UnsplashImage = {
  id: string;
  alt_description: string | null;
  urls: {
    regular: string;
    full: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    profile_image: {
      small: string;
    };
  };
  links: {
    html: string;
  };
  created_at: string;
  likes: number;
};

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string;

const DEFAULT_QUERY = "nature";
const IMAGES_COUNT = 18;

import DashboardLayout from "@/components/DashboardLayout";

const SearchImages: React.FC = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>(DEFAULT_QUERY);
  const [preview, setPreview] = useState<UnsplashImage | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"relevant" | "latest">("relevant");

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("unsplashSearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const fetchImages = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${IMAGES_COUNT}&orientation=landscape&order=${sortBy}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch images");
      }
      const data = await res.json();
      setImages(data.results || []);

      // Update search history
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        const newHistory = [searchQuery.trim(), ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem("unsplashSearchHistory", JSON.stringify(newHistory));
      }
    } catch (err: unknown) {
      setError("Could not load images. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchImages(query);
    }
  };

  const handleQuickSearch = (quickQuery: string) => {
    setQuery(quickQuery);
    fetchImages(quickQuery);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("unsplashSearchHistory");
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `unsplash-${filename}-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setError('Download failed. Please try again.'));
  };

  const quickSearches = ["landscape", "wallpaper", "abstract", "minimal", "travel", "architecture"];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover HD/4K Images</h1>
          <p className="text-gray-300">Search millions of high-quality photos from Unsplash</p>
        </div>

        {/* Search Section */}
        <div className="bg-[#1C1C1C] rounded-xl shadow-sm border border-gray-800 p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for images (e.g. mountains, city, animals)..."
                className="border border-gray-700 bg-[#232323] text-white rounded-lg px-4 py-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                list="searchHistory"
              />
            </div>
            <button
              type="submit"
              className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </form>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-300">Sort by:</span>
            <div className="flex bg-[#232323] rounded-lg p-1">
              <button
                onClick={() => setSortBy("relevant")}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  sortBy === "relevant"
                    ? "bg-[#18181b] text-violet-400 shadow-sm"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Most Relevant
              </button>
              <button
                onClick={() => setSortBy("latest")}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  sortBy === "latest"
                    ? "bg-[#18181b] text-violet-400 shadow-sm"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Latest
              </button>
            </div>
          </div>

          {searchHistory.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Recent:</span>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(term)}
                    className="text-sm bg-[#232323] hover:bg-[#18181b] text-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    {term}
                  </button>
                ))}
                <button
                  onClick={clearSearchHistory}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                  title="Clear history"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Search Suggestions */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Popular Searches</h3>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((term) => (
            <button
              key={term}
              onClick={() => handleQuickSearch(term)}
              className="px-4 py-2 bg-[#232323] border border-gray-700 rounded-full text-sm text-gray-200 hover:border-violet-500 hover:text-violet-400 transition-all duration-200 shadow-sm hover:shadow"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for amazing images...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">
              {images.length > 0 ? `Found ${images.length} images` : 'No images found'}
            </h2>
            {images.length > 0 && (
              <span className="text-sm text-gray-400">Click on any image to preview</span>
            )}
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No images found</h3>
              <p className="text-gray-400">Try adjusting your search terms or browse popular categories</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-[#232323] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-800"
                  onClick={() => setPreview(img)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={img.urls.regular}
                      alt={img.alt_description || "Unsplash Image"}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(img.urls.full, img.id);
                        }}
                        className="bg-[#18181b] text-gray-200 p-2 rounded-full shadow-lg hover:bg-violet-600 hover:text-white transition-all"
                        title="Download HD"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={img.user.profile_image.small}
                        alt={img.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-white truncate">
                        {img.user.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{new Date(img.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>{img.likes} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative">
              <button
                className="absolute top-4 right-4 bg-[#232323] bg-opacity-90 hover:bg-opacity-100 text-white rounded-full p-2 z-10 shadow-lg hover:scale-110 transition-transform"
                onClick={() => setPreview(null)}
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <img
                src={preview.urls.full}
                alt={preview.alt_description || "Preview"}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={preview.user.profile_image.small}
                    alt={preview.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-white">{preview.user.name}</div>
                    <div className="text-sm text-gray-400">@{preview.user.username}</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <a
                    href={preview.links.html}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-gray-200 hover:border-violet-500 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Unsplash
                  </a>
                  <button
                    onClick={() => downloadImage(preview.urls.full, preview.id)}
                    className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-all font-medium"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download HD
                  </button>
                </div>
              </div>
              
              {preview.alt_description && (
                <div className="mt-4 p-3 bg-[#232323] rounded-lg">
                  <p className="text-sm text-gray-200">{preview.alt_description}</p>
                </div>
              )}
              
              <div className="flex gap-4 mt-4 text-sm text-gray-400">
                <span>Likes: {preview.likes}</span>
                <span>Uploaded: {new Date(preview.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default SearchImages;