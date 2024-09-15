'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Artist {
  name: string
}

interface Album {
  name: string
  images: { url: string }[]
}

interface Track {
  id: string
  name: string
  artists: Artist[]
  album: Album
  preview_url: string
}

export default function TinderLikeSongSuggestions() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
  }, [])

  useEffect(() => {
    if (tracks.length > 0) {
      handleAudioChange()
    }
  }, [currentTrackIndex, tracks])

  const handleAudioChange = () => {
    if (audio) {
      audio.pause()
      audio.src = ''
    }
    const newAudio = new Audio(tracks[currentTrackIndex].preview_url)
    setAudio(newAudio)
    setIsPlaying(false)
    newAudio.addEventListener('ended', () => setIsPlaying(false))
  }

  const fetchTracks = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTracks([])
    setCurrentTrackIndex(0)
    setIsPlaying(false)
    if (audio) {
      audio.pause()
      audio.src = ''
    }

    try {
      const response = await fetch('/api/suggest-songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      })
      const data = await response.json()
      if (response.ok && data.tracks) {
        setTracks(data.tracks)
      } else {
        setError(data.message || 'An error occurred')
      }
    } catch (error) {
      setError('Failed to fetch tracks')
    }
  }

  const handleLike = () => {
    console.log('Liked:', tracks[currentTrackIndex])
    goToNextTrack()
  }

  const handleDislike = () => {
    console.log('Disliked:', tracks[currentTrackIndex])
    goToNextTrack()
  }

  const goToNextTrack = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    }
  }

  const goToPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md mb-4">
        <CardContent className="p-6">
          <form onSubmit={fetchTracks} className="flex gap-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query"
              className="flex-grow"
            />
            <Button type="submit">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full max-w-md mb-4">
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {tracks.length > 0 && (
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="mb-4 relative w-full pt-[100%]">
              <Image
                src={tracks[currentTrackIndex].album.images[0]?.url || 'https://via.placeholder.com/150'}
                alt={`${tracks[currentTrackIndex].name} album cover`}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">{tracks[currentTrackIndex].name}</h2>
            <p className="text-gray-600 mb-1">
              {tracks[currentTrackIndex].artists.map(artist => artist.name).join(', ')}
            </p>
            <p className="text-gray-500 mb-4">{tracks[currentTrackIndex].album.name}</p>
            <div className="flex justify-center space-x-4 mb-6">
              <Button onClick={handleDislike} variant="outline" size="icon">
                <X className="h-6 w-6" />
              </Button>
              <Button onClick={togglePlayPause} variant="outline" size="icon">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button onClick={handleLike} variant="outline" size="icon">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex justify-between">
              <Button onClick={goToPreviousTrack} variant="ghost" disabled={currentTrackIndex === 0}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button onClick={goToNextTrack} variant="ghost" disabled={currentTrackIndex === tracks.length - 1}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}