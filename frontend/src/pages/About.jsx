// src/pages/About.jsx
import { Layers, Database, Activity, Award } from 'lucide-react';

const About = () => {
  return (
    <div>
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-blue-800 mb-4 text-center">About URO Flood Lab</h1>
          <div className="w-24 h-1 bg-blue-800 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center">
            The Urban River Ocean Flood Dynamics Laboratory (URO Flood Lab) specializes in developing 
            integrated modeling systems to understand, predict, and mitigate flood risks in urban and coastal environments.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                URO Flood Lab is dedicated to advancing the science of flood prediction through innovative 
                modeling approaches that integrate river, urban, and oceanic systems. We aim to provide 
                practical solutions for flood risk management and enhance community resilience against flood hazards.
              </p>
              <p className="text-gray-700">
                Through cutting-edge research and development, we strive to create tools that help communities 
                predict, prepare for, and respond to flooding events, ultimately saving lives and reducing property damage.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Research Focus</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-800 mr-3 mt-1"><Layers size={20} /></span>
                  <span className="text-gray-700">Development of inland flood simulation models for urban environments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 mr-3 mt-1"><Database size={20} /></span>
                  <span className="text-gray-700">Storm surge modeling for coastal flood prediction</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 mr-3 mt-1"><Activity size={20} /></span>
                  <span className="text-gray-700">Compound flooding analysis through tightly coupled river-ocean models</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 mr-3 mt-1"><Award size={20} /></span>
                  <span className="text-gray-700">Real-time flood forecasting and early warning systems</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-12 mb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Our History</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-700 mb-4">
              The URO Flood Lab was established at the Department of Civil Engineering, IIT Palakkad, 
              with a vision to address the growing challenges of urban and coastal flooding in India and worldwide.
            </p>
            <p className="text-gray-700 mb-4">
              Building on years of research in flood modeling and hazard assessment, our team has developed 
              the Integrated River & Ocean Modelling System (earlier known as IROMS), which has been successfully 
              applied to analyze major flooding events in cities like Chennai, Kerala's Kuttanad region, and other 
              coastal urban areas.
            </p>
            <p className="text-gray-700">
              Our laboratory continues to evolve its modeling capabilities, incorporating the latest advancements 
              in computational methods, data acquisition, and climate science to improve the accuracy and reliability 
              of flood predictions.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">Flooding Types We Study</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-blue-800 flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Inland Flooding</h3>
              <p className="text-gray-700">
                Our models analyze complex urban drainage systems and infrastructure to predict flooding from intense rainfall in urban and rural watersheds.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-blue-800 flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Coastal Flooding</h3>
              <p className="text-gray-700">
                We develop advanced models to simulate storm surges and coastal flooding from cyclones and extreme weather events.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-blue-800 flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">Compound Flooding</h3>
              <p className="text-gray-700">
                Our integrated models capture the complex interactions between riverine flows and storm surges in coastal regions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">Research Highlights</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <ul className="space-y-4">
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
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Flood models validation through extensive field measurements and case studies</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">Publications</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-blue-800 mb-4">Selected Journal Papers</h3>
            <ul className="space-y-3 text-gray-700">
              <li>Sridharan, B., Chaitanya, R. K., Sudheer, K. P., & Kuiry, S. N. (2022). Improved accuracy of storm surge simulations by incorporating changing along‐track parameters. International Journal of Climatology.</li>
              <li>Sridharan, B., Bates, P. D., Sen, D., & Kuiry, S. N. (2021). Local-inertial shallow water model on unstructured triangular grids. Advances in Water Resources, 152, 103930.</li>
              <li>Sridharan, B., Gurivindapalli, D., Kuiry, S. N., Mali, V. K., Nithila Devi, N., Bates, P. D., & Sen, D. (2020). Explicit expression of weighting factor for improved estimation of numerical flux in Local Inertial models. Water Resources Research, 56(7).</li>
              <li>Devi, N. N., Sridharan, B., & Kuiry, S. N. (2019). Impact of urban sprawl on future flooding in Chennai city, India. Journal of Hydrology, 574, 486-496.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;