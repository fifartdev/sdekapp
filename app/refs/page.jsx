'use client'
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { ODKE_DB, COL_REFS, db, ID, account  } from "../utils/appwrite"
import { useRouter, redirect } from "next/navigation"
import Link from "next/link"


const refsPage = ()=> {
    const {user, isUserAdmin, handleLogout} = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [refs, setRefs] = useState([])

    const handleAddRef = async (e) => {
        e.preventDefault()
        try {
            const newaccount = await account.create(ID.unique(), email, password, name)
            if(newaccount){
                await db.createDocument(ODKE_DB, COL_REFS, ID.unique(), { name: name, user_id: newaccount.$id, email: email })
            }
            setEmail('')
            setPassword('')
            setName('')
            getAllRefs()
            router.refresh()
        } catch (error) {
            console.log('Error in Arenas', error.message);
        }
    }

    // const handleDeleteTeam = async (id) => {
    //     try {
    //         await db.deleteDocument(ODKE_DB, COL_TEAMS, id)
    //         getAllTeams()
    //         router.refresh()
    //     } catch (error) {
    //         console.log('Error deleting team', error.message);
    //     }

    // }

    const getAllRefs = async ()=> {
        try {
            const res = await db.listDocuments(ODKE_DB, COL_REFS)
            setRefs(res.documents)
        } catch (error) {
            console.log('Error list refs', error.message);
        }
    }

    useEffect(()=>{
        getAllRefs()
    },[])

   // console.log(refs);
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
            <h1>Σελίδα Προσθήκης Διαιτητή </h1>
        <form onSubmit={handleAddRef} className="w-full max-w-md">
        <div className="mb-4">
    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Όνομα</label>
        <input
        type="text"
        id="name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input
        type="email"
        id="email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <label htmlFor="pwd" className="block text-gray-700 text-sm font-bold mb-2">Κωδικός</label>
        <input
        type="password"
        id="pwd"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Προσθήκη</button>
    </form>
        <hr />
        <div>
  <h2 className="text-2xl font-bold mb-4">Όλοι οι Διαιτητές</h2>
  <ul>
    {refs?.map(r => (
      <li key={r.$id} className="flex items-center justify-between mb-2">
        <span>{r.name}</span>
        {/* <button onClick={() => handleDeleteTeam(t.$id)} class="text-red-500">Διαγραφή</button> */}
      </li>
    ))}
  </ul>
</div>
      </div>
      </main>
)

}

export default refsPage