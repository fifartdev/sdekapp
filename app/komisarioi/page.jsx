'use client'
import React, {useEffect, useState }from 'react'
import { ODKE_DB, COL_REFS, db, Query } from '../utils/appwrite'
import Link from 'next/link'
import ParticipationCounter from '../components/ParticipationCounter'

    function pageKom() {
        
        const [trial,setTrial] = useState([])
        const [isLoading,setisLoading] = useState(false)

        

        const getRefs = async ()=> {
            setisLoading(true)
            try {
            
            const trialRes = await db.listDocuments(ODKE_DB, COL_REFS, [
                Query.limit(100),
                Query.contains("category", ["ΔΟΚΙΜΟΣ", "ΚΟΜΙΣΑΡΙΟΣ"]),
                Query.equal('inactive',false)
            ] )

            setTrial(trialRes.documents)
            setisLoading(false)
        } catch (error) {
                console.log('Error from referees page: ', error.message);
            }
        }
        useEffect(()=>{
            getRefs()
            
        },[])

            console.log('Trials are: ', trial);
        
    
        if(isLoading){
            return (
                <main className="flex justify-center min-h-screen">
       <div className="w-full p-10">
       <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
  <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer m-3">Αρχική</span>
        </Link>|
        <Link href="/referees">
          <span className="font-semibold text-md tracking-tight cursor-pointer m-3">Διαιτητές</span>
        </Link>
        <Link href="/komisarioi">
          <span className="font-semibold text-md tracking-tight cursor-pointer m-3">Κομισάριοι</span>
        </Link>
      </div>
      </nav>
      <div className="w-12 h-12 border-8 border-blue-500 border-solid border-t-transparent rounded-full animate-spin mt-5 ml-5"></div>
      </div>
      </main>
            )
        }


  
    return (

        <main className="flex justify-center min-h-screen">
       <div className="w-full p-10">
       <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
  <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer m-3">Αρχική</span>
        </Link>|
        <Link href="/referees">
          <span className="font-semibold text-md tracking-tight cursor-pointer m-3">Διαιτητές</span>
        </Link>
         <Link href="/komisarioi">
          <span className="font-semibold text-md tracking-tight cursor-pointer m-3">Κομισάριοι</span>
        </Link>
      </div>
      </nav>
        <h1 className='text-2xl text-center font-semibold my-3'>«ΙΣΤΟΡΙΚΟ ΟΡΙΣΜΩΝ ΚΟΜΙΣΑΡΙΩΝ»</h1>
        
       {trial.length > 0 && <h1 className="text-lg font-bold mb- mt-5">ΚΟΜΙΣΑΡΙΟΙ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { trial?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/komisarioi/${r.$id}`}>{i+1}. <span className='text-red-600 font-bold'>{r.name}</span></Link><ParticipationCounter id={r.$id} year={'2025-26'} start={'2025-11-01T00:00:00.000+00:00'} end={'2026-06-01T00:00:00.000+00:00'}/> <ParticipationCounter id={r.$id} year={'2024-25'} start={'2024-11-01T00:00:00.000+00:00'} end={'2025-06-01T00:00:00.000+00:00'}/> <ParticipationCounter id={r.$id} year={'2023-24'} start={'2023-11-01T00:00:00.000+00:00'} end={'2024-06-01T00:00:00.000+00:00'}/></li>
                )
            }) }
        </ul>
    </div>
    </main>
  )
}

export default pageKom