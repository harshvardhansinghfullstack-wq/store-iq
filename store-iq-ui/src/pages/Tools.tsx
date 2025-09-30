import React, { useState } from 'react';
import { motion, cubicBezier } from 'framer-motion'; // Import motion and cubicBezier
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
const Tools = () => {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login"); 
  };
  const tools = [
    { number: "01", name: "AI Script Generator", description: "Instantly generate compelling scripts for your videos." },
    { number: "02", name: "AI Hook Generator", description: "Create attention-grabbing intro hooks to captivate your audience." },
    { number: "03", name: "AI Face Video Creation", description: "Generate video with AI avatars delivering your script." },
    { number: "04", name: "AI Auto Mode", description: "Let AI automate your content creation workflow." },
    { number: "05", name: "Posting Calendar", description: "Plan and schedule your social media content with ease." },
    { number: "06", name: "Voice Clone", description: "Create a digital replica of your voice for audio content." },
    { number: "07", name: "Script Templates", description: "Access a library of pre-built script templates for various niches." },
    { number: "08", name: "Repurpose Tool", description: "Turn one piece of content into multiple formats for different platforms." },
    { number: "09", name: "Social Media Scheduling", description: "Schedule your posts across all your social media channels." },
    { number: "10", name: "AI Characters", description: "Create unique AI characters for your stories and videos." },
    { number: "11", name: "Timeline Editor", description: "A powerful editor to fine-tune your video projects." },
    { number: "12", name: "Clip Highlighter", description: "Automatically find and highlight the best moments in your videos." },
    { number: "13", name: "Brand Kit Integration", description: "Keep your content on-brand with integrated brand kits." },
    { number: "14", name: "AI Visual Library", description: "Access a vast library of AI-generated visuals for your projects." },
    { number: "15", name: "Emotion Tone Analyzer", description: "Analyze the emotional tone of your scripts and content." },
    { number: "16", name: "Export Panels", description: "Customize your export settings for any platform." },
    { number: "17", name: "Affiliate Program + API Access", description: "Join our affiliate program and get access to our API." },
    { number: "18", name: "Multi - Tone AI Voice Styles", description: "Generate voiceovers in multiple tones and styles." },
    { number: "19", name: "Smart Storyboard Generator", description: "Automatically create storyboards from your scripts." },
    { number: "20", name: "Media Matching Engine", description: "Find the perfect media to match your content's message." },
    { number: "21", name: "Auto-Resize for Platform", description: "Automatically resize your videos for different social platforms." },
    { number: "22", name: "Interactive Video Previews", description: "Create interactive previews of your video content." },
    { number: "23", name: "Instant Talking Avatar", description: "Create a talking avatar from a single image instantly." },
    { number: "24", name: "AI Camera Movement Simulations", description: "Simulate dynamic camera movements in your videos." },
    { number: "25", name: "AI - Powered B-Roll Inserter", description: "Automatically insert relevant B-roll footage into your videos." },
    { number: "26", name: "Podcast to video Tool", description: "Convert your podcast episodes into engaging videos." },
    { number: "27", name: "AI Subtitle Styler", description: "Automatically style your subtitles to match your brand." },
    { number: "28", name: "Video Length Trimmer", description: "Easily trim your videos to the perfect length." },
    { number: "29", name: "Ghibli AI Video Generator", description: "Create videos in the beautiful style of Studio Ghibli." },
    { number: "30", name: "Lyric Video Maker", description: "Create stunning lyric videos for your music." }
  ];

  // Define the cubic-bezier easing function for "easeOut"
  const easeOut = cubicBezier(0, 0, 0.58, 1);

  // Define animation variants for the text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
  };

  return (
    <div className="min-h-screen bg-[#121212] font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            FREE AI TOOLS
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-3xl mx-auto">
            STORIQ's powerful AI workspace makes content creation effortless. From text, 
            audio, or visuals — turn any idea into polished, ready-to-publish content!
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              const isHovered = hoveredTool === index;
              const isSelected = selectedTool === index;
              const shouldExpand = isHovered || isSelected;

              return (
                <div 
                  key={index}
                  className={`
                    border rounded-2xl p-8 transition-all duration-300 ease-in-out cursor-pointer group
                    ${
                      isSelected
                        ? 'bg-black border-gray-700'
                        : isHovered
                        ? 'bg-[#222] border-gray-700'
                        : 'bg-[#1a1a1a] border-[#2a2a2a]'
                    }
                  `}
                  onMouseEnter={() => setHoveredTool(index)}
                  onMouseLeave={() => setHoveredTool(null)}
                  onClick={() => setSelectedTool(selectedTool === index ? null : index)}
                >
                  {shouldExpand ? (
                    <motion.div 
                      className="flex flex-col h-full min-h-[220px]"
                      initial="hidden"
                      animate="visible"
                      variants={textVariants}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-semibold text-white pr-4">{tool.name}</h3>
                        <div className="text-lg text-white/40 font-mono flex-shrink-0">{tool.number}</div>
                      </div>
                      <p className="text-white/60 mb-6 flex-grow">{tool.description}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <button
      onClick={handleClick}
      className="text-white border border-white/30 rounded-full py-2 px-6 hover:bg-white hover:text-black transition-colors"
    >
      Try it out
    </button>
                        <svg width="24" height="24" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col h-full min-h-[220px]">
                      <div className="text-sm text-white/40 mb-3 font-mono">
                        {tool.number}
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {tool.name}
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tools;