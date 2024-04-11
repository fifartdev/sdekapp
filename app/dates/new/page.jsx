import React from 'react'
import CreateDateForm from './CreateDateForm'
import Link from 'next/link'

export default function newDate() {

  

  return (
    <main className="flex justify-center min-h-screen">
       <div className="w-full p-4">
    <Link href={'/'} className="text-blue-500 hover:underline">Αρχική</Link>
    <div className="text-lg font-bold mt-4 mb-2">Νέα Αγωνιστική </div>
    <div className="italic mt-4 mb-2">(Η ημερομηνία δεν μπορεί να είναι καμία νωρίτερα από 7 ημέρες από τη σημερινή.)</div>
    <div className="w-full max-w-md">
      <CreateDateForm />
    </div>
  </div>
  </main>
  
  )
}
