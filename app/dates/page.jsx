'use client'
import React, { useEffect, useState } from 'react'
import { db, ODKE_DB,COL_DATES, Query } from '@/app/utils/appwrite'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'




export default function pageDates() {

  const [matchDates, setMatchDates] = useState([])
  const { user, handleLogout, isUserAdmin } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false);
  // const createQueryString = (name, value) => {
  //   const params = new URLSearchParams();
  //   params.set(name, value);

  //   return params.toString();
  // };
  const getData = async () => {

    try {
      const res = await db.listDocuments(ODKE_DB,COL_DATES, [Query.orderAsc('date')])
      setMatchDates(res.documents)
      
    } catch (error) {
      console.log('Err Dates: ', error.message);
    }

  }

  useEffect(()=>{
    getData()
  },[])

  if(!user){
    redirect('/')
  }

  

  return (
    <main className="flex justify-center min-h-screen">
       <div className="w-full p-10">
    <div>Ημερομηνίες Αγώνων</div>
    {/* <div className="flex items-center">
      <Link href={"/"} className="text-blue-500 hover:underline">Αρχική</Link>
      {isUserAdmin && (
        <>
          <span>|</span>
          <Link href={"/dates/new"} className="text-blue-500 hover:underline">Προσθήκη Αγωνιστικής Ημέρας</Link>
          <span className="text-gray-500">|</span>
      <Link href={"/arenas"} className="text-blue-500 hover:underline mx-2">Γήπεδα</Link>
      <span className="text-gray-500">|</span>
      <Link href={"/teams"} className="text-blue-500 hover:underline mx-2">Ομάδες</Link>
      <span className="text-gray-500">|</span>
      <Link href={"/refs"} className="text-blue-500 hover:underline mx-2">Διαιτητές</Link>
        </>
      )}
      <span>|</span>
      <Link href={'/ref'} className="text-blue-500 hover:underline">Σελίδα Χρήστη</Link>
      <span>|</span>
      <button onClick={handleLogout} className="text-blue-500 hover:underline">Αποσύνδεση</button>
    </div> */}
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
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {matchDates.map(d => {
        let hDate = new Date(d.date).toLocaleDateString('el-GR');
        return (
          <li key={d.$id} className="bg-white rounded-lg shadow-md p-4" >
            <button className="rounded-lg p-4" onClick={() => { router.push(`/dates/${d.$id}`) }}>{hDate}</button>
          </li>
        );
      })}
    </ul>
  
  </div>
  </main>
  )
}


