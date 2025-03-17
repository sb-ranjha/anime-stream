import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { Search } from 'lucide-react';

function CategoryPage() {
  const { category } = useParams();
  const { animes } = useAnime();
  const categoryAnimes = animes.filter(anime => 
    anime.category.toLowerCase() === category?.toLowerCase()
  );
  
  const formatCategoryName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (categoryAnimes.length === 0) {
  return (
      <div className="min-h-screen bg-[#141821] pt-16 px-4">
        <div className="max-w-4xl mx-auto py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            {formatCategoryName(category || '')} Anime
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-12 text-center">
            Explore our collection of {category?.toLowerCase()} anime series and movies
          </p>

          {/* No Content Animation */}
          <div className="relative max-w-md mx-auto text-center">
            {/* Animated Character */}
            <div className="mb-8 relative">
              <div className="text-8xl md:text-9xl animate-bounce-slow text-center">
                (｡•́︿•̀｡)
              </div>
              
              {/* Animated Speech Bubble */}
              <div className="relative mt-6 bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white/5 border-l border-t border-white/10"></div>
                <p className="text-white/90 text-lg md:text-xl font-medium mb-2">Oops! No Anime Here Yet!</p>
                <p className="text-gray-400 text-sm md:text-base">
                  Looks like this category is feeling a bit lonely...
                </p>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-0 left-0 -translate-x-1/2 text-[#f47521]/30 text-xl md:text-2xl animate-float-slow">
                ★
              </div>
              <div className="absolute top-1/4 right-0 translate-x-1/2 text-[#f47521]/20 text-2xl md:text-3xl animate-float">
                ♪
              </div>
              <div className="absolute bottom-0 left-1/4 text-[#f47521]/25 text-xl md:text-2xl animate-float-delay">
                ✦
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-6 animate-fade-in-delay">
              <div className="text-center">
                <p className="text-gray-300 text-sm md:text-base mb-4">
                  But don't worry! While you wait for new content, you can:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    to="/"
                    className="w-full sm:w-auto px-6 py-3 bg-[#f47521]/10 text-[#f47521] rounded-xl hover:bg-[#f47521]/20 transition-all transform hover:scale-105 text-sm md:text-base"
                  >
                    Explore Other Categories
                  </Link>
                  <Link 
                    to="/search"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all transform hover:scale-105 gap-2 text-sm md:text-base"
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                    Search Anime
                  </Link>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="mt-6">
                  <p className="text-[#f47521] font-medium text-sm md:text-base">
                    Coming Soon!
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm mt-2">
                    We're working hard to bring you amazing {category?.toLowerCase()} anime content.
                    Check back later!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Animations */}
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) translateX(50%); }
              50% { transform: translateY(-10px) translateX(50%); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0) translateX(-50%); }
              50% { transform: translateY(-15px) translateX(-50%); }
            }
            @keyframes float-delay {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes fade-in-delay {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            .animate-float-slow {
              animation: float-slow 4s ease-in-out infinite;
            }
            .animate-float-delay {
              animation: float-delay 3.5s ease-in-out infinite;
            }
            .animate-bounce-slow {
              animation: bounce-slow 2s ease-in-out infinite;
            }
            .animate-fade-in-delay {
              animation: fade-in-delay 0.6s ease-out 0.3s forwards;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141821] pt-16 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {formatCategoryName(category || '')} Anime
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-8">
          Explore our collection of {category?.toLowerCase()} anime series and movies
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {categoryAnimes.map((anime) => (
            <Link 
              key={anime._id}
              to={`/anime/${anime._id}`}
              className="group relative overflow-hidden rounded-xl aspect-[2/3] bg-[#1a1b1f] hover:scale-105 transition-transform duration-300"
            >
                <img
                  src={anime.image}
                  alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2">
                  {anime.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-[#f47521]">★ {anime.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">
                    {anime.seasons.length} Season{anime.seasons.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage; 