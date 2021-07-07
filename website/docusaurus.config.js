/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Pennant",
  tagline: "Financial charts",
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "vegaprotocol", // Usually your GitHub org/user name.
  projectName: "pennant", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Pennant",
      logo: {
        alt: "Pennant Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "Getting started",
        },
        {
          href: "https://github.com/vegaprotocol/pennant",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Vega Protocol",
          items: [
            {
              label: "Website",
              to: "http://vega.xyz/",
            },
            {
              label: "GitHub",
              to: "https://github.com/vegaprotocol",
            },
            {
              label: "Blog",
              to: "https://medium.com/vegaprotocol",
            },
            {
              label: "Twitch",
              to: "https://www.twitch.tv/vegacommunity",
            },
            {
              label: "YouTube",
              to: "https://www.youtube.com/channel/UC3xDuTW9fd1Y7jpCkOwOuHQ",
            },
          ],
        },
        {
          title: "Fairground Testnet",
          items: [
            {
              label: "Console",
              to: "https://console.fairground.wtf/",
            },
          ],
        },
        {
          title: "Social",
          items: [
            {
              label: "Discord",
              to: "https://discord.com/invite/ZNEMCYd",
            },
            {
              label: "Telegram",
              to: "https://t.me/vegacommunity",
            },
            {
              label: "Twitter",
              to: "https://twitter.com/vegaprotocol",
            },
            {
              label: "Forum",
              to: "https://community.vega.xyz/",
            },
          ],
        },
      ],
      copyright: `Copyright ©2018-${new Date().getFullYear()} Gobalsky Labs Limited, registered in Gibraltar`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
