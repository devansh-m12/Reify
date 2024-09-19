'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Music, Mic2 } from 'lucide-react'

interface ProfileData {
  display_name: string
  email: string
  images: { url: string }[]
  followers: { total: number }
  // Add more fields as needed
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/me')
        const result = await response.json()
        if (result.success) {
          setProfileData(result.data)
        } else {
          setError(result.message)
        }
      } catch (err) {
        setError('Failed to fetch profile data')
      }
    }

    fetchProfileData()
  }, [])

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8 bg-red-900/20 border-red-900/50 text-red-50">
        <CardContent className="pt-6">
          <p className="text-center">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen text-gray-200">
      <Card className="max-w-2xl mx-auto bg-zinc-900 border-zinc-800 text-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-white">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {!profileData ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20 border-2 border-purple-500">
                  <AvatarImage src={profileData.images[0]?.url} alt={profileData.display_name} />
                  <AvatarFallback className="bg-purple-700 text-white">{profileData.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profileData.display_name}</h2>
                  <p className="text-gray-400 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {profileData.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileCard icon={<Users className="w-5 h-5 text-purple-400" />} title="Followers" value={profileData.followers.total.toLocaleString()} />
                <ProfileCard icon={<Music className="w-5 h-5 text-purple-400" />} title="Playlists" value="23" />
                <ProfileCard icon={<Mic2 className="w-5 h-5 text-purple-400" />} title="Artists" value="142" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-zinc-800 text-purple-300 hover:bg-zinc-700">Pop</Badge>
                <Badge variant="secondary" className="bg-zinc-800 text-purple-300 hover:bg-zinc-700">Rock</Badge>
                <Badge variant="secondary" className="bg-zinc-800 text-purple-300 hover:bg-zinc-700">Hip Hop</Badge>
                <Badge variant="secondary" className="bg-zinc-800 text-purple-300 hover:bg-zinc-700">Electronic</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg bg-zinc-800 border border-zinc-700">
      {icon}
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-20 h-20 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 bg-zinc-800" />
          <Skeleton className="h-4 w-60 bg-zinc-800" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg bg-zinc-800" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full bg-zinc-800" />
        ))}
      </div>
    </div>
  )
}