import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function NotFound() {
  const { animes } = useAnime();
  const randomAnime = animes.sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#141821] pt-14 md:pt-16">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="relative text-center mb-12 md:mb-16">
          {/* 404 Logo Animation */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto mb-8 group">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[#f47521]/30 animate-spin-slow"></div>
            
            {/* Middle Ring with Gradient */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-[#f47521] to-[#ff8a3d] opacity-20 animate-pulse"></div>
            
            {/* Inner Circle */}
            <div className="absolute inset-8 rounded-full bg-[#1a1b1f] flex items-center justify-center">
              {/* 404 Text */}
              <div className="text-[#f47521] text-6xl md:text-7xl font-bold font-mono transform hover:scale-110 transition-transform duration-300">
                404
              </div>
            </div>

            {/* Decorative Kanji Characters */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#f47521]/40 text-xl animate-bounce-slow">
              アニメ
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[#f47521]/40 text-xl animate-bounce-slow delay-150">
              空間
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
            Lost in Anime Space?
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto animate-fade-in-delay">
            Oops! The page you're looking for seems to have disappeared into another dimension. 
            Don't worry though, we've got your back!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <Link 
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#f47521] text-white font-medium rounded-xl hover:bg-[#ff8a3d] transition-all transform hover:scale-105 hover:-rotate-2 gap-2 shadow-lg shadow-[#f47521]/20 group"
            >
              <Home className="w-5 h-5 group-hover:animate-bounce" />
              Return to Homepage
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all transform hover:scale-105 hover:rotate-2 gap-2 border border-white/10 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:animate-slide-left" />
              Go Back
            </button>
          </div>
        </div>

        {/* Recommendations Section */}
        {randomAnime.length > 0 && (
          <div className="mt-16 pt-16 border-t border-white/5 animate-fade-in-delay-3">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              While you're here, check these out!
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {randomAnime.map((anime) => (
                <Link
                  key={anime._id}
                  to={`/anime/${anime._id}`}
                  className="group relative overflow-hidden rounded-xl aspect-[2/3] bg-[#1a1b1f]"
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-medium text-lg mb-1 line-clamp-1">{anime.title}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2">{anime.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Suggestion */}
        <div className="mt-12 text-center animate-fade-in-delay-3">
          <Link 
            to="/search"
            className="inline-flex items-center justify-center px-6 py-3 text-[#f47521] hover:text-[#ff8a3d] transition-colors gap-2 group"
          >
            <Search className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
            <span>Or try searching for something specific</span>
          </Link>
        </div>
      </div>

      {/* Custom Animations */}
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) translateX(-50%); }
            50% { transform: translateY(-10px) translateX(-50%); }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-left {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-5px); }
          }
          .animate-spin-slow {
            animation: spin-slow 15s linear infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          .animate-fade-in-delay {
            opacity: 0;
            animation: fade-in 0.6s ease-out 0.3s forwards;
          }
          .animate-fade-in-delay-2 {
            opacity: 0;
            animation: fade-in 0.6s ease-out 0.6s forwards;
          }
          .animate-fade-in-delay-3 {
            opacity: 0;
            animation: fade-in 0.6s ease-out 0.9s forwards;
          }
          .group-hover:animate-slide-left {
            animation: slide-left 1s ease-in-out infinite;
          }
          .delay-150 {
            animation-delay: 150ms;
          }
        `}
      </style>
    </div>
  );
}

export default NotFound; 