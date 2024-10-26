module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
    serverComponentsExternalPackages: ['sequelize'],
  },
};
