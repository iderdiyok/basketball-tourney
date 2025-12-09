import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { TextEncoder, TextDecoder } from 'util'

// Global polyfills
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    return fn()
  },
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: any) => children,
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock fetch globally
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})