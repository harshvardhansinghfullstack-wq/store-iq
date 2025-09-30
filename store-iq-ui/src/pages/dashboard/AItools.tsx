import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { SparklesIcon, HeadphonesIcon, MegaphoneIcon, RocketIcon, PencilLineIcon } from "lucide-react"; // Import some new icons

// --- Tool type ---
interface Tool {
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
  icon: React.ElementType; // Add an icon property
}

// --- AI Tools Page ---
const AIToolsPage: React.FC = () => {
  const navigate = useNavigate();

  const tools: Tool[] = [
    {
      title: "Video Generator",
      subtitle: "Turn text into videos with AI",
      image: "/src/assets/images/ai-video-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-video",
      icon: HeadphonesIcon,
    },
    {
      title: "Image Generator",
      subtitle: "Create images from your imagination",
      image: "/src/assets/images/ai-image-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-image",
      icon: RocketIcon,
    },
    {
      title: "Script Generator",
      subtitle: "Generate creative video scripts",
      image: "/src/assets/images/ai-script-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-prompt",
      icon: PencilLineIcon,
    },
    {
      title: "AI Audio Mounting",
      subtitle: "Attach AI audio to video",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/ai-voice-mounting.jpeg",
      buttonText: "Try Now",
      link: "/dashboard/aitextmounting",
      icon: HeadphonesIcon, // Assign an icon
    },
    {
      title: "Script to Live Analyzer",
      subtitle: "Generate audio automatically",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/Screenshot+2025-09-26+110713.png",
      buttonText: "Try Now",
      link: "/dashboard/aitools/tts",
      icon: MegaphoneIcon, // Assign an icon
    },
    {
      title: "Image Editor",
      subtitle: "Edit images with AI",
      image: "/src/assets/images/ai-imageeditor-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/edit-image",
      icon: PencilLineIcon,
    },
    // {
    //   title: "Video Podcast Generator",
    //   subtitle: "Generate podcasts from videos",
    //   image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop",
    //   buttonText: "Try Now",
    //   link: "/dashboard/aitextmounting",
    //   icon: RocketIcon, // Assign an icon
    // },
    // {
    //   title: "AI Script Writer",
    //   subtitle: "Generate video scripts quickly",
    //   image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    //   buttonText: "Try Now",
    //   link: "/dashboard/scripts",
    //   icon: PencilLineIcon, 
    // },
    {
      title: "Image mobing tool",
      subtitle: "Add object to other background scene",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/WhatsApp+Image+2025-09-24+at+15.54.32.jpeg",
      buttonText: "Try Now",
      link: "/dashboard/aitools/Mobimage",
      icon: RocketIcon, 
    },
    {
      title: "Ai-assistant",
      subtitle: "Ask Anything about your social media assist you for achieving your goals",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/Screenshot+2025-09-29+172349.png",
      buttonText: "Try Now",
      link: "/dashboard/ai-bot",
      icon: PencilLineIcon,
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] min-h-screen text-white">
        {/* Header */}
        <div className="mb-10 text-center">
          <SparklesIcon className="w-12 h-12 text-violet-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Supercharge Your Workflow with AI
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover a suite of powerful AI tools designed to streamline your content creation and boost productivity.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="relative bg-[#1C1C1C] border border-gray-800 rounded-xl overflow-hidden shadow-lg 
                         hover:shadow-violet-500/30 hover:border-violet-600 transition-all duration-300 group
                         flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 p-2 bg-violet-600/80 rounded-full">
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-white text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow">{tool.subtitle}</p>
                <Button
                  variant="outline"
                  className="mt-auto w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 
                             border border-transparent text-white text-base font-semibold rounded-lg shadow-md
                             "
                  onClick={() => navigate(tool.link)}
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

export default AIToolsPage;