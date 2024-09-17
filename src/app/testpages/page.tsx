'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Music, Sparkles, Zap, Heart, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const features = [
  { icon: <Music className="w-6 h-6" />, title: "Describe Your Mood", description: "Tell us how you're feeling or what kind of music you're in the mood for." },
  { icon: <Sparkles className="w-6 h-6" />, title: "AI Magic", description: "Our AI analyzes your input and finds the perfect tracks to match your vibe." },
  { icon: <Zap className="w-6 h-6" />, title: "Instant Playlist", description: "Get a curated playlist of songs that fit your description in seconds." },
  { icon: <Heart className="w-6 h-6" />, title: "Rate and Refine", description: "Rate the songs to help our AI learn your preferences for even better recommendations." },
]

export default function Component() {
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number }[]>([])

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      }))
      setStars(newStars)
    }

    generateStars()
    const interval = setInterval(generateStars, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#191414] text-[#FFFFFF] relative overflow-hidden flex items-center justify-center p-4">
      <AnimatePresence>
        {stars.map((star, index) => (
          <motion.div
            key={index}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: star.opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        ))}
      </AnimatePresence>
      
      <Card className="w-full max-w-4xl bg-[#181818] bg-opacity-90 border-none shadow-lg relative z-10 backdrop-blur-sm">
        <CardHeader>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#1DB954] to-[#1ED760]">
              Spotify AI Recommender
            </CardTitle>
            <CardDescription className="text-lg sm:text-xl text-[#B3B3B3] text-center mt-2">
              Discover your perfect playlist with the power of AI
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#282828]">
              <TabsTrigger value="features" className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-[#121212]">Features</TabsTrigger>
              <TabsTrigger value="how-it-works" className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-[#121212]">How It Works</TabsTrigger>
            </TabsList>
            <TabsContent value="features">
              <ScrollArea className="h-[300px] w-full rounded-md border border-[#282828] p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-[#282828] bg-opacity-50">
                        <CardContent className="p-4 text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex justify-center text-[#1DB954] mb-2">{feature.icon}</div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{feature.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <h3 className="text-lg font-semibold mb-2 text-[#FFFFFF]">{feature.title}</h3>
                          <p className="text-sm text-[#B3B3B3]">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="how-it-works">
              <ScrollArea className="h-[300px] w-full rounded-md border border-[#282828] p-4">
                <ol className="space-y-4 text-[#B3B3B3]">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <strong className="text-[#FFFFFF]">1. Input Your Preferences:</strong> Start by describing your mood, favorite genres, or the type of music you're looking for.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <strong className="text-[#FFFFFF]">2. AI Analysis:</strong> Our advanced AI processes your input, understanding the nuances of your musical preferences.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <strong className="text-[#FFFFFF]">3. Playlist Generation:</strong> Based on the analysis, a curated playlist is created just for you.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <strong className="text-[#FFFFFF]">4. Listen and Rate:</strong> Enjoy your personalized playlist and rate songs to help refine future recommendations.
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <strong className="text-[#FFFFFF]">5. Continuous Learning:</strong> Our AI learns from your ratings and listening habits to improve future suggestions.
                  </motion.li>
                </ol>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          <motion.div 
            className="flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button className="bg-[#1DB954] hover:bg-[#1ED760] text-[#121212] font-semibold px-6 py-2 rounded-full text-lg transition-colors duration-200">
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      <motion.div 
        className="absolute bottom-4 right-4 w-24 h-24 sm:w-32 sm:h-32"
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear",
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[#1DB954] to-[#1ED760] opacity-20"></div>
      </motion.div>
    </div>
  )
}