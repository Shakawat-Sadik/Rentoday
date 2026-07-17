import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "**" },
      { protocol: "https", hostname: "picsum.photos",      pathname: "**" },
      { protocol: "https", hostname: "fastly.picsum.photos",   pathname: "**" },
      { protocol: "https", hostname: "assets.aceternity.com", pathname: "**" },
      { protocol: "https", hostname: "www.google.com",         pathname: "**" },
    ],
  },
};

export default nextConfig;
