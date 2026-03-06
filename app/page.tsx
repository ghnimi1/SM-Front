"use client";

import { PrivateRoute } from "@/components/PrivateRoute";
import { Dashboard } from "@/components/dashboard";
import { StockProvider } from "@/contexts/stock-context";
import { ExpirationMonitor } from "@/components/expiration-monitor";

export default function Home() {
  return (
    <PrivateRoute allowedRoles={["admin", "user"]}>
      <StockProvider>
        <Dashboard />
        <ExpirationMonitor />
      </StockProvider>
    </PrivateRoute>
  );
}
