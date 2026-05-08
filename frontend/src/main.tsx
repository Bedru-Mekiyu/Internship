import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'
import { store } from './store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)

window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  if (import.meta.env.DEV) {
    console.error('Global error:', event.error);
  }
});
