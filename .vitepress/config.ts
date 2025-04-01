import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: '99linesofcode',
  description: 'The Musings of an Anarchist Software Developer.',
  lastUpdated: false,
  themeConfig: {
    siteTitle: '99linesofcode',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/articles/' },
      { text: 'About', link: '/about/' },
    ],

    footer: {
      message: 'Except where otherwise noted, content on this site is released into the public domain under a <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en">Creative Commons Zero</a> license. Opinions entirely my own.',
      copyright: 'Copyleft &copy; 2024 - present Jordy Schreuders',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/99linesofcode' },
    ],
  },
  sitemap: {
    hostname: 'https://99linesofcode.nl',
  },
});
