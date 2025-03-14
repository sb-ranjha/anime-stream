import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function CategoryPage() {
  const { category } = useParams();
  const { animes } = useAnime();
  
  // Format category name for display
  const formatCategoryName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Filter animes by category
  const categoryAnimes = animes.filter(anime => 
    anime.category.toLowerCase() === category?.toLowerCase()
  );

  return (
    <div className="pt-14 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-[#f47521]">{formatCategoryName(category || '')}</span>{' '}
            <span className="text-white">Anime</span>
          </h1>
          <div className="text-sm text-gray-400">
            {categoryAnimes.length} {categoryAnimes.length === 1 ? 'Anime' : 'Animes'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {categoryAnimes.map((anime) => (
            <Link 
              key={anime._id}
              to={`/anime/${anime._id}`}
              className="group relative"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl bg-gray-900">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-[#f47521]" />
                      <span className="text-gray-300">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[#f47521] text-sm">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categoryAnimes.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl text-gray-400 mb-4">No anime found in this category</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage; 