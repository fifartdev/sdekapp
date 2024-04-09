'use client'
import { redirect } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const matchesPage = ()=> {
    const { user } = useAuth()
    if(!user){
        redirect('/')
      }
    redirect('/dates')
    return(
        <p></p>
    )
   
}

export default matchesPage