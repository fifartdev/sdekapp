'use client'
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { ODKE_DB, COL_ARENAS, db, ID } from "../utils/appwrite"
import { useRouter, redirect } from "next/navigation"
import Link from "next/link"


const arenaPage = ()=> {
    const {user, isUserAdmin, handleLogout} = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [arenas, setArenas] = useState([])
    const handleAddArena = async (e) => {
        e.preventDefault()
        try {
            await db.createDocument(ODKE_DB, COL_ARENAS, ID.unique(), {name: name})
            setName('')
            getAllArenas()
            router.refresh()
        } catch (error) {
            console.log('Error in Arenas', error.message);
        }
    }

    const handleDeleteArena = async (id) => {
        try {
            await db.deleteDocument(ODKE_DB, COL_ARENAS, id)
            getAllArenas()
            router.refresh()
        } catch (error) {
            console.log('Error deleting arena', error.message);
        }

    }

    const getAllArenas = async ()=> {
        try {
            const res = await db.listDocuments(ODKE_DB, COL_ARENAS)
            setArenas(res.documents)
        } catch (error) {
            console.log('Error list arenas', error.message);
        }
    }

    useEffect(()=>{
        getAllArenas()
    },[])

  //  console.log(arenas);

    if(!user){
        redirect('/')
      }

return(

    <main className="flex justify-center min-h-screen">
      <div className="w-full p-10">
      <div className="flex items-center">
  <Link href={"/"} className="text-blue-500 hover:underline mr-2">Αρχική</Link>
  <button onClick={handleLogout} className="text-blue-500 hover:underline ml-2">Αποσύνδεση</button>
</div>
            <h1>Σελίδα Γηπέδων</h1>
        <form onSubmit={handleAddArena} className="w-full max-w-md">
        <div className="mb-4">
            <label htmlFor="arena" className="block text-gray-700 text-sm font-bold mb-2">Όνομα Γηπέδου</label>
        <input
        type="text"
        id="arena"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Προσθήκη</button>
    </form>
        <hr />
        <h2 className="text-2xl font-bold mb-4">Όλα τα διαθέσιμα γήπεδα</h2>
        <ul>
            {arenas?.map(a=>{ return <li className="flex items-center justify-between mb-2" key={a.$id}>{a.name} 
            {/* | <button onClick={()=>handleDeleteArena(a.$id)}>Διαγραφή</button> */}
            </li>})}
        </ul>
      </div>
      </main>
)

}

export default arenaPage