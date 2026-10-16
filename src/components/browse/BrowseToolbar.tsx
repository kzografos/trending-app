import styles from "./BrowseToolbar.module.css";

interface BrowseToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  genres: string[];
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
  resultCount: number;
  isFiltering: boolean;
}

export function BrowseToolbar({
  query,
  onQueryChange,
  genres,
  selectedGenre,
  onGenreChange,
  resultCount,
  isFiltering,
}: BrowseToolbarProps) {
  return (
    <form
      className={styles.toolbar}
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="title-search" className="visually-hidden">
        Search titles
      </label>
      <input
        id="title-search"
        className={styles.search}
        type="search"
        placeholder="Search titles"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <div className={styles.genres} role="group" aria-label="Filter by genre">
        <button
          type="button"
          className={styles.chip}
          aria-pressed={selectedGenre === null}
          onClick={() => onGenreChange(null)}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            className={styles.chip}
            aria-pressed={selectedGenre === genre}
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Always in the DOM so screen readers announce changes (Part 1, #13) */}
      <p role="status" className="visually-hidden">
        {isFiltering
          ? `${resultCount} ${resultCount === 1 ? "title" : "titles"} found`
          : ""}
      </p>
    </form>
  );
}
