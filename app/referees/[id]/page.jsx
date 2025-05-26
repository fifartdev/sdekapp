'use client'

import React, {useEffect, useState} from 'react'
import Link from 'next/link'
import { ODKE_DB, db, COL_MATCHES, Query, COL_REFS } from '@/app/utils/appwrite'

const refereePage = (params) => {
    console.log('params are: ',params.params.id);
    
    const [matches, setMatches] = useState([])
    const [mdays, setMdays] = useState([])
    const [ref, setRef] = useState(null)
    // console.log(ref);

    const getRefMatches = async ()=> {
      try {
        const resp = await db.getDocument(ODKE_DB, COL_REFS, params.params.id)
        setRef(resp)
        if(resp){
          const res = await db.listDocuments(ODKE_DB, COL_MATCHES, [Query.contains('referees', [resp.name]), Query.orderDesc('fulldate')])
          const final = res.documents
          console.log('Data are', final);
          setMdays(final)
          const dts = final.map(d=>d.teams)
          //console.log(dts);
          setMatches(dts)      
        }
        
      } catch (error) {
        console.log('Error from Refs Page',error.message);
      }
    }


    

    useEffect(()=>{
      getRefMatches()
    },[])
    // console.log('Ref is', ref);
    // console.log('Refs Matches are: ', matches);

   
    // mdays.map((m,index)=>{
    //   console.log('Date is: ', m.fulldate);
    //   console.log('Time is: ', m.matchtime);
    //   console.log('Arena is: ', m.arena);
    //   console.log('Teams are');
    //   m.teams.map(t=>console.log(t.name));
    // })
    

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
        </Link>
      </div>
      </nav>
      <div className="text-xl font-bold mb-4 text-center mt-3"><Link style={{backgroundColor:'black',color:'white',padding:4, borderRadius:5}} href={'/referees'}>Πίσω</Link> - Σελίδα Διαιτητή: {ref?.name}</div>

<ul>
  {mdays?.map((m, index) => (
    <li key={index} className="bg-white shadow-md rounded-md p-4 mb-4">
      <span className='m-2'><b>Ημ/νία:</b> {new Date(m.fulldate).toLocaleDateString('el-Gr')}</span> 
      <span className='m-2'><b>Ώρα:</b> { m.matchtime}</span>
      <span className='m-2'><b>Γήπεδο:</b> { m.arena}</span>
      <span className='m-2'><b>Ομάδες:</b> { m.teams[0].name} - { m.teams[1].name }</span>
      <span  className={ref?.name === m.refA ? 'm-2 text-red-600 font-bold' : 'm-2'}><b>Διατητής Α:</b> {m.refA}</span>
      <span  className={ref?.name === m.refB ? 'm-2 text-red-600 font-bold' : 'm-2'}><b>Διατητής Β:</b> { m.refB }</span>
      <span className={ref?.name === m.komisario ? 'm-2 text-red-600 font-bold' : 'm-2'}><b>Κομισάριος:</b> { m.komisario }</span>

    </li>
  ))}
</ul>
    </div>
    </main>
  )
}

export default refereePage