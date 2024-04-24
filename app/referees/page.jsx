'use client'
import React, {useEffect, useState }from 'react'
import { ODKE_DB, COL_REFS, db } from '../utils/appwrite'
import Link from 'next/link'

    function pageReferees() {
    
        const[refs,setRefs]=useState([])
        const getRefs = async ()=> {
            try {
            const res = await db.listDocuments(ODKE_DB, COL_REFS)
            setRefs(res.documents)
            } catch (error) {
                console.log('Error from referees page: ', error.message);
            }
        }

        useEffect(()=>{
            getRefs()
        },[])

  
    return (

        <main className="flex justify-center min-h-screen">
        <div className="w-full p-10 justify-center text-center">
            <h1 className="text-lg font-bold mb-2">ΛΙΣΤΑ ΔΙΑΙΤΗΤΩΝ</h1>
        <ul>
            { refs.map((r)=>{
                return (
                    <li key={r.$id} style={{margin: 14}}><Link href={`/referees/${r.$id}`} style={{backgroundColor:'#eee',border:1,borderColor:'grey', padding:4, marginBottom:15, borderRadius:5}}>{r.name}</Link></li>
                )
            }) }
        </ul>
    </div>
    </main>
  )
}

export default pageReferees