'use client'
import {useState} from 'react'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 
  const { handleLogin } = useAuth()
  

  return (
    <>
    <form onSubmit={(e) => handleLogin(e, email, password, setEmail(''), setPassword(''))} className="w-full max-w-xs">
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Κωδικός</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Σύνδεση</button>
    </form>
  </>
  
  )
}

export default Login