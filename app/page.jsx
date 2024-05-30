'use client'
import Login from "./components/Login";
import { useAuth } from "./contexts/AuthContext";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {

  const {user} = useAuth()

    useEffect(()=>{
      if(user)
    redirect('/dates')
    })

    //console.log('Log from / :', user);

  return (
    <main className="flex min-h-screen">
       <div className="w-full p-10">
      <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
      <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer m-3">Αρχική</span>
        </Link> | 

        <Link href="https://oseka.gr/ekthesi-komisarioy-agonos/" target="_blank">
          <span className="font-semibold text-md tracking-tight cursor-pointer m-3">Έκθεση Κομισάριου</span>
        </Link>
      </div>
      </nav>
        <h1 className="text-2xl font-bold mb-4">Εφαρμογή Ορισμών Διαιτητών - ΚΕΔ ΟΣΕΚΑ</h1>
    <Login />

    Beta έκδοση 0.0.1 
      </div>
</main>

  );
}
