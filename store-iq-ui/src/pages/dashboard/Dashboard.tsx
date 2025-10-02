"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Play, Sparkles, Zap } from "lucide-react"

const Dashboard = () => {
  const [data, setData] = useState<unknown[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setData([])
    setLoading(false)
  }, [])

  const navigateTo = (path: string) => {
    window.location.href = path
  }

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
  ]

const tools = [
    {
      title: "Video Generator",
      subtitle: "Turn text into videos with AI",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/src/assets/images/ai-video-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-video",
    },
    {
      title: "Image Generator",
      subtitle: "Create images from your imagination",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/src/assets/images/ai-image-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-image",
    },
    {
      title: "Image Editor",
      subtitle: "Edit images with AI",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/src/assets/images/ai-imageeditor-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/edit-image",
    },
    {
      title: "Script Generator",
      subtitle: "Generate creative video scripts",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/src/assets/images/ai-script-placeholder.png",
      buttonText: "Try Now",
      link: "/dashboard/create-prompt",
    },
    {
      title: "Ai-Audio Mounting",
      subtitle: "Help to Mount AI Audio to Video",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/ai-voice-mounting.jpeg",
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
    {
      title: "Ai-assistant",
      subtitle: "Ask Anything about your social media assist you for achieving your goals",
      image: "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/Screenshot+2025-09-29+172349.png",
      buttonText: "Try Now",
      link: "/dashboard/ai-bot",
 
    }
    
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#1A0B2E]">
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 p-8 pt-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 mb-6 leading-tight">
                  Start Creating!
                </h1>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Unleash your creativity with our suite of AI-powered tools. From videos to images, scripts to audio -
                  create anything you can imagine.
                </p>
                <Button
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-bold px-10 py-6 rounded-2xl shadow-2xl shadow-violet-600/25 flex items-center gap-3 text-lg transition-all duration-300 hover:scale-105 hover:shadow-violet-600/40 mx-auto group"
                  onClick={() => navigateTo("/dashboard/create-video")}
                >
                  <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6" />
                  </div>
                  Create New Video
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {quickOptions.map((option, index) => {
                  if (option.superTitle === "VIDEO SCRIPT" && option.title === "Generate Scripts") {
                    return null
                  }

                  if (option.superTitle === "4k images" && option.title === "Search Images") {
                    return (
                      <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigateTo("/dashboard/search-images")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            navigateTo("/dashboard/search-images")
                          }
                        }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1C] to-[#2A2A2A] border border-gray-700/50 p-8 min-h-[220px] flex flex-col justify-end group cursor-pointer transition-all duration-500 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-600/20 outline-none hover:scale-[1.02] backdrop-blur-sm"
                        style={{ userSelect: "none" }}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                          style={{ backgroundImage: `url(${option.image})` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        {option.icon}
                        <div className="relative z-10">
                          {option.superTitle && (
                            <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-2 opacity-80">
                              {option.superTitle}
                            </p>
                          )}
                          <h3 className="text-white text-2xl font-bold group-hover:text-violet-100 transition-colors">
                            {option.title}
                          </h3>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <a
                      key={index}
                      href={option.href || "#"}
                      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1C] to-[#2A2A2A] border border-gray-700/50 p-8 min-h-[220px] flex flex-col justify-end group cursor-pointer transition-all duration-500 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-600/20 hover:scale-[1.02] backdrop-blur-sm"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                        style={{ backgroundImage: `url(${option.image})` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                      {option.icon}
                      <div className="relative z-10">
                        {option.superTitle && (
                          <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-2 opacity-80">
                            {option.superTitle}
                          </p>
                        )}
                        <h3 className="text-white text-2xl font-bold group-hover:text-violet-100 transition-colors">
                          {option.title}
                        </h3>
                      </div>
                    </a>
                  )
                })}
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">AI Tools & Features</h2>
                <p className="text-gray-400 text-center mb-12 text-lg">
                  Explore our comprehensive suite of AI-powered creative tools
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((tool, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-[#1C1C1C] via-[#252525] to-[#1A1A1A] border border-gray-700/50 rounded-3xl overflow-hidden group transition-all duration-500 hover:border-violet-500/50 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-600/20 backdrop-blur-sm"
                  >
                    <div className="overflow-hidden h-48 relative">
                      <img
                        src={tool.image || "/placeholder.svg"}
                        alt={tool.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-white text-xl font-bold mb-2 group-hover:text-violet-100 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tool.subtitle}</p>
                      <Button
                        variant="outline"
                        className="w-full px-6 py-3 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/30 text-white text-sm font-semibold rounded-xl hover:bg-gradient-to-r hover:from-violet-600 hover:to-fuchsia-600 hover:border-violet-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-600/25"
                        onClick={() => navigateTo(tool.link)}
                      >
                        {tool.buttonText}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
