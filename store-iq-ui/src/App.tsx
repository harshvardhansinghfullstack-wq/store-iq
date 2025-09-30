import { Toaster as LocalToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import About from "./pages/About";
import Tools from "./pages/Tools";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./components/HeroSection";
import NotFound from "./pages/NotFound";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import Stats from "./pages/dashboard/Stats";
import Publish from "./pages/dashboard/Publish";
import Videos from "./pages/dashboard/Videos";
import Exports from "./pages/dashboard/Exports";
import Scripts from "./pages/dashboard/Scripts";
import Settings from "./pages/dashboard/Settings";
import VideoGenerator from "./pages/dashboard/create-video/VideoGenerator";
import ImageGenerator from "./pages/dashboard/create-video/ImageGenerator";
import PromptGenerator from "./pages/dashboard/create-video/PromptGenerator";
import ImageEditor from "./pages/dashboard/create-video/ImageEditor";
// import CreateVideo from "./pages/dashboard/CreateVideo";
import SearchVideos from "./pages/dashboard/SearchVideos";
import SearchImages from "./pages/dashboard/SearchImages";
import VideoEditor from "./pages/dashboard/VideoEditor";
import TextToSpeech from "./pages/dashboard/Aitextmounting";
import AIToolsPage from "./pages/dashboard/AItools";
import AIObjectBlendTool from "./pages/dashboard/ai-tools/Mobimagetool";
import TTSPlayer from "./pages/dashboard/ai-tools/Ttscharachter";

import { AuthProvider } from "./context/AuthContext";
import { LoaderProvider } from "./context/LoaderContext";
import ProtectedRoute from "./context/Protected";
import GoalBot from "./pages/dashboard/ai-tools/aibot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <LocalToaster />
      <Sonner />
      <LoaderProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/Home" element={<Home />} />

              {/* Protected Routes (everything else) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/stats"
                element={
                  <ProtectedRoute>
                    <Stats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/publish"
                element={
                  <ProtectedRoute>
                    <Publish />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/videos"
                element={
                  <ProtectedRoute>
                    <Videos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/exports"
                element={
                  <ProtectedRoute>
                    <Exports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/scripts"
                element={
                  <ProtectedRoute>
                    <Scripts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create-video"
                element={
                  <ProtectedRoute>
                    <VideoGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create-image"
                element={
                  <ProtectedRoute>
                    <ImageGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create-prompt"
                element={
                  <ProtectedRoute>
                    <PromptGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aitextmounting"
                element={
                  <ProtectedRoute>
                    <TextToSpeech />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aitools"
                element={
                  <ProtectedRoute>
                    <AIToolsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aitools/Mobimage"
                element={
                  <ProtectedRoute>
                    <AIObjectBlendTool />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aitools/tts"
                element={
                  <ProtectedRoute>
                    <TTSPlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/search-videos"
                element={
                  <ProtectedRoute>
                    <SearchVideos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/search-images"
                element={
                  <ProtectedRoute>
                    <SearchImages />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard/edit-image" element={<ImageEditor />} />
              <Route path="/dashboard/ai-bot" element={<GoalBot/>} />
              <Route
                path="/dashboard/video-editor/*"
                element={
                  <ProtectedRoute>
                    <VideoEditor />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LoaderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
