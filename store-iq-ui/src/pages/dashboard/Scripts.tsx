// import DashboardLayout from "@/components/DashboardLayout";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Slider } from "@/components/ui/slider";

// import React, { useState, useRef } from "react";
// import { useLoader } from "@/context/LoaderContext";
// const Scripts = () => {
//   const scriptStyles = [
//     "General", "Fun facts", "News", "Educational", "How to", "Listicle",
//     "Motivational", "Personal", "Horror", "Life Hack", "Fantasy", "Business"
//   ];

//   const additionalStyles = ["Philosophy"];

//   // State for selected style, user input, error, and result
//   const [selectedStyle, setSelectedStyle] = useState<string>("General");
//   const [userInput, setUserInput] = useState<string>("");
//   const [error, setError] = useState<string | null>(null);
//   const [result, setResult] = useState<string | null>(null);

//   const { showLoader, hideLoader } = useLoader();

//   // State for target duration (seconds)
//   const [targetDuration, setTargetDuration] = useState<number>(22);

//   // For animated loader message
//   const loaderIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const baseLoaderMsg = "Please wait, your script is loading. This may take a few minutes";
//   const [loaderDots, setLoaderDots] = useState<string>("");

//   // Handle script generation
//   const handleGenerate = async () => {
//     let dotCount = 0;
//     setError(null);
//     setResult(null);

//     // Start animated loader message
//     showLoader(`${baseLoaderMsg}...`);
//     setLoaderDots("");
//     loaderIntervalRef.current = setInterval(() => {
//       dotCount = (dotCount + 1) % 4;
//       const dots = ".".repeat(dotCount + 1);
//       showLoader(`${baseLoaderMsg}${dots}`);
//       setLoaderDots(dots);
//     }, 1000);

//     try {
//       const prompt = `Style: ${selectedStyle}. Target duration: ${targetDuration} seconds. ${userInput}`;
//       const response = await fetch("/api/generate-script", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt }),
//       });
//       if (!response.ok) {
//         throw new Error("Failed to generate script.");
//       }
//       const data = await response.json();
//       setResult(data?.script || "No script returned.");
//     } catch (err) {
//       const message =
//         err && typeof err === "object" && "message" in err
//           ? (err as { message?: string }).message
//           : "An error occurred.";
//       setError(message || "An error occurred.");
//     } finally {
//       if (loaderIntervalRef.current) {
//         clearInterval(loaderIntervalRef.current);
//         loaderIntervalRef.current = null;
//       }
//       hideLoader();
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="p-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-white mb-2">Generate Video Scripts</h1>
//           <p className="text-white/60">Tell us about what you want to talk about and we will generate video scripts for you</p>
//         </div>

//         <div className="max-w-4xl">
//           {/* Script Style Selection */}
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-white mb-4">Pick up your script style</h2>
//             <div className="flex flex-wrap gap-3 mb-4">
//               {scriptStyles.map((style) => (
//                 <button
//                   key={style}
//                   type="button"
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     selectedStyle === style
//                       ? "bg-storiq-purple text-white"
//                       : "bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20"
//                   }`}
//                   onClick={() => setSelectedStyle(style)}
//                 >
//                   {style}
//                 </button>
//               ))}
//             </div>
//             <div className="flex flex-wrap gap-3">
//               {additionalStyles.map((style) => (
//                 <button
//                   key={style}
//                   type="button"
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     selectedStyle === style
//                       ? "bg-storiq-purple text-white"
//                       : "bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20"
//                   }`}
//                   onClick={() => setSelectedStyle(style)}
//                 >
//                   {style}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Tell us more */}
//           <div className="mb-8">
//             <h3 className="text-xl font-bold text-white mb-4">Tell us a bit more</h3>
//             <Textarea
//               placeholder="Type Here"
//               className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[200px] resize-none"
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//             />
//           </div>

//           {/* Media Content Upload */}
//           <div className="mb-8">
//             <h3 className="text-xl font-bold text-white mb-4">Add media content</h3>
//             <div className="bg-storiq-card-bg border-2 border-dashed border-storiq-border rounded-2xl p-12 text-center">
//               <div className="text-6xl mb-4">☁️</div>
//               <p className="text-white/60 mb-2">Click to upload or</p>
//               <p className="text-white/60">drag and drop</p>
//             </div>
//           </div>

//           {/* Target Duration */}
//           <div className="mb-8">
//             <h3 className="text-xl font-bold text-white mb-4">Target Duration</h3>
//             <p className="text-white/60 mb-4">Estimation of your video length: 22s (~51 Words)</p>
//             <div className="relative">
//               <Slider
//                 value={[targetDuration]}
//                 onValueChange={([val]) => setTargetDuration(val)}
//                 min={5}
//                 max={60}
//                 step={1}
//                 className="w-full"
//               />
//               <div className="absolute -top-8 right-0 bg-storiq-purple text-white px-3 py-1 rounded text-sm">
//                 {targetDuration} s
//               </div>
//             </div>
//           </div>

//           {/* Generate Button */}
//           <Button
//             className="bg-storiq-purple hover:bg-storiq-purple-light text-white px-8 py-3 rounded-xl"
//             onClick={handleGenerate}
//             disabled={!userInput.trim()}
//           >
//             Generate Video Scripts
//           </Button>

//           {/* Error Message */}
//           {error && (
//             <div className="mt-4 text-red-500 font-medium">{error}</div>
//           )}

//           {/* Generated Script */}
//           {result && (
//             <div className="mt-8 bg-storiq-card-bg border border-storiq-border rounded-lg p-6 text-white whitespace-pre-line">
//               <h4 className="font-bold mb-2">Generated Script:</h4>
//               {result}
//             </div>
//           )}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Scripts;