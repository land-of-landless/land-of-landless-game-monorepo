/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.thelol.xyz",
        port:'',
        pathname: "/**"
      },
    ],
    unoptimized: true
  },
}

module.exports = nextConfig
