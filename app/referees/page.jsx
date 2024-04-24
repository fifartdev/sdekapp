'use client'
import React, {useEffect, useState }from 'react'
import { ODKE_DB, COL_REFS, db, Query } from '../utils/appwrite'
import Link from 'next/link'

    function pageReferees() {
    
        const[refs,setRefs]=useState([])
        const[drefs,setDrefs]=useState([])
        const getRefs = async ()=> {
            try {
            
            const res = await db.listDocuments(ODKE_DB, COL_REFS, [Query.limit(200), 
                Query.notEqual('index',["301"]),
                Query.notEqual('index',["302"]),
                Query.notEqual('index',["303"]),
                Query.notEqual('index',["304"]),
                Query.notEqual('index',["305"]),
                Query.notEqual('index',["306"]),
                Query.notEqual('index',["307"])
            ]
            
            )
            const dres = await db.listDocuments(ODKE_DB, COL_REFS, [Query.limit(200), 
                Query.equal('index',["301","302","303","304","305","306","307"]),
                
            ]
            
            )

            setRefs(res.documents)
            setDrefs(dres.documents)    
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
            { refs?.map((r)=>{
                return (
                    <li key={r.$id} style={{margin: 14}}><Link href={`/referees/${r.$id}`} style={{backgroundColor:'#eee',border:1,borderColor:'grey', padding:4, marginBottom:15, borderRadius:5}}>{r.index} {r.name}</Link></li>
                )
            }) }
        </ul>
        <h1 className="text-lg font-bold mb-2">ΛΙΣΤΑ ΑΝΕΝΕΡΓΩΝ ΔΙΑΙΤΗΤΩΝ</h1>
        <ul>
            { drefs?.map((d)=>{
                return (
                    <li key={d.$id} style={{margin: 14}}><Link href={`/referees/${d.$id}`} style={{backgroundColor:'#eee',border:1,borderColor:'grey', padding:4, marginBottom:15, borderRadius:5}}>{d.name}</Link></li>
                )
            }) }
        </ul>
    </div>
    </main>
  )
}

export default pageReferees