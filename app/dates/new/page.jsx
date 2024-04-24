'use client'
import React from 'react'
import CreateDateForm from './CreateDateForm'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { useState } from 'react'

export default function newDate() {
  const { user, isUserAdmin, handleLogout } = useAuth()
  const [isOpen, setIsOpen] = useState(false);
  

  return (
    <main className="flex justify-center min-h-screen">
       <div className="w-full p-10">
       <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
      <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer">Αρχική</span>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-white hover:border-white"
        >
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1z"
            />
          </svg>
        </button>
      </div>
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } w-full block flex-grow lg:flex lg:items-center lg:w-auto`}
      >
        <div className="text-sm lg:flex-grow">
        {isUserAdmin && (
          <>
          <Link href="/dates/new">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 cursor-pointer">
              Προσθήκη Αγωνιστικής Ημέρας
            </span>
          </Link>
          <Link href="/arenas">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 cursor-pointer">
              Γήπεδα
            </span>
          </Link>
          <Link href="/teams">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 cursor-pointer">
              Ομάδες
            </span>
          </Link>
          <Link href="/refs">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white cursor-pointer">
              Διαιτητές
            </span>
          </Link>
          </>)}
          <Link href="/ref">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 ml-4 cursor-pointer">
              Σελίδα Χρήστη
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white cursor-pointer"
          >
            Αποσύνδεση
          </button>
        </div>
      </div>
    </nav>
    <div className="text-lg font-bold mt-4 mb-2">Νέα Αγωνιστική </div>
    <div className="italic mt-4 mb-2">(Η ημερομηνία δεν μπορεί να είναι καμία νωρίτερα από 7 ημέρες από τη σημερινή.)</div>
    <div className="w-full max-w-md">
      <CreateDateForm />
    </div>
  </div>
  </main>
  
  )
}
