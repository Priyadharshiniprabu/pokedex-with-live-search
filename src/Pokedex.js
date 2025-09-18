import React, { useState, useEffect } from "react";

const POKE_API_BASE = "https://pokeapi.co/api/v2";

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const Pokedex = () => {
  const [allPokemon, setAllPokemon] = useState([]); // list of {name, url}
  const [displayedPokemon, setDisplayedPokemon] = useState([]); // detailed info
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all Pokémon names (limit 151 for performance)
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${POKE_API_BASE}/pokemon?limit=151`);
        const data = await res.json();
        setAllPokemon(data.results);
      } catch (err) {
        setError("Failed to load Pokémon list.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPokemon();
  }, []);

  // Fetch all types for filter dropdown
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${POKE_API_BASE}/type`);
        const data = await res.json();
        // Filter out non-official types (like shadow, unknown)
        const officialTypes = data.results.filter(
          (t) => Object.keys(TYPE_COLORS).includes(t.name)
        );
        setTypes(officialTypes);
      } catch {
        // silently fail
      }
    };
    fetchTypes();
  }, []);

  // Fetch detailed info for filtered and searched Pokémon
  useEffect(() => {
    if (allPokemon.length === 0) return;

    const filtered = allPokemon.filter(({ name }) => {
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // If type filter is active, we need to filter by type after fetching details
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = filtered.map(async (poke) => {
          const res = await fetch(poke.url);
          return res.json();
        });
        const results = await Promise.all(promises);

        let filteredByType = results;
        if (typeFilter) {
          filteredByType = results.filter((poke) =>
            poke.types.some((t) => t.type.name === typeFilter)
          );
        }
        setDisplayedPokemon(filteredByType);
      } catch {
        setError("Failed to load Pokémon details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [allPokemon, searchTerm, typeFilter]);

  return (
    <div className="pokedex-container">
      <h1 className="title">Pokedex with Live Search 🎮</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search Pokémon by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          aria-label="Search Pokémon"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="type-select"
          aria-label="Filter by Pokémon type"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t.name} value={t.name}>
              {capitalize(t.name)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="loading">Loading Pokémon...</p>
      ) : displayedPokemon.length === 0 ? (
        <p className="no-results">No Pokémon found.</p>
      ) : (
        <div className="cards-grid">
          {displayedPokemon.map((poke) => {
            const primaryType = poke.types[0].type.name;
            const bgColor = TYPE_COLORS[primaryType] || "#777";

            return (
              <div
                key={poke.id}
                className="card"
                style={{ borderColor: bgColor }}
                tabIndex={0}
                aria-label={`${capitalize(poke.name)}, type ${primaryType}`}
              >
                <div
                  className="card-image"
                  style={{ backgroundColor: bgColor + "33" }}
                >
                  <img
                    src={
                      poke.sprites.other["official-artwork"].front_default ||
                      poke.sprites.front_default
                    }
                    alt={poke.name}
                    loading="lazy"
                  />
                </div>
                <div className="card-info">
                  <h2>{capitalize(poke.name)}</h2>
                  <div className="types">
                    {poke.types.map(({ type }) => (
                      <span
                        key={type.name}
                        className="type-badge"
                        style={{ backgroundColor: TYPE_COLORS[type.name] }}
                      >
                        {capitalize(type.name)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .pokedex-container {
          max-width: 960px;
          margin: 2rem auto;
          padding: 0 1rem 3rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #222;
          user-select: none;
        }
        .title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #d32f2f;
          text-shadow: 1px 1px 3px #fbc02d;
        }
        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .search-input, .type-select {
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          border: 2px solid #d32f2f;
          outline-offset: 2px;
          min-width: 220px;
          transition: border-color 0.3s ease;
        }
        .search-input:focus, .type-select:focus {
          border-color: #fbc02d;
          box-shadow: 0 0 8px #fbc02daa;
        }
        .error {
          color: #e53935;
          text-align: center;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .loading, .no-results {
          text-align: center;
          font-style: italic;
          font-size: 1.2rem;
          color: #555;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        .card {
          background: #fff;
          border: 4px solid;
          border-radius: 20px;
          box-shadow: 0 8px 20px rgb(0 0 0 / 0.12);
          cursor: default;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          user-select: text;
        }
        .card:focus,
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 28px rgb(0 0 0 / 0.25);
          outline: none;
        }
        .card-image {
          width: 140px;
          height: 140px;
          border-radius: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          box-shadow: inset 0 0 12px rgb(0 0 0 / 0.1);
        }
        .card-image img {
          max-width: 100%;
          max-height: 100%;
          user-select: none;
          pointer-events: none;
        }
        .card-info h2 {
          margin: 0 0 0.5rem;
          font-size: 1.3rem;
          color: #222;
          text-align: center;
          user-select: text;
        }
        .types {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          text-shadow: 0 0 2px rgba(0,0,0,0.3);
          user-select: none;
          box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
        }
        @media (max-width: 480px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }
          .card-image {
            width: 110px;
            height: 110px;
          }
        }
      `}</style>
    </div>
  );
};

export default Pokedex;