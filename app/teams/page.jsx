'use client'
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { ODKE_DB, COL_TEAMS, db, ID, Query } from "../utils/appwrite"
import { useRouter, redirect } from "next/navigation"
import Link from "next/link"


const teamPage = ()=> {
    const {user, isUserAdmin, handleLogout} = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [teams, setTeams] = useState([])
    const [isOpen, setIsOpen] = useState(false);
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
            const res = await db.listDocuments(ODKE_DB, COL_TEAMS, [Query.limit(200)])
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
      <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
      <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer">Αρχική</span>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-white hover:border-white"
        >
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1z"
            />
          </svg>
        </button>
      </div>
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } w-full block flex-grow lg:flex lg:items-center lg:w-auto`}
      >
        <div className="text-sm lg:flex-grow">
        {isUserAdmin && (
          <>
          <Link href="/dates/new">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 cursor-pointer">
              Προσθήκη Αγωνιστικής Ημέρας
            </span>
          </Link>
          <Link href="/arenas">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 cursor-pointer">
              Γήπεδα
            </span>
          </Link>
          <Link href="/teams">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 cursor-pointer">
              Ομάδες
            </span>
          </Link>
          <Link href="/refs">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white cursor-pointer">
              Διαιτητές
            </span>
          </Link>
          </>)}
          <Link href="/ref">
            <span className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4 ml-4 cursor-pointer">
              Σελίδα Χρήστη
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white cursor-pointer"
          >
            Αποσύνδεση
          </button>
        </div>
      </div>
    </nav>
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