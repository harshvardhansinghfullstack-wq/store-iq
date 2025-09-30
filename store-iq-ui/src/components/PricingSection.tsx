import { Button } from "@/components/ui/button";

const PricingSection = () => {
  const plans = [
    {
      name: "STARTER",
      description: "Perfect for trying STORIQ",
      price: "$9",
      period: "/month",
      features: [
        "3 AI edits / month",
        "Basic templates",
        "Standard export quality",
        "Get Started"
      ],
      buttonText: "$9 / month",
      popular: false
    },
    {
      name: "PRO", 
      description: "Complete with new ways power",
      price: "$29",
      period: "/month",
      features: [
        "Unlimited AI edits",
        "Premium templates & styles",
        "4K exports",
        "Priority support",
        "($5 Pro)"
      ],
      buttonText: "$29 / month",
      popular: true
    },
    {
      name: "STUDIO",
      description: "For agencies & content creators",
      price: "$99",
      period: "/month", 
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Brand kit & custom fonts",
        "Dedicated success manager",
        "(Contact Us)"
      ],
      buttonText: "$99 / month",
      popular: false
    }
  ];

  return (
    <section className="py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Pricing
        </h2>
        <p className="text-xl text-white/60 text-center mb-16">
          Flexible plans that grow with your content.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-storiq-card-bg border rounded-2xl p-8 relative ${
                plan.popular 
                  ? 'border-storiq-purple shadow-2xl shadow-storiq-purple/20 scale-105' 
                  : 'border-storiq-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-storiq-purple to-storiq-blue text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-white/60 mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/60">
                    {plan.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-white/80">
                      <span className="text-storiq-purple mr-3">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.popular ? "gradient" : "storiq"} 
                  className="w-full py-3 rounded-xl"
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;