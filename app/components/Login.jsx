'use client'
import {useState} from 'react'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 
  const { handleLogin } = useAuth()
  

  return (
   <>
   <form onSubmit={(e)=>handleLogin(e,email,password,setEmail(''),setPassword(''))}>
  <div>
    <label htmlFor="newDate">Email</label>
    <input
      type="email"
      id="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    </div>
    <div>
    <label htmlFor="newDate">Password</label>
    <input
      type="password"
      id="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    </div>
    <button type="submit">Login</button>
    </form>
   </>
  )
}

export default Login