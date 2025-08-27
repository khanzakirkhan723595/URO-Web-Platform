// src/pages/Home.jsx
import HeroSection from '../components/HeroSection';
import ModelCard from '../components/ModelCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div>
      <HeroSection />
      
      {/* Introduction Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-primary">Welcome to URO Flood Lab</h2>
              <p className="mb-4">
                URO Flood Lab (Urban River Ocean Flood Dynamics Laboratory) is dedicated to the development of advanced flood modeling systems for urban environments. Our research focuses on understanding and predicting flood events through sophisticated computational models.
              </p>
              <p className="mb-4">
                Floods have been one of the most dangerous and costliest natural phenomena throughout human history. They occur when water overflows from its usual boundaries, such as from a river, lake, or ocean, due to intense rainfall, extreme storm surges, or the combined effect of rainfall and storm surges.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-blue-800 font-semibold hover:text-blue-600 transition-colors"
              >
                Learn more about our lab
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/Home/UROlab.png"
                alt="URO Flood Lab Team"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="models" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="heading-primary text-center">Our Flood Models</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            We offer advanced flood modeling and simulation tools for researchers, engineers, and urban planners to predict and manage flood events.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ModelCard 
              title="Flood Model"
              description="High-resolution 2D flood modeling system for urban and rural watersheds."
              imageSrc="Home/IFS.png"
              altText="Flood model visualization"
              linkTo="/models/flood-model"
            />
            <ModelCard 
              title="Storm Surge Model"
              description="Powerful coastal inundation simulator for hurricane and storm events."
              imageSrc="Home/SSM.png"
              altText="Storm surge model visualization"
              linkTo="/models/storm-surge"
            />
            <ModelCard 
              title="Tightly Coupled Model"
              description="Combined inland-coastal solution for comprehensive flood analysis."
              imageSrc="Home/TCM.png"
              altText="Coupled model visualization"
              linkTo="/models/coupled-model"
            />
          </div>
        </div>
      </section>
      
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-primary">About URO Flood Lab</h2>
              <p className="mb-4">
                The Urban River Ocean (URO) Flood Dynamics Lab develops cutting-edge computational tools to predict, analyze, and mitigate flood events in complex urban and natural environments.
              </p>
              <p className="mb-4">
                Our interdisciplinary team combines expertise in hydraulic engineering, computational fluid dynamics, urban planning, and climate science to create accurate and accessible flood models.
              </p>
              <p>
                We collaborate with government agencies, engineering firms, and research institutions to improve flood resilience and adaptation strategies worldwide.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Research Highlights</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Development of novel coupling methods for inland-coastal flood models</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>High-performance computing approaches for real-time flood forecasting</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Integration of climate change projections in flood risk assessments</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Urban drainage network modeling with uncertainty quantification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
