// Predefined categories, curated comparisons, and quick search tags

export const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: 'Compass' },
  { id: 'Programming Languages', label: 'Programming Languages', icon: 'Code2' },
  { id: 'Linters', label: 'Linters', icon: 'CheckCircle2' },
  { id: 'Formatters', label: 'Formatters', icon: 'Wand2' },
  { id: 'Themes', label: 'Themes & Icons', icon: 'Palette' },
  { id: 'Debuggers', label: 'Debuggers', icon: 'Bug' },
  { id: 'Snippets', label: 'Snippets', icon: 'FileCode2' },
  { id: 'SCM Providers', label: 'Git & SCM', icon: 'GitBranch' },
  { id: 'Keymaps', label: 'Keymaps', icon: 'Keyboard' },
  { id: 'Other', label: 'Tools & Utilities', icon: 'Boxes' },
];

export const SORT_OPTIONS = [
  { id: 4, label: 'Most Installed (Downloads)', shortLabel: 'Installs' },
  { id: 7, label: 'Trending Today', shortLabel: 'Trending 24h' },
  { id: 8, label: 'Trending This Week', shortLabel: 'Trending 7d' },
  { id: 9, label: 'Trending This Month', shortLabel: 'Trending 30d' },
  { id: 13, label: 'Weighted Rating Score', shortLabel: 'Weighted Rating' },
  { id: 5, label: 'Highest Rated (Stars)', shortLabel: 'Top Rated' },
  { id: 12, label: 'Recently Updated', shortLabel: 'Recent Updates' },
];

export const POPULAR_SEARCH_TAGS = [
  { label: 'GitHub Copilot', query: 'GitHub.copilot' },
  { label: 'Prettier', query: 'esbenp.prettier-vscode' },
  { label: 'Python', query: 'ms-python.python' },
  { label: 'ESLint', query: 'dbaeumer.vscode-eslint' },
  { label: 'Tailwind CSS', query: 'bradlc.vscode-tailwindcss' },
  { label: 'GitLens', query: 'eamodio.gitlens' },
  { label: 'Docker', query: 'ms-azuretools.vscode-docker' },
  { label: 'Material Icons', query: 'PKief.material-icon-theme' },
  { label: 'Ruff', query: 'charliermarsh.ruff' },
  { label: 'Biome', query: 'biomejs.biome' },
  { label: 'C/C++', query: 'ms-vscode.cpptools' },
];

export const CURATED_COMPARISONS = [
  {
    title: 'AI Assistants Arena',
    description: 'Next-gen AI code completion and chat tools',
    extensionIds: ['GitHub.copilot', 'Codeium.codeium', 'Continue.continue'],
  },
  {
    title: 'Code Formatters Battle',
    description: 'Prettier vs the blazing-fast Rust-based Biome',
    extensionIds: ['esbenp.prettier-vscode', 'biomejs.biome'],
  },
  {
    title: 'Python Tooling Showdown',
    description: 'Official Python suite vs high-speed Astral Ruff',
    extensionIds: ['ms-python.python', 'charliermarsh.ruff'],
  },
  {
    title: 'Icon Packs Clash',
    description: 'The two heavyweight file & folder icon extensions',
    extensionIds: ['PKief.material-icon-theme', 'vscode-icons-team.vscode-icons'],
  },
  {
    title: 'Git Superchargers',
    description: 'GitLens deep repository insights vs official GitHub PRs',
    extensionIds: ['eamodio.gitlens', 'GitHub.vscode-pull-request-github'],
  },
];

export const TOP_PUBLISHERS = [
  { name: 'Microsoft', label: 'Microsoft', icon: 'https://github.com/microsoft.png' },
  { name: 'GitHub', label: 'GitHub', icon: 'https://github.com/github.png' },
  { name: 'redhat', label: 'Red Hat', icon: 'https://github.com/redhat.png' },
  { name: 'esbenp', label: 'Prettier Team', icon: 'https://github.com/prettier.png' },
  { name: 'eamodio', label: 'GitKraken / eamodio', icon: 'https://github.com/eamodio.png' },
  { name: 'charliermarsh', label: 'Astral (Ruff)', icon: 'https://github.com/astral-sh.png' },
  { name: 'biomejs', label: 'Biome Team', icon: 'https://github.com/biomejs.png' },
  { name: 'PKief', label: 'Philipp Kief', icon: 'https://github.com/PKief.png' },
];
