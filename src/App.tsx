import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";

function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </>
  );
}

export default App;
