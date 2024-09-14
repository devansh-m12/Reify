"use server"

import { signIn, signOut } from "@/auth"

export async function serverSignIn() {
  await signIn('spotify')
}

export async function serverSignOut() {
  await signOut()
}