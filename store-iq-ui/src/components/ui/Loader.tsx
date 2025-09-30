import React from "react";

const Loader: React.FC<{
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "dots" | "pulse" | "orbital" | "wave" | "ripple";
  overlay?: boolean;
  className?: string;
}> = ({ 
  message = "Loading...", 
  size = "medium",
  variant = "spinner",
  overlay = true,
  className = ""
}) => {
  // Size configurations
  const sizeConfig = {
    small: { 
      container: 32, 
      fontSize: "0.875rem",
      dotSize: 6,
      spacing: 8
    },
    medium: { 
      container: 64, 
      fontSize: "1rem",
      dotSize: 8,
      spacing: 12
    },
    large: { 
      container: 96, 
      fontSize: "1.125rem",
      dotSize: 10,
      spacing: 16
    }
  };

  const config = sizeConfig[size];

  // Base container style
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: config.spacing,
  };

  // Overlay style
  const overlayStyle: React.CSSProperties = overlay ? {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  } : {};

  // Spinner variant
  const SpinnerLoader = () => (
    <div className="relative" style={{ width: config.container, height: config.container }}>
      <div className="absolute inset-0 border-4 border-slate-600/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-storiq-purple border-r-storiq-purple animate-spin"></div>
      <div className="absolute inset-2 border-4 border-transparent rounded-full border-b-storiq-purple/60 border-l-storiq-purple/60 animate-spin-reverse"></div>
    </div>
  );

  // Dots variant
  const DotsLoader = () => (
    <div className="flex gap-2" style={{ height: config.container / 3 }}>
      {[0, 0.2, 0.4].map((delay) => (
        <div
          key={delay}
          className="bg-gradient-to-r from-storiq-purple to-purple-500 rounded-full animate-bounce"
          style={{
            width: config.dotSize,
            height: config.dotSize,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );

  // Pulse variant
  const PulseLoader = () => (
    <div className="relative">
      <div 
        className="bg-gradient-to-r from-storiq-purple to-purple-500 rounded-full animate-ping"
        style={{ width: config.container, height: config.container }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-r from-storiq-purple to-purple-500 rounded-full"
        style={{ width: config.container, height: config.container }}
      />
    </div>
  );

  // Orbital variant (3D like)
  const OrbitalLoader = () => (
    <div className="relative" style={{ width: config.container, height: config.container }}>
      <div className="absolute inset-0 animate-orbit-slow">
        <div 
          className="bg-gradient-to-r from-storiq-purple to-blue-500 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"
          style={{ width: config.dotSize * 1.5, height: config.dotSize * 1.5 }}
        />
      </div>
      <div className="absolute inset-0 animate-orbit-medium">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full absolute top-1/2 -right-1 transform -translate-y-1/2"
          style={{ width: config.dotSize, height: config.dotSize }}
        />
      </div>
      <div className="absolute inset-0 animate-orbit-fast">
        <div 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"
          style={{ width: config.dotSize * 0.8, height: config.dotSize * 0.8 }}
        />
      </div>
      <div className="absolute inset-2 border-2 border-slate-500/30 rounded-full"></div>
    </div>
  );

  // Wave variant
  const WaveLoader = () => (
    <div className="flex items-end gap-1" style={{ height: config.container / 2 }}>
      {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
        <div
          key={delay}
          className="bg-gradient-to-t from-storiq-purple to-purple-400 rounded-t-full animate-wave"
          style={{
            width: config.dotSize,
            height: config.container / 2,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );

  // Ripple variant
  const RippleLoader = () => (
    <div className="relative" style={{ width: config.container, height: config.container }}>
      <div className="absolute inset-0 border-2 border-storiq-purple rounded-full animate-ripple-1"></div>
      <div className="absolute inset-3 border-2 border-purple-400 rounded-full animate-ripple-2"></div>
      <div className="absolute inset-6 border-2 border-pink-400 rounded-full animate-ripple-3"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="bg-gradient-to-r from-storiq-purple to-purple-500 rounded-full"
          style={{ width: config.dotSize, height: config.dotSize }}
        />
      </div>
    </div>
  );

  // Render appropriate loader variant
  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      case "orbital":
        return <OrbitalLoader />;
      case "wave":
        return <WaveLoader />;
      case "ripple":
        return <RippleLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div style={containerStyle} className={className}>
      {renderLoader()}
      {message && (
        <span 
          className="text-slate-300 font-medium text-center tracking-wide"
          style={{ fontSize: config.fontSize }}
        >
          {message}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div style={overlayStyle}>
        {content}
        <style jsx>{`
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          
          @keyframes orbit-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes orbit-medium {
            from { transform: rotate(120deg); }
            to { transform: rotate(480deg); }
          }
          
          @keyframes orbit-fast {
            from { transform: rotate(240deg); }
            to { transform: rotate(600deg); }
          }
          
          @keyframes wave {
            0%, 60%, 100% { transform: scaleY(0.4); }
            30% { transform: scaleY(1); }
          }
          
          @keyframes ripple-1 {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          
          @keyframes ripple-2 {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.67); opacity: 0; }
          }
          
          @keyframes ripple-3 {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.33); opacity: 0; }
          }
          
          .animate-spin-reverse {
            animation: spin-reverse 1.5s linear infinite;
          }
          
          .animate-orbit-slow {
            animation: orbit-slow 3s linear infinite;
          }
          
          .animate-orbit-medium {
            animation: orbit-medium 2s linear infinite;
          }
          
          .animate-orbit-fast {
            animation: orbit-fast 1s linear infinite;
          }
          
          .animate-wave {
            animation: wave 1.5s ease-in-out infinite;
          }
          
          .animate-ripple-1 {
            animation: ripple-1 2s ease-out infinite;
          }
          
          .animate-ripple-2 {
            animation: ripple-2 2s ease-out 0.3s infinite;
          }
          
          .animate-ripple-3 {
            animation: ripple-3 2s ease-out 0.6s infinite;
          }
        `}</style>
      </div>
    );
  }

  return content;
};

export default Loader;