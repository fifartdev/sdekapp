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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">

        
        <Login />

      </div>
    </main>
  );
}
