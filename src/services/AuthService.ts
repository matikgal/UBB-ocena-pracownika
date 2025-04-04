// Implementation of the AuthService interface - follows DIP
export class AuthService {
  private apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Login failed',
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Network error occurred',
      }
    }
  }
}