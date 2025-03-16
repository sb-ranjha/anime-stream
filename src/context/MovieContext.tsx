import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

interface Movie {
  _id?: string;
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
  isNew?: boolean;
}

interface MovieContextType {
  movies: Movie[];
  loading: boolean;
  addMovie: (movie: Omit<Movie, '_id'>) => Promise<void>;
  updateMovie: (id: string, movie: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  fetchMovies: () => Promise<void>;
  getMovie: (id: string) => Movie | undefined;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const useMovie = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovie must be used within a MovieProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useMovies = useMovie;

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const moviesQuery = query(collection(db, 'movies'), orderBy('releaseDate', 'desc'));
      const querySnapshot = await getDocs(moviesQuery);
      const moviesData = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      })) as Movie[];
      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const getMovie = (id: string) => {
    return movies.find(movie => movie._id === id);
  };

  const addMovie = async (movie: Omit<Movie, '_id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'movies'), movie);
      const newMovie = { _id: docRef.id, ...movie };
      setMovies(prev => [newMovie, ...prev]);
      toast.success('Movie added successfully');
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error('Failed to add movie');
      throw error;
    }
  };

  const updateMovie = async (id: string, movieData: Partial<Movie>) => {
    try {
      const movieRef = doc(db, 'movies', id);
      await updateDoc(movieRef, movieData);
      setMovies(prev =>
        prev.map(movie =>
          movie._id === id ? { ...movie, ...movieData } : movie
        )
      );
      toast.success('Movie updated successfully');
    } catch (error) {
      console.error('Error updating movie:', error);
      toast.error('Failed to update movie');
      throw error;
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'movies', id));
      setMovies(prev => prev.filter(movie => movie._id !== id));
      toast.success('Movie deleted successfully');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Failed to delete movie');
      throw error;
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        addMovie,
        updateMovie,
        deleteMovie,
        fetchMovies,
        getMovie
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieContext; 