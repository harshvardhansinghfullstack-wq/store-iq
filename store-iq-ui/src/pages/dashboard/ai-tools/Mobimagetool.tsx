import React, { useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import {
  Upload,
  ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const AIObjectBlendTool: React.FC = () => {
  const [sceneFile, setSceneFile] = useState<File | null>(null);
  const [objectFile, setObjectFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneImgRef = useRef<HTMLImageElement>(new Image());
  const fileInputSceneRef = useRef<HTMLInputElement>(null);
  const fileInputObjectRef = useRef<HTMLInputElement>(null);

  const handleSceneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSceneFile(file);
    setError(null);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      sceneImgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
      }
    };
  };

  const handleObjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setObjectFile(file);
    setError(null);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sceneFile || !objectFile) {
      setError("Please upload both scene and object images.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", objectFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/remove-bg`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
      const data = await res.json();
      if (!data.url) throw new Error("No AI image returned from backend");

      const objectUrl = data.url;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(sceneImgRef.current, 0, 0);

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX - 200;
      const y = (e.clientY - rect.top) * scaleY - 200;

      const objImg = new Image();
      objImg.crossOrigin = "anonymous";
      objImg.src = objectUrl;
      objImg.onload = () => {
        ctx.drawImage(objImg, x, y, 400, 400);
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to blend AI object.");
      setLoading(false);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "ai-composite.png";
    link.click();
  };

  const resetAll = () => {
    setSceneFile(null);
    setObjectFile(null);
    setError(null);
    if (fileInputSceneRef.current) fileInputSceneRef.current.value = "";
    if (fileInputObjectRef.current) fileInputObjectRef.current.value = "";
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-storiq-dark min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-storiq-purple animate-pulse" />
              AI Object Blending Tool
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Upload a scene and object → click to place the object → download your result.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 text-white/60">
            <div className={`flex items-center ${sceneFile ? "text-green-400" : ""}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Scene
            </div>
            <div>—</div>
            <div className={`flex items-center ${objectFile ? "text-green-400" : ""}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Object
            </div>
            <div>—</div>
            <div className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-storiq-purple" /> Ready
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Scene Upload */}
          <div className={`bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg`}>
            <h3 className="text-xl font-semibold flex items-center mb-4 text-white">
              <ImageIcon className="mr-2 text-storiq-purple" /> Background Scene
            </h3>
            <div
              className="border-2 border-dashed border-storiq-border rounded-xl p-8 text-center cursor-pointer hover:border-storiq-purple hover:bg-storiq-card-bg/80 transition"
              onClick={() => fileInputSceneRef.current?.click()}
              tabIndex={0}
              aria-label="Upload background scene"
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileInputSceneRef.current?.click(); }}
            >
              <Upload className="mx-auto h-12 w-12 mb-4 text-storiq-purple/40" />
              <p className="text-sm font-medium text-white">{sceneFile ? sceneFile.name : "Click to upload scene image"}</p>
              <p className="text-xs text-white/40">JPG, PNG up to 10MB</p>
              <input ref={fileInputSceneRef} type="file" accept="image/*" onChange={handleSceneUpload} className="hidden" />
            </div>
          </div>

          {/* Object Upload */}
          <div className={`bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 backdrop-blur-lg`}>
            <h3 className="text-xl font-semibold flex items-center mb-4 text-white">
              <ImageIcon className="mr-2 text-storiq-blue" /> Object
            </h3>
            <div
              className="border-2 border-dashed border-storiq-border rounded-xl p-8 text-center cursor-pointer hover:border-storiq-blue hover:bg-storiq-card-bg/80 transition"
              onClick={() => fileInputObjectRef.current?.click()}
              tabIndex={0}
              aria-label="Upload object image"
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileInputObjectRef.current?.click(); }}
            >
              <Upload className="mx-auto h-12 w-12 mb-4 text-storiq-blue/40" />
              <p className="text-sm font-medium text-white">{objectFile ? objectFile.name : "Click to upload object image"}</p>
              <p className="text-xs text-white/40">JPG, PNG up to 10MB</p>
              <input ref={fileInputObjectRef} type="file" accept="image/*" onChange={handleObjectUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* Canvas Section */}
        {sceneFile && (
          <div className="bg-storiq-card-bg/60 border border-storiq-border rounded-2xl shadow-lg p-6 mb-8 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Click to Place Object</h3>
              <Button
                onClick={resetAll}
                variant="outline"
                className="flex items-center gap-2 border-storiq-border text-white hover:bg-storiq-dark-lighter transition"
                aria-label="Reset"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>

            {!objectFile && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4 flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                <p className="text-yellow-200 text-sm">Please upload an object image before placing.</p>
              </div>
            )}

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`border-2 border-storiq-border rounded-lg shadow-sm max-w-full h-auto ${
                  sceneFile && objectFile ? "cursor-crosshair hover:border-storiq-purple" : "cursor-not-allowed"
                }`}
                style={{ maxHeight: "500px" }}
                tabIndex={0}
                aria-label="AI blending canvas"
              />
            </div>
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
            <div className="text-red-400 text-center font-medium">{error}</div>
            <Button
              onClick={resetAll}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 transition"
              aria-label="Retry"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader message="AI is blending your object…" size="small" overlay={false} />
            <p className="text-white/60 text-sm">Click on the canvas to place the object.</p>
          </div>
        )}

        {/* Download Button */}
        {sceneFile && objectFile && !loading && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={downloadCanvas}
              variant="gradient"
              className="px-6 py-2 text-white font-semibold rounded-xl shadow-lg"
              aria-label="Download blended image"
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIObjectBlendTool;
