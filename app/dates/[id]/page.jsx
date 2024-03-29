import React from 'react'
import Link from 'next/link'
import { COL_DATES, COL_REFS, ODKE_DB, db, Query } from '@/utils/appwrite'
import CreateMatchForm from './CreateMatchForm'


async function pageDate({params}) {
   
  const currentDate = await db.getDocument(ODKE_DB, COL_DATES, params.id)
  const hDate = new Date(currentDate.date).toLocaleDateString('el-GR')

  const data = currentDate.match.map((m) => m.teams)
 // data?.map((t,index)=>console.log('P', data[index][0].name, data[index][1].name))
  const refsIds = currentDate.referees
  //console.log('ALL REFS IDS ',refsIds);
  const res = await db.listDocuments(ODKE_DB, COL_REFS, [ Query.equal('user_id', refsIds) ])
  const refsInDate = res.documents
  //console.log('ALL REFS IN THIS DATE ',refsInDate);

  return (
    <>
    <Link href={'/dates'}>Back to All Dates</Link>
    <div>{hDate}</div>
    <CreateMatchForm date={currentDate.date} dateId={params.id}/>
    { data && 
    <>
    <h1>This Date's Matches Are</h1>
    <ul>
       {
        data?.map((t,index)=> {
          return (<li>{data[index][0].name} - {data[index][1].name}</li>)
        })
      }    
      </ul>
    </>
    }
    <>
    <h2>All Refs in this Date</h2>
    <ul>
      {refsInDate?.map((r)=>{
        return (
          <li>{r.name}</li>
        )
      })}
    </ul>
    </>
    </>
  )
}

export default pageDate