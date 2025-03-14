import React from 'react';
import { useAnime } from '../context/AnimeContext';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function HindiDubbed() {
  const { animes } = useAnime();
  const hindiDubbedAnimes = animes.filter(anime => anime.isHindiDub);

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-[#f47521]">Hindi</span> Dubbed Anime
          </h1>
          <div className="text-gray-400">
            {hindiDubbedAnimes.length} Series Available
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {hindiDubbedAnimes.map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">Hindi</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-300">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-300 text-sm">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hindiDubbedAnimes.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl text-gray-400 mb-4">No Hindi dubbed anime available yet</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HindiDubbed; 