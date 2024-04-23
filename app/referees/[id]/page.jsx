'use client'

import React, {useEffect, useState} from 'react'
import Link from 'next/link'
import { ODKE_DB, db, COL_MATCHES, Query, COL_REFS } from '@/app/utils/appwrite'

const refereePage = (params) => {
    console.log('params are: ',params.params.id);
    
    const [matches, setMatches] = useState([])
    const [mdays, setMdays] = useState([])
    const [ref, setRef] = useState(null)

    console.log(ref);

    const getRefMatches = async ()=> {
      try {
        const resp = await db.getDocument(ODKE_DB, COL_REFS, params.params.id)
        setRef(resp)
        if(resp){
          const res = await db.listDocuments(ODKE_DB, COL_MATCHES, [Query.contains('referees', [resp.name]), Query.orderAsc('fulldate')])
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
      <div className="text-xl font-bold mb-4 text-center"><Link style={{backgroundColor:'black',color:'white',padding:4, borderRadius:5}} href={'/referees'}>Πίσω</Link> - Σελίδα Διαιτητή: {ref?.name}</div>

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
    </div>
    </main>
  )
}

export default refereePage