'use client'
import { redirect, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ODKE_DB, db, COL_MATCHES } from '@/app/utils/appwrite'
import Link from 'next/link'


const editMatchPage = ({params})=>{
    const { user } = useAuth()
    const [match,setMatch] = useState({})
    const router = useRouter()
    const [time,setTime] = useState('')

    const getMatchData = async ()=>{
        try {
            const res = await db.getDocument(ODKE_DB,COL_MATCHES,params.id)
            setTime(res.matchtime)
            setMatch(res)
            console.log('RESPONSE IS: ', res);
        } catch (error) {
            console.log('Error on Match Page', error.message);
        }   
    }


    // END OF REMOVE REFS FROM MATCHES FUNCTIONS
    useEffect(()=>{
        getMatchData()
    },[])
    
    let date = new Date(match.fulldate).toLocaleDateString('el-GR')

   
    const handleUpdateTime = async (e)=> {
        e.preventDefault()
        try {
            if(params.id){
                await db.updateDocument(ODKE_DB, COL_MATCHES, params.id, { matchtime: time })
            }
            router.push(`/matches/${params.id}`)
        } catch (error) {
            
        }

    }

    if(!user){
        redirect('/')
      }

    return (
        <main className="flex justify-center min-h-screen">
        <div className="w-full text-center p-10">
        <div className='flex justify-center bg-cyan-500 p-5 mb-10'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
        <button onClick={()=>router.back()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >Πίσω στην Αγωνιστική</button>
        <div className="bg-white shadow-md rounded-md p-4 mb-4">
  <h1 className="text-lg font-bold mb-2">{date}</h1>
  <div className="overflow-x-auto flex justify-center">
    <table className="table-auto border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-4 py-2">Γήπεδο</th>
          <th className="px-4 py-2">Ώρα</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-4 py-2">{match.arena}</td>
          <td className="border px-4 py-2">{match.matchtime}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div className='flex justify-center w-full my-5'>
        <form onSubmit={handleUpdateTime} className="p-4 max-w-sm mx-auto bg-white shadow-md rounded-lg space-y-4">
  <div>
    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
    Ενημέρωση ώρας αγώνα
    </label>
    <input 
      value={time} 
      onChange={(e) => setTime(e.target.value)} 
      type="time" 
      id="time" 
      name="time" 
      className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    />
  </div>
  <button 
    type="submit" 
    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
  >
    Ενημέρωση
  </button>
</form>

   </div>
</div>

        </div>
        </main>
    )
}

export default editMatchPage