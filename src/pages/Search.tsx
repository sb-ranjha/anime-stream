import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchAnimes } = useAnime();
  const [results, setResults] = useState(searchAnimes(query));

  useEffect(() => {
    setResults(searchAnimes(query));
  }, [query, searchAnimes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">Search Results for "{query}"</h1>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No results found for "{query}"</p>
      )}
    </div>
  );
}

export default Search;