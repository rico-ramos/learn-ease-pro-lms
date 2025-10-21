import { useAuthCtx } from './AuthProvider.jsx'
export default function useAuth() {
  return useAuthCtx()
}
