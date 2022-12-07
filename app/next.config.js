// @ts-check

const path = require('path');

process.env.NODE_ENV ||= 'development';

const nextConfig = {
  // https://nextjs.org/docs#changing-x-powered-by
  poweredByHeader: false,

  // https://nextjs.org/docs#configuring-extensions-looked-for-when-resolving-pages-in-pages
  pageExtensions: ['ts', 'tsx'],
};

module.exports = nextConfig;
