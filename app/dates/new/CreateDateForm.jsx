'use client'
import {useEffect, useState} from 'react'
import { db, COL_DATES, ID, ODKE_DB, COL_REFS, Query } from '@/app/utils/appwrite'
import { useRouter } from 'next/navigation';

export default function CreateDateForm() {

    const [date, setDate] = useState(new Date())
    //const [refs, setRefs] = useState([])
    // const getAllRefs = async () => {

    //   try {
    //     const res = (await db.listDocuments(ODKE_DB,COL_REFS, [ Query.select('user_id')])).documents
    //     let refIds = []
    //     res.map(r=> refIds.push(r.user_id))
    //     setRefs(refIds)
        
    //   } catch (error) {
    //     console.log('Get all refs error', error.message);
    //   }

    // }

    // useEffect(()=>{
    //   getAllRefs()
    // },[])

    //console.log("All refs are: ",refs[0]);

    const today = new Date();
    const nextFiveDays = new Date(today.setDate(today.getDate() + 7));

    const handleCreateDate = async (e) => {
        try {
            e.preventDefault()
            await db.createDocument(ODKE_DB,COL_DATES,ID.unique(), {
              date: date, 
              //referees:refs
            })
            router.push('/dates')
            router.refresh('/dates')
        } catch (error) {
            if(error.code===409){
                alert('DATE EXISTS. TRY A NEW DATE')
            } else {
                console.log(error.message);
            }
        }
        
    }

  return (
    <>
  <form onSubmit={handleCreateDate} className="w-full max-w-md">
    <div className="mb-4">
      <label htmlFor="newDate" className="block text-gray-700 text-sm font-bold mb-2">Επιλέξετε Ημερομηνία</label>
      <input
        type="date"
        min={nextFiveDays.toISOString().split("T")[0]}
        id="newDate"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Δημιουργία</button>
  </form>
</>

  )
}
