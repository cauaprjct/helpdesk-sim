import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O workspace tem outros package-lock.json acima desta pasta; sem isso o
  // Turbopack elege a raiz errada e avisa no build.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
