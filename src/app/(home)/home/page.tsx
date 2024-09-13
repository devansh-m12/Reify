import { auth } from "@/auth"

 
export default async function UserAvatar() {
  const session = await auth()
  console.log(session)
 
  if (!session?.user) return <>please login</>
 
  return (
    <div>
      <img src={session?.user?.image ?? ""} alt="User Avatar" />
    </div>
  )
}