import { config } from '@/lib/config'

const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: config.baseUrl
    }
  })
} 