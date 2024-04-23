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
        <h1 className="text-2xl font-bold mb-4">Εφαρμογή Ορισμών Διαιτητών - ΣΔΕΚΑ</h1>
    <Login />

    Beta έκδοση 0.0.1 
      </div>
</main>

  );
}
