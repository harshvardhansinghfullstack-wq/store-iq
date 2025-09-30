import React, { useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Upload,
  ImageIcon,
  Loader2,
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
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Object Blending Tool
          </h1>
          <p className="text-gray-600 mt-2">
            Upload a scene and object → click to place the object → download your result.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 text-gray-600">
            <div className={`flex items-center ${sceneFile ? "text-green-600" : ""}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Scene
            </div>
            <div>—</div>
            <div className={`flex items-center ${objectFile ? "text-green-600" : ""}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Object
            </div>
            <div>—</div>
            <div className={`flex items-center`}>
              <Sparkles className="mr-2 h-5 w-5" /> Ready
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Scene Upload */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 border ${sceneFile ? "border-green-400" : "border-gray-100"}`}>
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <ImageIcon className="mr-2 text-purple-600" /> Background Scene
            </h3>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
              onClick={() => fileInputSceneRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-sm font-medium">{sceneFile ? sceneFile.name : "Click to upload scene image"}</p>
              <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
              <input ref={fileInputSceneRef} type="file" accept="image/*" onChange={handleSceneUpload} className="hidden" />
            </div>
          </div>

          {/* Object Upload */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 border ${objectFile ? "border-green-400" : "border-gray-100"}`}>
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <ImageIcon className="mr-2 text-blue-600" /> Object
            </h3>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              onClick={() => fileInputObjectRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-sm font-medium">{objectFile ? objectFile.name : "Click to upload object image"}</p>
              <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
              <input ref={fileInputObjectRef} type="file" accept="image/*" onChange={handleObjectUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* Canvas Section */}
        {sceneFile && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Click to Place Object</h3>
              <button onClick={resetAll} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900">
                <RefreshCw className="h-4 w-4 mr-2" /> Reset
              </button>
            </div>

            {!objectFile && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                <p className="text-amber-800 text-sm">Please upload an object image before placing.</p>
              </div>
            )}

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`border-2 border-gray-200 rounded-lg shadow-sm max-w-full h-auto ${
                  sceneFile && objectFile ? "cursor-crosshair hover:border-purple-400" : "cursor-not-allowed"
                }`}
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-red-700 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">AI is blending your object…</h3>
            <p className="text-gray-600 text-sm">Click on the canvas to place the object.</p>
          </div>
        )}

        {/* Download Button */}
        {sceneFile && objectFile && !loading && (
          <div className="flex justify-center gap-4">
            <button
              onClick={downloadCanvas}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-blue-700"
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIObjectBlendTool;
