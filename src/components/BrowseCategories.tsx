import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Action', color: 'from-red-800 to-red-600' },
  { name: 'Romance', color: 'from-purple-800 to-purple-600' },
  { name: 'Comedy', color: 'from-yellow-800 to-green-600' },
  { name: 'Drama', color: 'from-blue-800 to-blue-600' },
  { name: 'Fantasy', color: 'from-purple-800 to-purple-600' },
  { name: 'Horror', color: 'from-red-900 to-red-800' },
  { name: 'Mystery', color: 'from-blue-900 to-blue-700' },
  { name: 'Sci-Fi', color: 'from-teal-800 to-teal-600' }
];

function BrowseCategories() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 bg-black">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <span className="text-[#f47521]">Browse</span>
          <span className="text-white">Categories</span>
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/category/${category.name.toLowerCase()}`}
            className="group relative overflow-hidden rounded-lg aspect-[4/3] md:aspect-[3/2]"
          >
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`}
            />
            <div className="relative h-full flex items-center justify-center p-2 md:p-3">
              <span className="text-sm md:text-base font-semibold text-white text-center">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BrowseCategories; 