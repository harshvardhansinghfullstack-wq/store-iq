import { Button } from "@/components/ui/button";
import creativeContentVideo from "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/videos/creative-content.mp4";
import aiGeneratedVideo from "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/videos/ai-generated.mp4";
import videoContentVideo from "https://store-iq-bucket.s3.ap-south-1.amazonaws.com/dashboard-images-static/videos/video-content.mp4";
// You can also import the sticker if you prefer that method
// import girlSticker from "/girl-sticker.png";

const VideoCard = ({ src }) => {
  return (
    <div className="relative aspect-[9/16] rounded-lg overflow-hidden group">
      {/* Video */}
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* Striped Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            rgba(0,0,0,0.9) 0px,
            rgba(0,0,0,0.9) 2px,
            transparent 2px,
            transparent 6px
          )`,
        }}
      ></div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 relative bg-black text-white">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Hero Videos Grid */}
      <div className="grid grid-cols-3 gap-2 mb-12 max-w-4xl w-full">
        <VideoCard src={creativeContentVideo} />
        <VideoCard src={aiGeneratedVideo} />
        <VideoCard src={videoContentVideo} />
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 max-w-4xl leading-tight">
        The AI workspace for next-gen creators
      </h1>

      {/* Subheading */}
      <p className="text-base md:text-xl text-white/80 mb-8 max-w-2xl">
        STORIQ helps modern creators streamline content creation, planning, and
        publishing like never before.
      </p>

      {/* CTA Button */}
      <Button
        variant="gradient"
        size="lg"
        className="text-lg px-12 py-3 rounded-full font-bold"
      >
        Explore
      </Button>

      {/* Girl Sticker
      <div className="absolute bottom-0 right-0 w-48 h-48 md:w-56 md:h-56">
        <img
          // The 'src' is now correctly pointing to the image in your public folder
          // src="/image.png"
          alt="Meera Rajput"
          className="w-full h-full object-contain"
        />
      </div> */}
    </section>
  );
};

export default HeroSection;
