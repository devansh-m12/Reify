"use server"

import { auth, signIn, signOut } from "@/auth"

export async function getUser() {
    const session = await auth()
    return session?.user ?? null
}

export async function signInUser() {
    await signIn("spotify")
}

export async function signOutUser() {
    await signOut()
}