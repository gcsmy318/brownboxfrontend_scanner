/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,  // เปิด Strict Mode ของ React
    trailingSlash: true,    // ให้ URL ลงท้ายด้วย /
    basePath: '/testing',      // ตั้ง path ย่อยเป็น /shop
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://brownboxbackend-production.up.railway.app', // 🔁 แก้ให้ชี้ไปยัง Spring Boot ที่ deploy แล้ว
  },
};

module.exports = nextConfig;


