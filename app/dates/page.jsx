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
    <div className="flex items-center">
      <Link href={"/"} className="text-blue-500 hover:underline">Αρχική</Link>
      {isUserAdmin && (
        <>
          <span>|</span>
          <Link href={"/dates/new"} className="text-blue-500 hover:underline">Προσθήκη Αγωνιστικής Ημέρας</Link>
        </>
      )}
      <span>|</span>
      <Link href={'/ref'} className="text-blue-500 hover:underline">Σελίδα Χρήστη</Link>
      <span>|</span>
      <button onClick={handleLogout} className="text-blue-500 hover:underline">Αποσύνδεση</button>
    </div>
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


