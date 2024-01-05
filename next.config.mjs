import withPWAInit from "@ducanh2912/next-pwa";
const withPWA = withPWAInit({
  dest: "public",
});
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
    serverActions: {
			allowedForwardedHosts: ['localhost'],
			allowedOrigins: ['http://localhost']
		},
  },
};

export default withPWA(nextConfig);