'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Send, Loader2, Star, Sparkles, Music, Zap, Book, Dumbbell, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import confetti from 'canvas-confetti'
import { Howl } from 'howler'

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
  { icon: <Sparkles className="w-4 h-4" />, text: "Nostalgic 80s pop hits for a retro party playlist" },
  { icon: <Music className="w-4 h-4" />, text: "Upbeat indie rock songs perfect for a summer road trip" },
  { icon: <Book className="w-4 h-4" />, text: "Calming instrumental tracks to enhance focus while studying" },
  { icon: <Zap className="w-4 h-4" />, text: "Smooth jazz compositions for a relaxing evening at home" },
  { icon: <Dumbbell className="w-4 h-4" />, text: "High-energy electronic music to fuel an intense workout" }
]

export default function SpotifyAIRecommender() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedTrackId, setFocusedTrackId] = useState<string | null>(null)
  const [apiLimited, setApiLimited] = useState(false)
  const [choiceSummary, setChoiceSummary] = useState<string | null>(null)
  const [timerProgress, setTimerProgress] = useState(100)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const soundRef = useRef<Howl | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
      }
      clearTimer()
    }
  }, [])

  useEffect(() => {
    if (tracks.length > 0) {
      handleAudioChange()
    }
  }, [currentTrackIndex, tracks])

  const handleAudioChange = () => {
    if (soundRef.current) {
      soundRef.current.unload()
    }

    const currentTrack = tracks[currentTrackIndex]
    if (currentTrack.preview_url) {
      soundRef.current = new Howl({
        src: [currentTrack.preview_url],
        html5: true,
        volume: isMuted ? 0 : volume,
        onplay: () => {
          setIsPlaying(true);
          setError(null); // Clear the error when play is successful
        },
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onend: handleTrackEnd,
        onloaderror: () => setError("Failed to load audio. This track may not be available for preview."),
        onplayerror: () => setError("Playback failed. This track may not be available for preview."),
      })

      soundRef.current.play()
    } else {
      setError("Preview not available for this track.")
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const updateProgress = () => {
      if (soundRef.current && soundRef.current.playing()) {
        setCurrentTime(soundRef.current.seek() as number)
      }
    }

    const progressInterval = setInterval(updateProgress, 1000)

    return () => clearInterval(progressInterval)
  }, [])

  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const fetchTracks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isTimerRunning) return

    setError(null)
    setTracks([])
    setCurrentTrackIndex(0)
    setIsPlaying(false)
    setIsLoading(true)
    setApiLimited(false)
    setChoiceSummary(null)
    if (soundRef.current) {
      soundRef.current.unload()
    }

    startTimer()

    try {
      const response = await fetch('/api/suggest-songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( query ),
      })
      const data = await response.json()
      if (response.ok && data.tracks) {
        if (data.tracks.length > 0) {
          setTracks(data.tracks)
          setChoiceSummary(data.Choicesummary)
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0
          }
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        } else {
          setError('No tracks found. Please try a different query.')
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
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause()
      } else {
        soundRef.current.play()
      }
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

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (soundRef.current) {
      soundRef.current.mute(!isMuted)
    }
  }

  const copyExampleToTextarea = (text: string) => {
    setQuery(text)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const startTimer = () => {
    setIsTimerRunning(true)
    setTimerProgress(100)
    clearTimer()
    timerRef.current = setInterval(() => {
      setTimerProgress(prev => {
        if (prev <= 0) {
          clearTimer()
          return 0
        }
        return prev - (100 / 30)
      })
    }, 1000)
  }

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTimerRunning(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] text-white">
      <div className="flex-1 flex flex-col p-6 pb-32">
        <div className="max-w-3xl mx-auto w-full mb-8">
          <h1 className="text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Spotify AI Recommender</h1>
          <form onSubmit={fetchTracks} className="mb-6">
            <Textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the music you like or how you're feeling..."
              className="w-full bg-[#2A2A2A] text-white border-[#444] resize-none mb-4 p-4 rounded-lg"
              rows={3}
            />
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {exampleInputs.map((input, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2A2A2A] rounded-full hover:bg-[#3A3A3A] transition-colors text-sm"
                    onClick={() => copyExampleToTextarea(input.text)}
                    type="button"
                  >
                    {input.icon}
                    <span className="hidden sm:inline">Example {index + 1}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center">
                <Button
                  type="submit"
                  className="bg-[#1DB954] hover:bg-[#1ED760] text-black font-semibold px-6 py-2 rounded-full relative overflow-hidden"
                  disabled={isLoading || isTimerRunning}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Get Recommendations
                    </>
                  )}
                  {isTimerRunning && (
                    <Progress
                      value={timerProgress}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20"
                      // indicatorClassName="bg-white"
                    />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <ScrollArea className="flex-1 px-[10%]" ref={scrollAreaRef}>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-600 text-white border-none rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {apiLimited && (
            <Alert className="mb-6 bg-yellow-600 text-white border-none rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">API Limit Reached</AlertTitle>
              <AlertDescription className="text-sm">Please try again in a few seconds.</AlertDescription>
            </Alert>
          )}

          {choiceSummary && (
            <div className="mb-6 p-4 bg-[#2A2A2A] rounded-lg border border-[#444] shadow-lg">
              <h2 className="text-xl font-semibold mb-2 text-green-400">AI Summary</h2>
              <p className="text-gray-300 leading-relaxed">{choiceSummary}</p>
            </div>
          )}

          {!isLoading && tracks.length === 0 && !error && !apiLimited && (
            <Alert className="mb-6 bg-blue-600 text-white border-none rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">No Tracks Found</AlertTitle>
              <AlertDescription className="text-sm">Try a different query or check back later.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                    className={`bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] hover:from-[#3A3A3A] hover:to-[#2A2A2A] transition-all cursor-pointer overflow-hidden rounded-xl shadow-lg ${
                      focusedTrackId === track.id ? 'ring-2 ring-[#1DB954]' : ''
                    }`}
                    onClick={() => {
                      setCurrentTrackIndex(index)
                      setFocusedTrackId(track.id)
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="relative w-full pt-[100%] group">
                        <Image
                          src={track.album.images[0]?.url || '/placeholder.svg'}
                          alt={`${track.name} album cover`}
                          fill
                          className="object-cover rounded-t-xl"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm truncate mb-1">{track.name}</h3>
                        <p className="text-xs text-gray-400 truncate mb-2">{track.artists.map(artist => artist.name).join(', ')}</p>
                        <div className="flex items-center justify-between">
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
                                      className={`focus:outline-none ${star <= (track.rating || 0) ? 'text-[#1DB954]' : 'text-gray-600'}`}
                                    >
                                      <Star className="h-4 w-4" />
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
                            <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                          )}
                        </div>
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
        <div className="h-28 bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] border-t border-[#333] flex items-center px-6 fixed bottom-0 left-0 right-0 shadow-lg">
          <div className="flex items-center flex-1">
            <div className="relative w-20 h-20 mr-4">
              <Image
                src={tracks[currentTrackIndex].album.images[0]?.url || '/placeholder.svg'}
                alt={`${tracks[currentTrackIndex].name} album cover`}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-base">{tracks[currentTrackIndex].name}</h4>
              <p className="text-sm text-gray-400">{tracks[currentTrackIndex].artists.map(artist => artist.name).join(', ')}</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center max-w-md">
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}>
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="mx-4 bg-white text-black rounded-full hover:scale-105 transition-transform" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => setCurrentTrackIndex(Math.min(tracks.length - 1, currentTrackIndex + 1))}>
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>
            <div className="w-full flex items-center text-xs">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                className="mx-2 flex-1"
                value={[currentTime]}
                max={30}
                step={1}
                onValueChange={(value) => {
                  if (soundRef.current) {
                    soundRef.current.seek(value[0])
                  }
                }}
              />
              <span className="w-10">0:30</span>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            <Slider
              className="w-24 ml-2"
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                setVolume(value[0])
                setIsMuted(value[0] === 0)
                if (soundRef.current) {
                  soundRef.current.volume(value[0])
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}