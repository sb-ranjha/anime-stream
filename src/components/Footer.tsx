import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#141821] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/" onClick={handleHomeClick} className="hover:text-[#f47521] transition-colors">Home</Link></li>
              <li><Link to="/category/season-trending" className="hover:text-[#f47521] transition-colors">Season Trending</Link></li>
              <li><Link to="/category/hindi-dub" className="hover:text-[#f47521] transition-colors">Hindi Dub</Link></li>
              <li><Link to="/category/telugu-dub" className="hover:text-[#f47521] transition-colors">Telugu Dub</Link></li>
              <li><Link to="/movies" className="hover:text-[#f47521] transition-colors">Movies</Link></li>
              <li><Link to="/new-episodes" className="hover:text-[#f47521] transition-colors">New Episodes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/terms" className="hover:text-[#f47521] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#f47521] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/dmca" className="hover:text-[#f47521] transition-colors">DMCA</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">About</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-[#f47521] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#f47521] transition-colors">Contact</Link></li>
              <li><Link to="/help" className="hover:text-[#f47521] transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Anime Streaming. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;