import React from 'react';
import { Link } from 'react-router-dom';

const DevelopersPage = () => {
  const developers = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Lead Developer',
      image: 'WebDevlopers/img1.png',
      bio: 'Alex leads the web development team, focusing on creating accessible and intuitive interfaces for our flood models. He has extensive experience in React and spatial data visualization.',
      skills: ['React', 'Node.js', 'GIS', 'WebGL', 'D3.js'],
      github: 'https://github.com/alexjohnson'
    },
    {
      id: 2,
      name: 'Sophia Lee',
      role: 'Front-End Developer',
      image: 'WebDevlopers/img2.png',
      bio: 'Sophia specializes in creating responsive and interactive user interfaces. She has a background in UX design and brings a user-centered approach to our web applications.',
      skills: ['React', 'Tailwind CSS', 'JavaScript', 'UX/UI Design', 'Figma'],
      github: 'https://github.com/sophialee'
    }
  ];

  const technologies = [
    { name: 'React', description: 'Frontend framework for building interactive user interfaces' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
    { name: 'React Router', description: 'Navigation and routing for React applications' },
    { name: 'D3.js', description: 'Data visualization library for complex datasets' },
    { name: 'Mapbox GL', description: 'Interactive, customizable maps for geospatial data' },
    { name: 'Node.js', description: 'Backend runtime environment for our API services' },
    { name: 'Python', description: 'Backend processing for our flood models' },
    { name: 'Django', description: 'Web framework for our model API endpoints' },
    { name: 'Docker', description: 'Containerization for consistent deployment' },
    { name: 'AWS', description: 'Cloud infrastructure for hosting and computation' }
  ];

  return (
    <div className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="heading-primary text-center">Web Development Team</h1>
        <p className="text-gray-600 text-center max-w-4xl mx-auto mb-12">
          Our web development team creates intuitive interfaces to make complex flood models accessible to researchers, policymakers, and the public.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {developers.map((dev) => (
            <div key={dev.id} className="card flex flex-col md:flex-row overflow-hidden">
              <div className="md:w-1/3">
                <img 
                  src={dev.image} 
                  alt={dev.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/api/placeholder/300/300';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6">
                <h3 className="text-xl font-bold text-blue-900">{dev.name}</h3>
                <p className="text-blue-600 mb-3">{dev.role}</p>
                <p className="text-gray-600 mb-4">{dev.bio}</p>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {dev.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <a 
                  href={dev.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub Profile
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="heading-secondary text-center">Technologies Used</h2>
          <p className="text-gray-600 text-center mb-8">
            Our web applications are built using modern, robust technologies that enable us to create interactive, scalable, and accessible interfaces for our flood models.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies.map((tech, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-blue-800">{tech.name}</h3>
                <p className="text-gray-600 text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow-md p-8">
          <h2 className="heading-secondary text-center">Interested in Contributing?</h2>
          <p className="text-gray-600 text-center mb-6">
            We welcome contributions from developers interested in flood modeling and scientific web applications. Our codebase is open source and available on GitHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://github.com/uro-flood-lab" target="_blank" rel="noopener noreferrer" className="btn-primary">
              View Our GitHub
            </a>
            <Link to="/contact" className="btn-secondary">
              Contact the Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopersPage;