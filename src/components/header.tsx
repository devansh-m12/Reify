import { auth } from "@/auth"
import { serverSignIn, serverSignOut } from "@/actions/authActions"

export default async function Header() {
  const session = await auth()

  return (
    <nav>
      <div className="nav-title">Reify</div>
      <div>Welcome {session?.user?.name}</div>
      <div>
        {session ? (
          <form action={serverSignOut}>
          <button type="submit">Sign Out</button>
        </form>
        ) : (
            <form action={serverSignIn}>
            <button type="submit">Sign In</button>
          </form>
        )}
      </div>
    </nav>
  )
}