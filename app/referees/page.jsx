'use client'
import React, {useEffect, useState }from 'react'
import { ODKE_DB, COL_REFS, db, Query } from '../utils/appwrite'
import Link from 'next/link'
import ParticipationCounter from '../components/ParticipationCounter'

    function pageReferees() {
        const [inter,setInter] = useState([])
        const [acat,setAcat] = useState([])
        const [bcat,setBcat] = useState([])
        const [trial,setTrial] = useState([])
        const [isLoading,setisLoading] = useState(false)
        ////////Ιnactive Queries
        const [interInact,setInterInact] = useState([])
        const [acatInact,setAcatInact] = useState([])
        const [bcatInact,setBcatInact] = useState([])


        

        const getRefs = async ()=> {
            setisLoading(true)
            try {
            
            const intRes = await db.listDocuments(ODKE_DB, COL_REFS, [
                Query.limit(100),
                Query.contains("category", "ΔΙΕΘΝΗΣ"),
                Query.equal('inactive',false)
            ] )
            const acatRes = await db.listDocuments(ODKE_DB, COL_REFS,[
                Query.limit(100),
                Query.contains("category", "Α ΚΑΤΗΓΟΡΙΑ"),
                Query.equal('inactive',false)
            ] )
            const bcatRes = await db.listDocuments(ODKE_DB, COL_REFS,[
                Query.limit(100),
                Query.contains("category", "Β ΚΑΤΗΓΟΡΙΑ"),
                Query.equal('inactive',false)
            ] )
            const trialRes = await db.listDocuments(ODKE_DB, COL_REFS, [
                Query.limit(100),
                Query.contains("category", "ΔΟΚΙΜΟΣ"),
                Query.equal('inactive',false)
            ] )
            const intInactRes = await db.listDocuments(ODKE_DB, COL_REFS, [
                Query.limit(100),
                Query.contains("category", "ΔΙΕΘΝΗΣ"),
                Query.equal('inactive',true)
            ] )
            const acatInactRes = await db.listDocuments(ODKE_DB, COL_REFS,[
                Query.limit(100),
                Query.contains("category", "Α ΚΑΤΗΓΟΡΙΑ"),
                Query.equal('inactive',true)
            ] )
            const bcatInactRes = await db.listDocuments(ODKE_DB, COL_REFS,[
                Query.limit(100),
                Query.contains("category", "Β ΚΑΤΗΓΟΡΙΑ"),
                Query.equal('inactive',true)
            ] )


            setInter(intRes.documents)
            setAcat(acatRes.documents)
            setBcat(bcatRes.documents)
            setTrial(trialRes.documents)

            ////////Inactive 
            setInterInact(intInactRes.documents)
            setAcatInact(acatInactRes.documents)
            setBcatInact(bcatInactRes.documents)
            setisLoading(false)
        } catch (error) {
                console.log('Error from referees page: ', error.message);
            }
        }
        useEffect(()=>{
            getRefs()
            
        },[])

        console.log('Internationals are: ', inter);
            console.log('A Category are: ', acat);
            console.log('B Category are: ', bcat);
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
      </div>
      </nav>
          { inter.length > 0 && <h1 className="text-lg font-bold mb-2 mt-5">ΔΙΕΘΝΕΙΣ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { inter?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. <span className='text-red-600 font-bold'>{r.name}</span></Link> <ParticipationCounter id={r.$id} year={'2024-25'} start={'2024-11-01T00:00:00.000+00:00'} end={'2025-06-01T00:00:00.000+00:00'}/> <ParticipationCounter id={r.$id} year={'2023-24'} start={'2023-11-01T00:00:00.000+00:00'} end={'2024-06-01T00:00:00.000+00:00'}/></li>
                )
            }) }
        </ul>
        { inter.length > 0 && <h1 className="text-lg font-bold mb-2 mt-5">Α ΚΑΤΗΓΟΡΙΑ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { acat?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. <span className='text-red-600 font-bold'>{r.name}</span></Link> <ParticipationCounter id={r.$id} year={'2024-25'} start={'2024-11-01T00:00:00.000+00:00'} end={'2025-06-01T00:00:00.000+00:00'}/> <ParticipationCounter id={r.$id} year={'2023-24'} start={'2023-11-01T00:00:00.000+00:00'} end={'2024-06-01T00:00:00.000+00:00'}/></li>
                )
            }) }
        </ul>
       {inter.length > 0 && <h1 className="text-lg font-bold mb-2 mt-5">Β ΚΑΤΗΓΟΡΙΑ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { bcat?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. <span className='text-red-600 font-bold'>{r.name}</span></Link> <ParticipationCounter id={r.$id} year={'2024-25'} start={'2024-11-01T00:00:00.000+00:00'} end={'2025-06-01T00:00:00.000+00:00'}/> <ParticipationCounter id={r.$id} year={'2023-24'} start={'2023-11-01T00:00:00.000+00:00'} end={'2024-06-01T00:00:00.000+00:00'}/></li>
                )
            }) }
        </ul>
       {inter.length > 0 && <h1 className="text-lg font-bold mb- mt-5">ΔΟΚΙΜΟΙ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { trial?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. <span className='text-red-600 font-bold'>{r.name}</span></Link> <ParticipationCounter id={r.$id} year={'2024-25'} start={'2024-11-01T00:00:00.000+00:00'} end={'2025-06-01T00:00:00.000+00:00'}/> <ParticipationCounter id={r.$id} year={'2023-24'} start={'2023-11-01T00:00:00.000+00:00'} end={'2024-06-01T00:00:00.000+00:00'}/></li>
                )
            }) }
        </ul>
      {acatInact.length > 0 &&  <h1 className="text-2xl font-bold mb-2 mt-5">ΛΙΣΤΑ ΑΝΕΝΕΡΓΩΝ ΔΙΑΙΤΗΤΩΝ</h1> }
       { interInact.length > 0 && <h1 className="text-lg font-bold mb-2 mt-5">ΔΙΕΘΝΕΙΣ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { interInact?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. {r.name}</Link></li>
                )
            }) }
        </ul>
        { acatInact.length > 0 && <h1 className="text-lg font-bold mb-2 mt-5">Α ΚΑΤΗΓΟΡΙΑ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { acatInact?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. {r.name}</Link></li>
                )
            }) }
        </ul>
        { bcatInact.length > 0 && <h1 className="text-lg font-bold mb-2 mt-5">Β ΚΑΤΗΓΟΡΙΑ</h1> }
        <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-4" >
            { bcatInact?.map((r, i=0)=>{
                return (
                    <li key={r.$id} className="bg-white rounded-lg shadow-md p-4"><Link href={`/referees/${r.$id}`}>{i+1}. {r.name}</Link></li>
                )
            }) }
        </ul>
    </div>
    </main>
  )
}

export default pageReferees