// src/components/HeroSection.jsx
import { useState, useEffect } from 'react';

const HeroSection = () => {
  // Slider for hero section
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      title: "URO Flood Lab",
      description: "Urban River Ocean Flood Dynamics Lab - Advanced flood simulation models for predicting and managing urban flooding events.",
      image: "Home/hero1.png",
    },
    {
      id: 2,
      title: "URO Flood Lab",
      description: "Urban River Ocean Flood Dynamics Lab - Advanced flood simulation models for predicting and managing urban flooding events.",
      image: "Home/hero2.png",
    },
    {
      id: 3,
      title: "URO Flood Lab",
      description: "Urban River Ocean Flood Dynamics Lab - Advanced flood simulation models for predicting and managing urban flooding events.",
      image: "Home/hero3.png",
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-slide
  useEffect(() => {
    const intervalId = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [currentSlide]);

  return (
    <div className="relative bg-blue-900 text-white overflow-hidden h-96 sm:h-[450px] md:h-[500px] lg:h-[550px]">
      {/* Slider implementation */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src={slide.image} 
              alt="Flood simulation background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-black/40"></div>
          </div>

          {/* Content - Maintaining the original layout */}
          <div className="relative max-w-7xl mx-auto py-12 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-6 text-xl max-w-3xl">
              {slide.description}
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:flex sm:max-w-none">
              <a
                href="#models"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
              >
                Explore Our Models
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Slider controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 focus:outline-none"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 focus:outline-none"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slider indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full focus:outline-none transition-colors duration-300 ${
              index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
