// Shields.io and Marketplace badge generators for README files

export function generateBadges(extension) {
  if (!extension) return {};

  const id = extension.id;
  const marketplaceUrl = `https://marketplace.visualstudio.com/items?itemName=${id}`;

  const badges = [
    {
      label: 'Downloads / Installs',
      badgeUrl: `https://img.shields.io/visual-studio-marketplace/i/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=0284c7`,
      markdown: `[![Installs](https://img.shields.io/visual-studio-marketplace/i/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=0284c7)](${marketplaceUrl})`,
      html: `<a href="${marketplaceUrl}"><img src="https://img.shields.io/visual-studio-marketplace/i/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=0284c7" alt="Visual Studio Marketplace Installs" /></a>`,
    },
    {
      label: 'Star Rating',
      badgeUrl: `https://img.shields.io/visual-studio-marketplace/r/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=eab308`,
      markdown: `[![Rating](https://img.shields.io/visual-studio-marketplace/r/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=eab308)](${marketplaceUrl})`,
      html: `<a href="${marketplaceUrl}"><img src="https://img.shields.io/visual-studio-marketplace/r/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=eab308" alt="Visual Studio Marketplace Rating" /></a>`,
    },
    {
      label: 'Latest Version',
      badgeUrl: `https://img.shields.io/visual-studio-marketplace/v/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=6366f1`,
      markdown: `[![Version](https://img.shields.io/visual-studio-marketplace/v/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=6366f1)](${marketplaceUrl})`,
      html: `<a href="${marketplaceUrl}"><img src="https://img.shields.io/visual-studio-marketplace/v/${id}?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=6366f1" alt="Visual Studio Marketplace Version" /></a>`,
    },
    {
      label: 'Flat Modern Badge',
      badgeUrl: `https://img.shields.io/visual-studio-marketplace/d/${id}?style=flat-square&color=10b981`,
      markdown: `[![Downloads](https://img.shields.io/visual-studio-marketplace/d/${id}?style=flat-square&color=10b981)](${marketplaceUrl})`,
      html: `<a href="${marketplaceUrl}"><img src="https://img.shields.io/visual-studio-marketplace/d/${id}?style=flat-square&color=10b981" alt="Downloads" /></a>`,
    },
  ];

  return badges;
}

export function generateCliCommand(extensionId) {
  return `code --install-extension ${extensionId}`;
}
