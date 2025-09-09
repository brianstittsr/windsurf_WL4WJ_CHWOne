"use client";

import { useEffect } from "react";

export default function ClientBootstrap() {
  useEffect(() => {
    // Dynamically import Bootstrap JS only on the client
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {
      // no-op if import fails
    });
  }, []);
  return null;
}
