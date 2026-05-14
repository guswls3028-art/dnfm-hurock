/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      // /events 는 폐기 (콘테스트가 유일한 이벤트 type). /events/history 는 유지.
      { source: "/events", destination: "/contests", permanent: false },
    ];
  },
};

export default nextConfig;
