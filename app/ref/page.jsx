'use client'
import { useAuth } from '@/app/contexts/AuthContext'
import React, {useEffect, useState} from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ODKE_DB, db, COL_MATCHES, Query } from '../utils/appwrite'

const refPage = () => {

    const {user, isUserAdmin, handleLogout} = useAuth()
    const [matches, setMatches] = useState([])
    const [mdays, setMdays] = useState([])

    const getRefMatches = async ()=> {
      try {
        const res = await db.listDocuments(ODKE_DB, COL_MATCHES, [Query.contains('referees', [user.name])])
        const final = res.documents
        console.log('Data are', final);
        setMdays(final)
        const dts = final.map(d=>d.teams)
        console.log(dts);
        setMatches(dts)      
        
      } catch (error) {
        console.log('Error from Refs Page',error.message);
      }
    }

    
    if(!user){
      redirect('/')
    }
    

    useEffect(()=>{
      getRefMatches()
    },[])

    console.log('Refs Matches are: ', matches);

    // matches.map((i)=>{
    //   return(
        
    //     console.log(i[0].name,'-',i[1].name)
    //   )
    // })
    mdays.map((m,index)=>{
      console.log('Date is: ', m.fulldate);
      console.log('Time is: ', m.matchtime);
      console.log('Arena is: ', m.arena);
      console.log('Teams are');
      m.teams.map(t=>console.log(t.name));
    })
    

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
<div className="text-xl font-bold mt-4">Προφίλ {user?.name}</div>
{ !isUserAdmin &&
<ul>
  {mdays?.map((m, index) => (
    <li key={index} className="bg-white shadow-md rounded-md p-4 mb-4">
      <span className='m-2'><b>Ημ/νία:</b> {new Date(m.fulldate).toLocaleDateString('el-Gr')}</span> 
      <span className='m-2'><b>Ώρα:</b> { m.matchtime}</span>
      <span className='m-2'><b>Γήπεδο:</b> { m.arena}</span>
      <span className='m-2'><b>Ομάδες:</b> { m.teams[0].name} - { m.teams[1].name }</span>
    </li>
  ))}
</ul>
}
    </div>
    </main>
  )
}

export default refPage