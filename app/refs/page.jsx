'use client'
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { ODKE_DB, COL_REFS, db, ID, account, Query  } from "../utils/appwrite"
import { useRouter, redirect } from "next/navigation"
import Link from "next/link"


const refsPage = ()=> {
    const {user, isUserAdmin, handleLogout} = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [refs, setRefs] = useState([])
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState('')
    const [landline, setLandline] = useState('')
    const [mobile, setMobile] = useState('')
    const [category, setCategory] = useState('')
    const [inactive,setInactive] = useState(false)

    const handleAddRef = async (e) => {
        e.preventDefault()
        try {
            const newaccount = await account.create(ID.unique(), email, password, name)
            if(newaccount){
                await db.createDocument(ODKE_DB, COL_REFS, ID.unique(), { name: name, user_id: newaccount.$id, email: email, index:index,landline:landline,mobile:mobile,category:category, inactive:inactive })
            }
            setEmail('')
            setPassword('')
            setName('')
            setLandline('')
            setMobile('')
            setCategory('')

            getAllRefs()
            router.refresh()
        } catch (error) {
            console.log('Error in Refs', error.message);
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
            const res = await db.listDocuments(ODKE_DB, COL_REFS, [Query.limit(200)])
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
      <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
      <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
      <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer m-3">Αρχική</span>
        </Link>|
        <Link href="https://oseka.gr/ekthesi-komisarioy-agonos/">
          <span className="font-semibold text-md tracking-tight cursor-pointer m-3">Έκθεση Κομισάριου</span>
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
      <label htmlFor="index" className="block text-gray-700 text-sm font-bold mb-2">A/A</label>
        <input
        type="number"
        id="index"
        value={index}
        onChange={(e)=>setIndex(e.target.value)}
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <label htmlFor="landline" className="block text-gray-700 text-sm font-bold mb-2">Σταθερό</label>
        <input
        type="text"
        id="landline"
        value={landline}
        onChange={(e)=>setLandline(e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <label htmlFor="mobile" className="block text-gray-700 text-sm font-bold mb-2">Κινητό</label>
        <input
        type="text"
        id="mobile"
        value={mobile}
        onChange={(e)=>setMobile(e.target.value)}        
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">ΚΑΤΗΓΟΡΙΑ</label>
      <select
        name="category"
        id="category"
        onChange={(e) => setCategory(e.target.value)}
        value={category}
        required
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="" disabled>
          Επιλέξτε Κατηγορία
        </option>
        <option value="ΔΙΕΘΝΗΣ">
         ΔΙΕΘΝΗΣ
        </option>
        <option value="Α ΚΑΤΗΓΟΡΙΑ">
          Α ΚΑΤΗΓΟΡΙΑ
        </option>
        <option value="Β ΚΑΤΗΓΟΡΙΑ">
          Β ΚΑΤΗΓΟΡΙΑ
        </option>
        <option value="ΔΟΚΙΜΟΣ">
          ΔΟΚΙΜΟΣ
        </option>
      </select>
    </div>
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Προσθήκη</button>
    </form>
        <hr />
        <div>
  <h2 className="text-2xl font-bold mb-4">Όλοι οι Διαιτητές</h2>
  <ul>
    <li className="flex items-center justify-between mb-2">
      <span className="font-bold">Α/Α - Index</span><span className="font-bold">Όνομα</span><span className="font-bold">Ενέργεια</span>
    </li>
    {refs?.map(r => (
      <li key={r.$id} className="flex items-center justify-between mb-2">
       <span>{r.index}</span><span>{r.name}</span><Link href={`/refs/${r.$id}`}>Επεξεργασία</Link>
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