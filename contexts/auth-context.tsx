'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Models } from 'appwrite'
import { authService, UserProfile } from '@/lib/auth'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser.user)
        setProfile(currentUser.profile)

        // Update last active
        if (currentUser.user) {
          authService.updateLastActive(currentUser.user.$id)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password)
      setUser(result.user)
      setProfile(result.profile)

      // Update last active
      authService.updateLastActive(result.user.$id)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) => {
    try {
      const result = await authService.register(
        email,
        password,
        firstName,
        lastName,
        username
      )
      setUser(result.user)
      setProfile(result.profile as UserProfile)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return

    try {
      const updatedProfile = await authService.updateProfile(user.$id, updates)
      setProfile(updatedProfile as UserProfile)
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const userProfile = await authService.getUserProfile(user.$id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Profile refresh error:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
