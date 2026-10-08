import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiService } from '../services/apiService'
import { speechService } from '../services/speechService'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('gramsetu_token') : null))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const clearAuthState = (errMsg = '') => {
    localStorage.removeItem('gramsetu_token')
    localStorage.removeItem('gramsetu_user')
    sessionStorage.clear()
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    if (errMsg) {
      setSessionError(errMsg)
    }
  }

  // Validate session against backend /api/auth/me on mount or token change
  const validateSession = useCallback(async () => {
    const storedToken = localStorage.getItem('gramsetu_token')
    if (!storedToken) {
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const currentUser = await apiService.getCurrentUser()
      if (currentUser && (currentUser.id || currentUser._id)) {
        const formattedUser = { ...currentUser, id: currentUser.id || currentUser._id }
        setUser(formattedUser)
        setToken(storedToken)
        setIsAuthenticated(true)
        localStorage.setItem('gramsetu_user', JSON.stringify(formattedUser))
      } else {
        // Invalid session
        clearAuthState('Your session has expired. Please log in again.')
      }
    } catch (err) {
      console.warn('Session validation failed:', err.message)
      clearAuthState('Your session has expired. Please log in again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    validateSession()
  }, [validateSession])

  const loginUser = (userData, jwtToken) => {
    if (jwtToken) {
      localStorage.setItem('gramsetu_token', jwtToken)
      setToken(jwtToken)
    }
    if (userData) {
      const formattedUser = { ...userData, id: userData.id || userData._id }
      localStorage.setItem('gramsetu_user', JSON.stringify(formattedUser))
      setUser(formattedUser)
      setIsAuthenticated(true)
      setSessionError('')
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (e) {
      console.warn('Logout API notice:', e.message)
    }
    clearAuthState()
  }

  const updateUser = (newFields) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...newFields }
      try {
        localStorage.setItem('gramsetu_user', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const toggleVoice = () => {
    if (user) {
      const isCurrentlyOn = user.voiceEnabled !== false
      const nextSetting = !isCurrentlyOn
      if (!nextSetting) {
        speechService.cancel()
      }
      updateUser({ voiceEnabled: nextSetting })
    }
  }

  const setVoiceSpeed = (speed) => {
    if (user && ['slow', 'normal', 'fast'].includes(speed)) {
      updateUser({ voiceSpeed: speed })
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        sessionError,
        setSessionError,
        validateSession,
        loginUser,
        logout,
        updateUser,
        toggleVoice,
        setVoiceSpeed
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
