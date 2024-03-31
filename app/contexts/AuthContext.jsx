'use client'
import { account } from "@/app/utils/appwrite";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext()


export default function AuthProvider({children}) {

    const [user, setUser] = useState(null)
    const [session, setSession] = useState('')
    const [isUserAdmin,setIsUserAdmin] = useState(false)
    const router = useRouter()

    const handleLogin = async (e,email,password) => {
        try {
            e.preventDefault()
            const res = await account.createEmailPasswordSession(email,password)
            setSession(res.$id)
            getAccount()
            router.refresh('/dates')
            router.prefetch('/dates')
            router.push('/dates')
            // const txt = JSON.stringify(res)
            // window.alert('User is: '+ txt);

        } catch (error) {
            window.alert('Προσπάθησε ξανά με σωστά στοιχεία σύνδεσης!')
            console.log('Login Error: ', error.message);
        }
        
    }

    const handleLogout = async() => {
            try {
                await account.deleteSession(session)
                setUser()
                setIsUserAdmin(false)
                getAccount()
            } catch (error) {
                console.log('Delete session: ', error.message)
            }
    }

    const getAccount = async ()=>{
        try {
            const res = await account.get()
            setUser(res)
            if(res.labels[0]==='admin'){
                setIsUserAdmin(true)
            }
            
        } catch (error) {
            if(error.code===401){
                console.log('no active session');
            } 
            console.log('Get Account Error: ', error.message);
        }
    }
    useEffect(()=>{
        getAccount()
       },[])

   
  
   const data = {
    handleLogin,
    handleLogout,
    user,
    isUserAdmin
   }

   console.log(user);
   console.log('IS ADMIN', isUserAdmin);

  return (
    <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>
  )
}

export const useAuth = ()=> { return useContext(AuthContext)}

