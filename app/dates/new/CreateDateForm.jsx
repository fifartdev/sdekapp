'use client'
import {useState} from 'react'
import { db, COL_DATES, ID, ODKE_DB } from '@/utils/appwrite'
import { useRouter } from 'next/navigation';

export default function CreateDateForm() {

    const [date, setDate] = useState(new Date())
    const router = useRouter()

    const handleCreateDate = async (e) => {
        try {
            e.preventDefault()
            await db.createDocument(ODKE_DB,COL_DATES,ID.unique(), {date: date})
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
    <div>CreateDateForm</div>
    <form onSubmit={handleCreateDate}>
  <div>
    <label htmlFor="newDate">Επιλέξετε Ημερομηνία</label>
    <input
      type="date"
      id="newDate"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      required
    />
    </div>
    <button type="submit">Δημιουργία</button>
    </form>
    </>
  )
}
