const StepsSection = () => {
  const steps = [
    {
      number: "01",
      title: "Upload or Import",
      description: "Bring in your files, images, or text via URL — or AI gets to work instantly.",
    },
    {
      number: "02", 
      title: "Auto-Magic Editing",
      description: "AI finds the perfect cuts, adds captions, and matches your style — no timeline needed.",
    },
    {
      number: "03",
      title: "Export & Share",
      description: "Download in high quality or post directly to your favorite platforms in one click.",
    }
  ];

  return (
    <section className="py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Steps to Edit
        </h2>
        <p className="text-xl text-white/60 text-center mb-16">
          Edit like a pro, without touching a timeline.
        </p>
        
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-8 flex items-start space-x-6"
            >
              <div className="bg-white text-black rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-xl flex-shrink-0">
                {step.number}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/70 text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;