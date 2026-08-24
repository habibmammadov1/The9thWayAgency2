import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**",
      },
      // Azure Blob Storage — production file uploads
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
        pathname: "/uploads/**",
      },
      // Azure Container Apps — API hosted images (fallback/legacy)
      {
        protocol: "https",
        hostname: "*.azurecontainerapps.io",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
