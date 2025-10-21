import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactElement } from 'react';

// Query client para testes
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
}

/**
 * Wrapper customizado com todos os providers necessários
 */
function AllTheProviders({ children, queryClient }: { children: React.ReactNode; queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Render customizado que inclui todos os providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialRoute = '/', queryClient = createTestQueryClient(), ...renderOptions } = options || {};

  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Utilitário para esperar por mudanças assíncronas
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock de usuário autenticado
 */
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
};

/**
 * Mock de negócio
 */
export const mockNegocio = {
  id: 'negocio-1',
  user_id: 'test-user-id',
  nome: 'Negócio Teste',
  tipo_negocio: 'academia',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Mock de chatbot
 */
export const mockChatbot = {
  id: 'chatbot-1',
  negocio_id: 'negocio-1',
  nome: 'Chatbot Teste',
  ativo: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Mock de lead
 */
export const mockLead = {
  id: 'lead-1',
  negocio_id: 'negocio-1',
  nome: 'João Silva',
  email: 'joao@example.com',
  telefone: '11999999999',
  status: 'novo',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Re-export tudo do testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
