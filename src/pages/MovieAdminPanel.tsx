import React, { useState } from 'react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Film, Edit2, Trash2, X, Save, ArrowLeft, Search } from 'lucide-react';

interface MovieFormData {
  title: string;
  description: string;
  releaseDate: string;
  duration: string;
  genre: string[];
  thumbnail: string;
  streamHG?: string;
  doodstream?: string;
  megacloud?: string;
  streamtape?: string;
}

interface Movie extends MovieFormData {
  _id: string;
  isNew?: boolean;
}

const MovieAdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { movies, loading, addMovie, updateMovie, deleteMovie } = useMovies();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialFormData: MovieFormData = {
    title: '',
    description: '',
    releaseDate: '',
    duration: '',
    genre: [],
    thumbnail: '',
    streamHG: '',
    doodstream: '',
    megacloud: '',
    streamtape: ''
  };

  const [formData, setFormData] = useState<MovieFormData>(initialFormData);

  // Protect the route
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const genres = e.target.value.split(',').map(g => g.trim());
    setFormData(prev => ({ ...prev, genre: genres }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setSelectedMovieId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedMovieId) {
        await updateMovie(selectedMovieId, formData);
        toast.success('Movie updated successfully');
      } else {
        await addMovie({
          ...formData,
          isNew: true
        });
        toast.success('Movie added successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error('Failed to save movie');
    }
  };

  const handleEdit = (movie: Movie) => {
    setIsEditing(true);
    setSelectedMovieId(movie._id);
    setFormData({
      title: movie.title,
      description: movie.description,
      releaseDate: movie.releaseDate,
      duration: movie.duration,
      genre: movie.genre,
      thumbnail: movie.thumbnail,
      streamHG: movie.streamHG || '',
      doodstream: movie.doodstream || '',
      megacloud: movie.megacloud || '',
      streamtape: movie.streamtape || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovie(id);
        toast.success('Movie deleted successfully');
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error('Failed to delete movie');
      }
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141821]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f47521]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141821] pt-14 md:pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            <span className="text-[#f47521]">Movie</span> Admin Panel
          </h1>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1f2c] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          </div>
        </div>
        
        {/* Movie Form */}
        <div className="bg-[#1a1f2c] rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Edit2 className="h-5 w-5 text-[#f47521]" />
                    Edit Movie
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-[#f47521]" />
                    Add New Movie
                  </>
                )}
              </h2>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-white/70 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Add</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-white text-sm font-medium mb-1.5">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1.5">Release Date</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1.5">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2h 30min"
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-white text-sm font-medium mb-1.5">Genres</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre.join(', ')}
                    onChange={handleGenreChange}
                    placeholder="Action, Drama, Comedy"
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-white text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent h-24 sm:h-32"
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-white text-sm font-medium mb-1.5">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1.5">StreamHG ID</label>
                  <input
                    type="text"
                    name="streamHG"
                    value={formData.streamHG}
                    onChange={handleInputChange}
                    placeholder="e.g., uchribvne8ir"
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1.5">DoodStream URL</label>
                  <input
                    type="text"
                    name="doodstream"
                    value={formData.doodstream}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1.5">MegaCloud URL</label>
                  <input
                    type="text"
                    name="megacloud"
                    value={formData.megacloud}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1.5">StreamTape URL</label>
                  <input
                    type="text"
                    name="streamtape"
                    value={formData.streamtape}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#141821] text-white rounded-lg border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#f47521] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f47521] text-white rounded-lg hover:bg-[#f47521]/90 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>{isEditing ? 'Update Movie' : 'Add Movie'}</span>
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Movies List */}
        <div className="bg-[#1a1f2c] rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Film className="h-5 w-5 text-[#f47521]" />
              Manage Movies
              <span className="ml-2 text-sm text-white/70">({filteredMovies.length} movies)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMovies.map((movie: Movie) => (
                <div
                  key={movie._id}
                  className="bg-[#141821] rounded-lg overflow-hidden group hover:ring-2 hover:ring-[#f47521] transition-all"
                >
                  <div className="relative aspect-video">
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-1">{movie.title}</h3>
                    <p className="text-sm text-white/70 mb-2">{movie.duration} • {new Date(movie.releaseDate).getFullYear()}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {movie.genre.map((g, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-[#f47521]/10 text-[#f47521] rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#f47521] text-white rounded-lg hover:bg-[#f47521]/90 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="flex items-center justify-center p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/70">No movies found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieAdminPanel;
