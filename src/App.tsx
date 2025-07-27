import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/providers/ToastProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import GetHelp from '@/pages/GetHelp';
import FindWork from '@/pages/FindWork';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';
import "./i18n/config";
import { useEffect, useState } from 'react'
import { supabase } from './integrations/supabase/client'
import { LoadingScreen } from '@/components/ui/loading-screen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .single()
        
        if (error) {
          console.error('Supabase connection error:', error)
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err)
      } finally {
        // Add a small delay to show the loading screen
        setTimeout(() => setIsInitializing(false), 1000);
      }
    }
    
    testConnection()
  }, [])

  if (isInitializing) {
    return <LoadingScreen message="Initializing HouseHand..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/get-help" element={<GetHelp />} />
          <Route path="/find-work" element={<FindWork />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
