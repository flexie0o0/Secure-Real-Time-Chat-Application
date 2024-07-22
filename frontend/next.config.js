/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 754004046,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "39ccb7d4587652736237c9d6cb64a7a2",
  },
  images: { domains: ["localhost"] },
};

module.exports = nextConfig;
