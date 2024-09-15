'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, Send, Loader2, Star, Sparkles, Music, Zap, Book, Dumbbell, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  preview_url: string | null
  duration_ms: number
  rating?: number
}

const exampleInputs = [
  { icon: <Sparkles className="w-4 h-4" />, text: "I'm feeling nostalgic and want to listen to some 80s pop hits" },
  { icon: <Music className="w-4 h-4" />, text: "Recommend me some upbeat indie rock for a road trip" },
  { icon: <Book className="w-4 h-4" />, text: "I need focus music for studying, preferably instrumental" },
  { icon: <Zap className="w-4 h-4" />, text: "What are some good jazz tracks for a relaxing evening?" },
  { icon: <Dumbbell className="w-4 h-4" />, text: "Suggest some energetic workout music to keep me motivated" }
]

export default function SpotifyAIRecommender() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedTrackId, setFocusedTrackId] = useState<string | null>(null)
  const [apiLimited, setApiLimited] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    audioRef.current = new Audio()
    setAudio(audioRef.current)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  useEffect(() => {
    if (tracks.length > 0) {
      handleAudioChange()
    }
  }, [currentTrackIndex, tracks])

  useEffect(() => {
    if (audio) {
      audio.volume = volume
    }
  }, [volume, audio])

  const handleAudioChange = () => {
    if (audio) {
      audio.pause()
      const currentTrack = tracks[currentTrackIndex]
      if (currentTrack.preview_url) {
        audio.src = currentTrack.preview_url
        audio.play().catch(error => {
          console.error("Playback failed", error)
          setError("Playback failed. This track may not be available for preview.")
        })
        setIsPlaying(true)
        audio.addEventListener('timeupdate', updateProgress)
        audio.addEventListener('ended', handleTrackEnd)
      } else {
        setError("Preview not available for this track.")
        setIsPlaying(false)
      }
    }
  }

  const updateProgress = () => {
    if (audio) {
      setCurrentTime(audio.currentTime)
    }
  }

  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const fetchTracks = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTracks([])
    setCurrentTrackIndex(0)
    setIsPlaying(false)
    setIsLoading(true)
    setApiLimited(false)
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
        body: JSON.stringify( query ),
      })
      const data = await response.json()
      if (response.ok && data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks)
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 0
        }
      } else if (response.status === 429) {
        setApiLimited(true)
      } else {
        setError(data.message || 'An error occurred')
      }
    } catch (error) {
      setError('Failed to fetch tracks')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        const currentTrack = tracks[currentTrackIndex]
        if (currentTrack.preview_url) {
          audio.play().catch(error => {
            console.error("Playback failed", error)
            setError("Playback failed. This track may not be available for preview.")
          })
        } else {
          setError("Preview not available for this track.")
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleRating = (trackId: string, rating: number) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? { ...track, rating } : track
      )
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col p-6 pb-24">
        <form onSubmit={fetchTracks} className="mb-6">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the music you like or how you're feeling..."
            className="w-full bg-gray-800 text-white resize-none mb-2"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400 flex flex-wrap gap-2">
              {exampleInputs.map((input, index) => (
                <button
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={() => setQuery(input.text)}
                >
                  {input.icon}
                  <span className="hidden sm:inline">Example {index + 1}</span>
                </button>
              ))}
            </div>
            <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Get Recommendations
            </Button>
          </div>
        </form>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {apiLimited && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Limit Reached</AlertTitle>
              <AlertDescription>Please try again in a few seconds.</AlertDescription>
            </Alert>
          )}

          {!isLoading && tracks.length === 0 && !error && !apiLimited && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Tracks Found</AlertTitle>
              <AlertDescription>Try a different query or check back later.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {tracks.map((track, index) => (
                <motion.div
                  key={`${track.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`bg-gray-800 hover:bg-gray-700 transition-all cursor-pointer ${
                      focusedTrackId === track.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => {
                      setCurrentTrackIndex(index)
                      setFocusedTrackId(track.id)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="relative w-full pt-[100%] mb-2">
                        <Image
                          src={track.album.images[0]?.url || '/placeholder.svg'}
                          alt={`${track.name} album cover`}
                          fill
                          className="rounded-md object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      </div>
                      <h3 className="font-semibold text-sm truncate">{track.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{track.artists.map(artist => artist.name).join(', ')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <TooltipProvider key={star}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRating(track.id, star)
                                    }}
                                    className={`focus:outline-none ${star <= (track.rating || 0) ? 'text-yellow-400' : 'text-gray-400'}`}
                                  >
                                    <Star className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Rate {star} star{star !== 1 ? 's' : ''}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                        {currentTrackIndex === index && isPlaying && (
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Now Playing Bar */}
      {tracks.length > 0 && tracks[currentTrackIndex].preview_url && (
        <div className="h-24 bg-gray-800 border-t border-gray-700 flex items-center px-4 fixed bottom-0 left-0 right-0">
          <div className="flex items-center flex-1">
            <Image
              src={tracks[currentTrackIndex].album.images[0]?.url || '/placeholder.svg'}
              alt={`${tracks[currentTrackIndex].name} album cover`}
              width={56}
              height={56}
              className="rounded-md mr-4"
            />
            <div>
              <h4 className="font-semibold text-sm">{tracks[currentTrackIndex].name}</h4>
              <p className="text-xs text-gray-400">{tracks[currentTrackIndex].artists.map(artist => artist.name).join(', ')}</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="mx-2" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentTrackIndex(Math.min(tracks.length - 1, currentTrackIndex + 1))}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-full flex items-center text-xs">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                className="mx-2 flex-1"
                value={[currentTime]}
                max={tracks[currentTrackIndex].duration_ms / 1000}
                step={1}
                onValueChange={(value) => {
                  if (audio) {
                    audio.currentTime = value[0]
                  }
                }}
              />
              <span className="w-10">{formatTime(tracks[currentTrackIndex].duration_ms / 1000)}</span>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            <Slider
              className="w-24"
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>
          <div className="ml-4">
            <Image
              src={tracks[currentTrackIndex].album.images[0]?.url || '/placeholder.svg'}
              alt={`${tracks[currentTrackIndex].name} album cover`}
              width={80}
              height={80}
              className="rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  )
}