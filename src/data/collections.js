// Collection ("best of") pages: honest, data-driven listicles rendered from
// live marketplace results at build time.
//
// Each entry defines a static /best/<slug> page that is prerendered into
// dist/best/<slug>/index.html by scripts/prerender-collection-pages.mjs.
// The marketplace query is expressed with the same constants the app uses,
// so results are always exactly what a user would see running the search in
// ExtensionPulse — no editorial cherry-picking.
//
// To add a page: append a COLLECTIONS entry. The prerenderer, the sitemap
// section, the /best/* SPA rewrite and the homepage footer links all derive
// from this single list.

export const COLLECTIONS = [
  {
    slug: 'most-installed-extensions',
    heading: 'The 20 Most Installed VS Code Extensions',
    seoTitle: '20 Most Installed VS Code Extensions ({year}) — Live Install Counts',
    seoDescription:
      'See the 20 most installed VS Code extensions, ranked by real Marketplace install counts — Python, Pylance, C/C++ and more, updated every build.',
    intro:
      'Ranked by total install count, pulled live from the Visual Studio Code Marketplace at build time. These are the extensions the majority of VS Code developers actually run — the de-facto standards of the ecosystem.',
    // No category filter — the whole marketplace, sorted by installs.
    category: null,
    sortBy: 4, // SortBy.INSTALL_COUNT
    pageSize: 20,
  },
  {
    slug: 'trending-extensions-this-week',
    heading: 'The 20 Trending VS Code Extensions This Week',
    seoTitle: '20 Trending VS Code Extensions This Week ({year}) — Live Rankings',
    seoDescription:
      'This week’s fastest-growing VS Code extensions, ranked by 7-day install momentum straight from the Marketplace. A live weekly trending snapshot.',
    intro:
      'Extensions with the strongest install momentum over the past seven days, ranked live from marketplace trending data at build time. A weekly snapshot of where the ecosystem is heating up.',
    category: null,
    sortBy: 8, // SortBy.TRENDING_WEEKLY
    pageSize: 20,
  },
  {
    slug: 'top-rated-extensions',
    heading: 'The 20 Highest-Rated VS Code Extensions',
    seoTitle: '20 Highest-Rated VS Code Extensions ({year}) — By Real Ratings',
    seoDescription:
      'The highest-rated VS Code extensions of {year}, ranked by weighted star score and review volume from the Marketplace — quality leaders, not vanity pages.',
    intro:
      'Ranked by weighted rating score — a balance of star value and rating volume — straight from the marketplace’s own ranking at build time. Quality leaders with meaningful review counts, not five-star vanity pages.',
    category: null,
    sortBy: 13, // SortBy.WEIGHTED_RATING
    pageSize: 20,
  },
  {
    slug: 'best-python-extensions',
    heading: 'The 10 Best VS Code Extensions for Python',
    seoTitle: '10 Best VS Code Extensions for Python ({year}) — Ranked by Installs',
    seoDescription:
      'The 10 best VS Code extensions for Python in {year}, ranked by real install counts: Python, Pylance, Jupyter, debuggers, formatters and more.',
    intro:
      'The most-installed extensions in the Programming Languages category matching Python, ranked live by install count at build time. From the interpreter tooling nearly everyone uses to the helpers worth discovering.',
    category: 'Programming Languages',
    searchText: 'python',
    sortBy: 4, // SortBy.INSTALL_COUNT
    pageSize: 10,
  },
  {
    slug: 'best-linter-extensions',
    heading: 'The 10 Best Linter Extensions for VS Code',
    seoTitle: '10 Best Linter Extensions for VS Code ({year}) — Ranked Live',
    seoDescription:
      'The 10 best linter extensions for VS Code in {year}, ranked by real Marketplace installs — ESLint, Ruff, Pylint, and language linters for every stack.',
    intro:
      'The most-installed linters on the VS Code Marketplace, ranked live by install count at build time. Whatever language you write, catching bugs before runtime starts here.',
    category: 'Linters',
    sortBy: 4, // SortBy.INSTALL_COUNT
    pageSize: 10,
  },
  {
    slug: 'best-formatter-extensions',
    heading: 'The 10 Best Formatter Extensions for VS Code',
    seoTitle: '10 Best Formatter Extensions for VS Code ({year}) — Ranked Live',
    seoDescription:
      'The 10 best formatter extensions for VS Code in {year}, ranked by real install counts — Prettier, Black, and the formatters every language uses.',
    intro:
      'The most-installed formatters on the VS Code Marketplace, ranked live by install count at build time. Consistent style, zero arguments.',
    category: 'Formatters',
    sortBy: 4, // SortBy.INSTALL_COUNT
    pageSize: 10,
  },
];
