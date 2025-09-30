import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
// import CreateVideo from './create-new-video';

// --- Main Dashboard Component ---

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No Supabase: set empty data and loading false
    setData([]);
    setLoading(false);
  }, []);

  // Data for the quick options cards, updated with images and styles to match the screenshot
  const quickOptions = [
    {
      superTitle: "YouTube",
      title: "Search Viral Videos",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute top-6 right-6 text-gray-400 group-hover:text-white transition-colors"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      image:
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
      href: "/dashboard/search-videos",
    },
    {
      superTitle: "4k images",
      title: "Search Images",
      image:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      superTitle: "",
      title: "Setup Auto Mode",
      image:
        "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
  ];

  // Data for the tools grid, updated with varied, realistic images and corrected text
  const tools = [
    {
      title: "Video Generator",
      subtitle: "Turn text into videos with AI",
      image: "/src/assets/images/ai-video-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-video",
    },
    {
      title: "Image Generator",
      subtitle: "Create images from your imagination",
      image: "/src/assets/images/ai-image-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-image",
    },
    {
      title: "Image Editor",
      subtitle: "Edit images with AI",
      image: "/src/assets/images/ai-imageeditor-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/edit-image",
    },
    {
      title: "Script Generator",
      subtitle: "Generate creative video scripts",
      image: "/src/assets/images/ai-script-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-prompt",
    },
    {
      title: "Ai-Audio Mounting",
      subtitle: "Help to Mount AI Audio to Video",
      image: "./ai-voice-mounting.jpeg",
      buttonText: "Try Now",
      link: "/dashboard/aitextmounting",
    },
    {
      title: "Image mobing tool",
      subtitle: "Add object to other background scene",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/WhatsApp+Image+2025-09-24+at+15.54.32.jpeg",
      buttonText: "Try Now",
      link: "/dashboard/aitools/Mobimage",
      
    },
   {
      title: "Script to Live Analyzer",
      subtitle: "Generate audio automatically",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/Screenshot+2025-09-26+110713.png",
      buttonText: "Try Now",
      link: "/dashboard/aitools/tts",
     
    },
    
  ];

  const tabs = ["Home", "Creation", "Inspiration"];
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#121212] min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Start Creating!
          </h1>
          <p className="text-gray-400">Choose how you want to get started</p>
          <Button
            className="mt-6 bg-gradient-to-r from-violet-700 to-fuchsia-600 hover:from-violet-800 hover:to-fuchsia-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg flex items-center gap-2 text-lg transition-all duration-200"
            onClick={() => navigate("/dashboard/create-video")}
          >
            <Play className="w-5 h-5" />
            Create New Video
          </Button>
        </div>

        {/* Quick Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {quickOptions.map((option, index) => {
            // Only for "Generate Scripts" quick option (index 1)
            if (
              option.superTitle === "VIDEO SCRIPT" &&
              option.title === "Generate Scripts"
            ) {
              // Removed the clickable card for "Generate Scripts"
              return null;
            }

            // Make "Search Images" quick option a clickable card using navigate
            if (
              option.superTitle === "4k images" &&
              option.title === "Search Images"
            ) {
              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate("/dashboard/search-images")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate("/dashboard/search-images");
                    }
                  }}
                  className="relative overflow-hidden rounded-2xl bg-[#1C1C1C] border border-gray-800/80 p-6 min-h-[180px] flex flex-col justify-end group cursor-pointer transition-all duration-300 hover:border-violet-700/60 hover:shadow-lg hover:shadow-violet-700/20 outline-none"
                  style={{ userSelect: "none" }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-300"
                    style={{ backgroundImage: `url(${option.image})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  {option.icon}
                  <div className="relative z-10">
                    {option.superTitle && (
                      <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">
                        {option.superTitle}
                      </p>
                    )}
                    <h3 className="text-white text-xl font-bold">
                      {option.title}
                    </h3>
                  </div>
                </div>
              );
            }

            // All other quick options remain as links
            return (
              <a
                key={index}
                href={option.href || "#"}
                className="relative overflow-hidden rounded-2xl bg-[#1C1C1C] border border-gray-800/80 p-6 min-h-[180px] flex flex-col justify-end group cursor-pointer transition-all duration-300 hover:border-violet-700/60 hover:shadow-lg hover:shadow-violet-700/20"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-300"
                  style={{ backgroundImage: `url(${option.image})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                {option.icon}
                <div className="relative z-10">
                  {option.superTitle && (
                    <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">
                      {option.superTitle}
                    </p>
                  )}
                  <h3 className="text-white text-xl font-bold">
                    {option.title}
                  </h3>
                </div>
              </a>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === index
                  ? "bg-violet-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-[#1C1C1C] border border-gray-800/80 rounded-2xl overflow-hidden group transition-all duration-300 hover:border-violet-700/50 hover:transform hover:-translate-y-1"
            >
              <div className="overflow-hidden h-40">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-white text-lg font-bold mb-1">
                  {tool.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{tool.subtitle}</p>
                <Button
                  variant="outline"
                  className="w-auto px-5 py-2 bg-transparent border border-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 hover:border-violet-700 transition-colors"
                  onClick={() => navigate(tool.link)}
                  // Add onClick handler
                >
                  {tool.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
