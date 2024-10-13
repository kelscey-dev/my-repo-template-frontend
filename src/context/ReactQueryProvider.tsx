"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import useConfiguredQueryClient from "@utils/api/queryClient";

function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useConfiguredQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ReactQueryProvider;
