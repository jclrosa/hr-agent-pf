import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle pdf-parse module properly
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse'
      });
    }
    
    // Ignore test files from pdf-parse
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth']
  }
};

export default nextConfig;
