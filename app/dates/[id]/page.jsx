import React from 'react'
import Link from 'next/link'
import { COL_DATES, ODKE_DB, db } from '@/utils/appwrite'
import CreateMatchForm from './CreateMatchForm'


async function pageDate({params}) {
   
  const currentDate = await db.getDocument(ODKE_DB, COL_DATES, params.id)
  const hDate = new Date(currentDate.date).toLocaleDateString('el-GR')

  const data = currentDate.match.map((m) => m.teams)

 // data?.map((t,index)=>console.log('P', data[index][0].name, data[index][1].name))



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
    </>
  )
}

export default pageDate