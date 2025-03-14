import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'action',
    name: 'Action',
    description: 'Explore action anime',
    gradient: 'from-red-500 to-orange-500'
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Explore romance anime',
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Explore comedy anime',
    gradient: 'from-yellow-500 to-green-500'
  },
  {
    id: 'drama',
    name: 'Drama',
    description: 'Explore drama anime',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Explore fantasy anime',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Explore horror anime',
    gradient: 'from-gray-800 to-red-800'
  },
  {
    id: 'mystery',
    name: 'Mystery',
    description: 'Explore mystery anime',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    description: 'Explore sci-fi anime',
    gradient: 'from-cyan-500 to-blue-500'
  }
];

function BrowseCategories() {
  return (
    <section className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">
          <span className="text-[#f47521]">Browse</span>{' '}
          <span className="text-white">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className={`aspect-[4/3] p-6 flex flex-col justify-between relative bg-gradient-to-br ${category.gradient}`}>
                <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white" />
                <h3 className="text-2xl font-bold text-white relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-100 relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrowseCategories; 