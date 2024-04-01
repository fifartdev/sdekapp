'use client'
import { useAuth } from '@/app/contexts/AuthContext'
import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const refPage = () => {

    const {user, isUserAdmin, handleLogout} = useAuth()

    if(!user){
        redirect('/')
      }

    return (
      <main className="flex justify-center min-h-screen">
      <div className="w-full p-10">
      <div className="text-xl font-bold mb-4">Σελίδα Χρήστη</div>
<div className="flex items-center">
  <Link href={"/"} className="text-blue-500 hover:underline mr-2">Αρχική</Link>
  {isUserAdmin && (
    <>
      <span className="text-gray-500">|</span>
      <Link href={"/dates/new"} className="text-blue-500 hover:underline mx-2">Προσθήκη Αγωνιστικής Ημέρας</Link>
    </>
  )}
  <span className="text-gray-500">|</span>
  <Link href={'/ref'} className="text-blue-500 hover:underline mx-2">Σελίδα Χρήστη</Link>
  <span className="text-gray-500">|</span>
  <button onClick={handleLogout} className="text-blue-500 hover:underline ml-2">Αποσύνδεση</button>
</div>
<div className="text-xl font-bold mt-4">Προφίλ {user.name}</div>

    </div>
    </main>
  )
}

export default refPage