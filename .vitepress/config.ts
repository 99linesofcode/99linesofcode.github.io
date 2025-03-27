import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: '99linesofcode',
  description: 'A collection of thoughts, ideas and code I felt were worth sharing',
  lastUpdated: false,
  themeConfig: {
    siteTitle: '99linesofcode',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/articles/' },
      { text: 'About', link: '/about/' },
    ],

    footer: {
      message: 'Except where otherwise noted, content on this site is released into the public domain under a Creative Commons Zero license.',
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
