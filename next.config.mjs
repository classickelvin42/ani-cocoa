/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: false },
      { source: "/book.html", destination: "/book", permanent: false },
      { source: "/shop.html", destination: "/shop", permanent: false },
      { source: "/contact.html", destination: "/contact", permanent: false },
      { source: "/services.html", destination: "/book", permanent: false },
      { source: "/product.html", destination: "/shop", permanent: false }
    ];
  }
};

export default nextConfig;
