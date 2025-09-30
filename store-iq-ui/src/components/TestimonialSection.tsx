import { Button } from "@/components/ui/button";

const TestimonialSection = () => {
  return (
    <section className="py-20 px-8">
      <div className="max-w-4xl mx-auto relative">
        <div className="text-sm tracking-widest uppercase text-white/60 absolute left-[-4rem] top-1/2 transform -translate-y-1/2 -rotate-90 hidden lg:block">
          Testimonials
        </div>

        <div className="flex items-center justify-between gap-4 md:gap-6">
          {/* Left Navigation Arrow */}
          <Button
            variant="gradient"
            size="icon"
            className="rounded-xl w-12 h-12 flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>

          {/* Card containing the image and text */}
          <div className="bg-storiq-card-bg/50 backdrop-blur-sm border border-storiq-border rounded-2xl p-8 md:p-12 w-full">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-8 md:gap-12">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src="/girl-stickerr.png" // Make sure this path is correct for your project
                  alt="Photo of Meera Rajput"
                  className="rounded-2xl object-cover w-36 h-56 md:w-48 md:h-72"
                />
              </div>

              {/* Testimonial Text */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Meera Rajput
                </h3>
                <blockquote className="text-lg text-white/80 max-w-md mx-auto md:mx-0">
                  "The AI tools are spot-on. From script generation to export,
                  every step feels effortless and saves me hours each week."
                </blockquote>
              </div>
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <Button
            variant="gradient"
            size="icon"
            className="rounded-xl w-12 h-12 flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;