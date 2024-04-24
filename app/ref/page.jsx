'use client'
import { useAuth } from '@/app/contexts/AuthContext'
import React, {useEffect, useState} from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ODKE_DB, db, COL_MATCHES, Query } from '../utils/appwrite'

const refPage = () => {

    const {user, isUserAdmin, handleLogout} = useAuth()
    const [matches, setMatches] = useState([])
    const [mdays, setMdays] = useState([])
    const [isOpen, setIsOpen] = useState(false);

    const getRefMatches = async ()=> {
      try {
        const res = await db.listDocuments(ODKE_DB, COL_MATCHES, [Query.contains('referees', [user.name])])
        const final = res.documents
        console.log('Data are', final);
        setMdays(final)
        const dts = final.map(d=>d.teams)
        console.log(dts);
        setMatches(dts)      
        
      } catch (error) {
        console.log('Error from Refs Page',error.message);
      }
    }

    
    if(!user){
      redirect('/')
    }
    

    useEffect(()=>{
      getRefMatches()
    },[])

    console.log('Refs Matches are: ', matches);

    // matches.map((i)=>{
    //   return(
        
    //     console.log(i[0].name,'-',i[1].name)
    //   )
    // })
    mdays.map((m,index)=>{
      console.log('Date is: ', m.fulldate);
      console.log('Time is: ', m.matchtime);
      console.log('Arena is: ', m.arena);
      console.log('Teams are');
      m.teams.map(t=>console.log(t.name));
    })
    

    if(!user){
        redirect('/')
      }

    return (
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
{/* <div className="flex items-center">
  <Link href={"/"} className="text-blue-500 hover:underline mr-2">Αρχική</Link>
  {isUserAdmin && (
    <>
      <span className="text-gray-500">|</span>
      <Link href={"/dates/new"} className="text-blue-500 hover:underline mx-2">Προσθήκη Αγωνιστικής Ημέρας</Link>
    </>
  )}
  <span className="text-gray-500">|</span>
  <Link href={'/ref'} className="text-blue-500 hover:underline mx-2">Σελίδα Χρήστη</Link>
  <span className="text-gray-500">|</span>
  <button onClick={handleLogout} className="text-blue-500 hover:underline ml-2">Αποσύνδεση</button>
</div> */}
<div className="text-xl font-bold mb-4">Σελίδα Χρήστη</div>
<div className="text-xl font-bold mt-4">Προφίλ {user?.name}</div>
{ !isUserAdmin &&
<ul>
  {mdays?.map((m, index) => (
    <li key={index} className="bg-white shadow-md rounded-md p-4 mb-4">
      <span className='m-2'><b>Ημ/νία:</b> {new Date(m.fulldate).toLocaleDateString('el-Gr')}</span> 
      <span className='m-2'><b>Ώρα:</b> { m.matchtime}</span>
      <span className='m-2'><b>Γήπεδο:</b> { m.arena}</span>
      <span className='m-2'><b>Ομάδες:</b> { m.teams[0].name} - { m.teams[1].name }</span>
    </li>
  ))}
</ul>
}
    </div>
    </main>
  )
}

export default refPage