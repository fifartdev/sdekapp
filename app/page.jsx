'use client'
import Login from "./components/Login";
import { useAuth } from "./contexts/AuthContext";
import { redirect } from "next/navigation";
import { useEffect } from "react";

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
        <h1 className="text-2xl font-bold mb-4">Εφαρμογή Ορισμών Διαιτητών - ΚΕΔ ΟΣΕΚΑ</h1>
    <Login />

    Beta έκδοση 0.0.1 
      </div>
</main>

  );
}
