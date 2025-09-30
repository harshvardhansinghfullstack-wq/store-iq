const FeaturesSection = () => {
  const features = [
    {
      title: "Designed to Impress",
      description: "From concept to content — we've got your back.",
      icon: "✨"
    },
    {
      title: "Built for Creators",
      description: "Tools designed specifically for modern content creators.",
      icon: "🎨"
    },
    {
      title: "Always Improving",
      description: "Continuous updates and new features based on your feedback.",
      icon: "📈"
    },
    {
      title: "AI That Understands You",
      description: "Smart algorithms that learn your style and preferences.",
      icon: "🧠"
    },
    {
      title: "Your Data, Your Control",
      description: "Complete privacy and control over your creative content.",
      icon: "🔒"
    },
    {
      title: "Seamless Experience",
      description: "Intuitive interface that makes creation effortless.",
      icon: "⚡"
    }
  ];

  return (
    <section className="py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Features
        </h2>
        <p className="text-xl text-white/60 text-center mb-16">
          From concept to content — we've got your back.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-storiq-card-bg border border-storiq-border rounded-xl p-6 hover:bg-storiq-dark-lighter transition-colors cursor-pointer"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;