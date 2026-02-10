
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { UsersType } from '@/types/auth'
import { useCookies } from 'react-cookie';

export type AuthContextType = {
  user: UsersType | undefined
  isAuthenticated: boolean
  saveSession: (session: UsersType) => void
  removeSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = '_UBOLD_AUTH_KEY_'

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()

  const [cookies, setCookie, removeCookie] = useCookies([authSessionKey]);

  const getSession = (): AuthContextType['user'] => {
    const fetchedCookie = cookies[authSessionKey]
    if (!fetchedCookie) return
    else return fetchedCookie
  }

  const [user, setUser] = useState<UsersType | undefined>(getSession())

  const saveSession = (user: UsersType) => {
    setCookie(authSessionKey, user)
    setUser(user)
  }

  const removeSession = () => {
    removeCookie(authSessionKey)
    setUser(undefined)
    navigate('/auth/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!cookies[authSessionKey],
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
