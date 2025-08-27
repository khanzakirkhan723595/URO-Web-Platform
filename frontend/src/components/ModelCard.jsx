// src/components/ModelCard.jsx
import { Link } from 'react-router-dom';

const ModelCard = ({ title, description, imageSrc, altText, linkTo }) => {
  return (
    <div className="card h-full">
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={imageSrc} 
          alt={altText}
          className="object-cover w-full h-64 object-top" 
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link 
          to={linkTo} 
          className="btn-primary inline-block"
        >
          Try Model
        </Link>
      </div>
    </div>
  );
};

export default ModelCard;
