"use client"
import { useSession } from "next-auth/react"
import { signInUser, signOutUser } from "@/actions/userActions"

export default function Header() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>

  return (
    <nav>
      <div className="nav-title">Reify</div>
      <div>Welcome {session?.user?.name}</div>
      <div>
        {session ? (
          <button onClick={() => signOutUser()}>Sign Out</button>
        ) : (
          <button onClick={() => signInUser()}>Sign In</button>
        )}
      </div>
    </nav>
  )
}