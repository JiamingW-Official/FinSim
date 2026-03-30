"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LazyMotion, domAnimation } from "framer-motion";

export function Providers({ children }: { children: ReactNode }) {
 const [queryClient] = useState(
 () =>
 new QueryClient({
 defaultOptions: {
 queries: {
 staleTime: 5 * 60 * 1000,
 retry: 2,
 refetchOnWindowFocus: false,
 },
 },
 }),
 );

 return (
 <QueryClientProvider client={queryClient}>
 <LazyMotion features={domAnimation}>
 <TooltipProvider>
 {children}
 <Toaster position="bottom-right" theme="dark" />
 </TooltipProvider>
 </LazyMotion>
 </QueryClientProvider>
 );
}
