import antdMomentWebpackPlugin from "antd-moment-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "picsum.photos",
      },
    ],
  },
  webpack(config) {
    config.plugins.push(new antdMomentWebpackPlugin());

    return config;
  },
  transpilePackages: ["antd"],
  reactStrictMode: false,
};

export default nextConfig;
