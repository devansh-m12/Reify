import { auth } from "@/auth"
import { serverSignIn, serverSignOut } from "@/actions/authActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Music, Search, Library, User, Mic2 } from "lucide-react"
import Link from "next/link"

export default async function Header() {
  const session = await auth()

  return (
    <header className="bg-gradient-to-r from-[#1E1E1E]/80 via-[#2A2A2A]/80 to-[#121212]/80 p-4 sticky top-0 z-50 backdrop-blur-lg border-b border-white/5">
      <nav className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <Music className="relative h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 animate-gradient-x">
            Spotify AI Recommender
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <NavItem icon={<Search />} text="Discover" href="/discover" />
          <NavItem icon={<Library />} text="Library" href="/library" />
          <NavItem icon={<Mic2 />} text="AI Recommender" href="/" />
        </div>
        
        <div className="flex items-center space-x-4">
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Hi, {session.user?.name}</span>
              <Avatar className="h-8 w-8 ring-2 ring-[#1DB954] ring-offset-2 ring-offset-[#121212] transition-all duration-300 ease-in-out hover:ring-blue-500">
                <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? ""} />
                <AvatarFallback>{session.user?.name?.[0] ?? <User />}</AvatarFallback>
              </Avatar>
              <form action={serverSignOut}>
                <Button type="submit" variant="ghost" className="text-sm hover:text-[#1DB954] transition-colors duration-300">
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <form action={serverSignIn}>
              <Button type="submit" className="bg-[#1DB954] hover:bg-[#1ED760] text-black font-semibold rounded-full px-6 py-2 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-[#1DB954]/50">
                Sign In
              </Button>
            </form>
          )}
        </div>
      </nav>
    </header>
  )
}

function NavItem({ icon, text, href }: { icon: React.ReactNode; text: string; href: string }) {
  return (
    <Link href={href} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group">
      <span className="transform group-hover:scale-110 transition-transform duration-300">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </Link>
  )
}