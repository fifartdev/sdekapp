'use client'
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { ODKE_DB, COL_TEAMS, db, ID } from "../utils/appwrite"
import { useRouter, redirect } from "next/navigation"
import Link from "next/link"


const teamPage = ()=> {
    const {user, isUserAdmin, handleLogout} = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [teams, setTeams] = useState([])
    const handleAddTeam = async (e) => {
        e.preventDefault()
        try {
            await db.createDocument(ODKE_DB, COL_TEAMS, ID.unique(), {name: name})
            setName('')
            getAllTeams()
            router.refresh()
        } catch (error) {
            console.log('Error in Arenas', error.message);
        }
    }

    const handleDeleteTeam = async (id) => {
        try {
            await db.deleteDocument(ODKE_DB, COL_TEAMS, id)
            getAllTeams()
            router.refresh()
        } catch (error) {
            console.log('Error deleting team', error.message);
        }

    }

    const getAllTeams = async ()=> {
        try {
            const res = await db.listDocuments(ODKE_DB, COL_TEAMS)
            setTeams(res.documents)
        } catch (error) {
            console.log('Error list teams', error.message);
        }
    }

    useEffect(()=>{
        getAllTeams()
    },[])

    //console.log(teams);
    if(!user){
        redirect('/')
      }

return(

    <main className="flex justify-center min-h-screen">
      <div className="w-full p-10">
      <div className="flex items-center">
  <Link href={"/"} className="text-blue-500 hover:underline mr-2">Αρχική</Link>
  {isUserAdmin && (
    <>
      <span className="text-gray-500">|</span>
      <Link href={"/dates/new"} className="text-blue-500 hover:underline mx-2">Προσθήκη Αγωνιστικής Ημέρας</Link>
      <span className="text-gray-500">|</span>
      <Link href={"/arenas"} className="text-blue-500 hover:underline mx-2">Γήπεδα</Link>
      <span className="text-gray-500">|</span>
      <Link href={"/teams"} className="text-blue-500 hover:underline mx-2">Ομάδες</Link>
    </>
  )}
  <span className="text-gray-500">|</span>
  <Link href={'/ref'} className="text-blue-500 hover:underline mx-2">Σελίδα Χρήστη</Link>
  <span className="text-gray-500">|</span>
  <button onClick={handleLogout} className="text-blue-500 hover:underline ml-2">Αποσύνδεση</button>
</div>
            <h1>Σελίδα Ομάδων</h1>
        <form onSubmit={handleAddTeam} className="w-full max-w-md">
        <div className="mb-4">
            <label htmlFor="team" className="block text-gray-700 text-sm font-bold mb-2">Όνομα Ομάδας</label>
        <input
        type="text"
        id="team"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Προσθήκη</button>
    </form>
        <hr />
        <div>
  <h2 className="text-2xl font-bold mb-4">Όλες οι Ομάδες</h2>
  <ul>
    {teams?.map(t => (
      <li key={t.$id} className="flex items-center justify-between mb-2">
        <span>{t.name}</span>
        {/* <button onClick={() => handleDeleteTeam(t.$id)} class="text-red-500">Διαγραφή</button> */}
      </li>
    ))}
  </ul>
</div>
      </div>
      </main>
)

}

export default teamPage