import React from 'react'
import { db, ODKE_DB,COL_DATES, Query } from '@/utils/appwrite'
import Link from 'next/link'

const data = await db.listDocuments(ODKE_DB,COL_DATES, [Query.orderAsc('date')])
const matchDates = data.documents

export default function pageDate() {

  return (
    <>
    <div>All Match Dates</div>
    <Link href={"/"}>Home</Link> | <Link href={"/dates/new"}>add a date</Link>
    <ul>
        {matchDates.map(d=>{
            let hDate = new Date(d.date).toLocaleDateString('el-GR')
            return (
                <li><Link href={`/dates/${d.$id}`}>{hDate}</Link></li>
            )
        })}
    </ul>
    </>
  )
}
