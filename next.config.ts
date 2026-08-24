import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The feedback overlay is loaded by every prototype, on every branch,
        // from this deployment. A long cache would defeat the point — the
        // whole reason it lives here is that fixes reach old prototypes.
        // Short TTL, and revalidation lets a redeploy take effect immediately.
        source: "/feedback.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, must-revalidate" },
          // Preview deployments load it cross-origin.
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
