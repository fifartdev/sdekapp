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
    <>
    <div>All Match Dates</div>
    <Link href={"/"}>Home</Link> | { isUserAdmin && <><Link href={"/dates/new"}>add a date</Link> |</> } <button onClick={handleLogout}>Logout</button>
    <ul>
        {matchDates.map(d=>{
            let hDate = new Date(d.date).toLocaleDateString('el-GR')
            return (
                <li key={d.$id}><button onClick={()=>{ router.push(`/dates/${d.$id}`)}}>{hDate}</button></li>
            )
        })}
    </ul>
    </>
  )
}


