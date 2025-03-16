import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function TeluguDubbed() {
  const { animes } = useAnime();
  const teluguDubbedAnimes = animes.filter(anime => anime.isTeluguDub);

  return (
    <div className="pt-14 bg-[#141821]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-[#f47521]">Telugu</span>
            <span className="text-white"> Dubbed</span>
          </h1>
          <div className="text-sm text-white/70">
            {teluguDubbedAnimes.length} {teluguDubbedAnimes.length === 1 ? 'Anime' : 'Animes'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {teluguDubbedAnimes.map((anime) => (
            <Link 
              key={anime._id}
              to={`/anime/${anime._id}`}
              className="group relative"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1f2c] group">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                  Telugu
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-sm md:text-lg font-semibold text-white line-clamp-2 mb-1 md:mb-2">{anime.title}</h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-white">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 md:h-4 md:w-4 text-[#f47521]" />
                      <span className="text-white">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[#f47521]">•</span>
                    <span className="text-white">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {teluguDubbedAnimes.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl text-white/70 mb-4">No Telugu dubbed anime available yet</h3>
            <p className="text-white/50">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeluguDubbed; 