import React, { useState } from 'react';

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('faculty');

  const teamMembers = {
    faculty: [
      {
        id: 1,
        name: 'Dr. B Sridharan',
        role: 'Assistant Professor',
        image: '/Team/Faculty/B_Sridhran.png',
        bio: 'Dr. B. Sridharan is working in computational and experimental hydraulics with a focus on free surface flow modeling. His research covers urban flooding, dam breaks, levee breaches, storm surges, and coastal and estuarine dynamics.',
        expertise: ['Hydrological Modeling', 'Climate Change Impacts', 'Urban Flooding'],
        email: 'jsmith@uroflab.edu',
        profileLink: 'https://sites.google.com/view/sridharan-b/home?authuser=0&amp;pli=1'
      }
    ],
    // scholars: [
    //   {
    //     id: 2,
    //     name: 'Dr. Michael Chen',
    //     role: 'Senior Scholar',
    //     image: '/Team/Scholars/img1.png',
    //     bio: 'Dr. Chen specializes in computational fluid dynamics and has developed several breakthrough algorithms for storm surge prediction. He joined the lab after completing his postdoctoral research at NOAA.',
    //     expertise: ['Computational Fluid Dynamics', 'Storm Surge Modeling', 'High Performance Computing'],
    //     email: 'mchen@uroflab.edu',
    //     profileLink: '/profiles/mchen'
    //   },
    //   {
    //     id: 3,
    //     name: 'Dr. Aisha Williams',
    //     role: 'Research Scholar',
    //     image: '/Team/Scholars/img2.png',
    //     bio: 'Dr. Williams focuses on the integration of remote sensing data with flood models. Her work has been instrumental in improving the accuracy of our coupled flood-surge models.',
    //     expertise: ['Remote Sensing', 'Data Assimilation', 'Model Validation'],
    //     email: 'awilliams@uroflab.edu',
    //     profileLink: '/profiles/awilliams'
    //   }
    // ],
    students: [
      {
        id: 4,
        name: 'Zakir',
        role: 'Btech (Civil Engineering)',
        image: '/Team/WebDevelopers/Zakir.jpg',
        bio: 'Help in creating URO_Flood_Lab Website',
        expertise: ['React.js', 'Node.js', 'JavaScript'],
        email: 'ajohnson@uroflab.edu',
        profileLink: 'https://sites.google.com/view/sridharan-b/home?authuser=0&amp;pli=1'
      },
      {
        id: 5,
        name: 'Sandeep Kumar',
        role: 'Btech (Electrical Engineering)',
        image: '/Team/WebDevelopers/Sandeep.jpg',
        bio: 'Help in creating URO_Flood_Lab Website',
        expertise: ['React.js', 'Node.js', 'JavaScript'],
        email: 'ppatel@uroflab.edu',
        profileLink: 'https://sites.google.com/view/sridharan-b/home?authuser=0&amp;pli=1'
      }
    ]
  };

  return (
    <div className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="heading-primary text-center">Our Team</h1>
        <p className="text-gray-600 text-center max-w-4xl mx-auto mb-12">
          The URO Flood Lab brings together experts from hydrology, oceanography, computer science, and environmental engineering to develop cutting-edge flood prediction and management solutions.
        </p>

        {/* Team navigation tabs */}
        <div className="flex flex-wrap justify-center mb-12 border-b">
          {Object.keys(teamMembers).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-6 py-3 text-lg font-medium transition-colors duration-200 
                ${activeTab === category 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-500'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                {teamMembers[category].length}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'faculty' && (
          <div className="mb-12">
            {/* Faculty member takes full width */}
            {teamMembers.faculty.map((member) => (
              <div key={member.id} className="col-span-1 md:col-span-3 lg:col-span-3 mb-8">
                <div className="card flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/api/placeholder/300/300';
                      }}
                      className="w-full h-64 object-cover object-center"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <h3 className="text-2xl font-bold text-blue-900">{member.name}</h3>
                    <p className="text-blue-600 text-lg mb-3">{member.role}</p>
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Areas of Expertise:</h4>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {member.expertise.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-4">
                      <a 
                        href={`mailto:${member.email}`} 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact
                      </a>
                      <a 
                        href={member.profileLink} 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab !== 'faculty' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Scholars and Web Developers take 1/3 width each */}
            {teamMembers[activeTab].map((member) => (
              <div key={member.id} className="col-span-1">
                <div className="card flex flex-col h-full">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/api/placeholder/300/300';
                      }}
                      className="w-full h-64 object-cover object-center"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-blue-900">{member.name}</h3>
                    <p className="text-blue-600 mb-3">{member.role}</p>
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Areas of Expertise:</h4>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {member.expertise.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-6 pt-0 mt-auto flex space-x-4">
                    <a 
                      href={`mailto:${member.email}`} 
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                    </a>
                    <a 
                      href={member.profileLink} 
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      Profile
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="heading-secondary text-center">Join Our Team</h2>
          <p className="text-gray-600 text-center mb-6">
            We're always looking for talented researchers and students passionate about flood dynamics and modeling.
          </p>
          <div className="flex justify-center">
            <a href="mailto:careers@uroflab.edu" className="btn-primary">
              View Open Positions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;