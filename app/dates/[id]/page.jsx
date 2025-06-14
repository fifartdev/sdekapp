'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { COL_DATES, COL_REFS, ODKE_DB, db, Query, COL_MATCHES } from '@/app/utils/appwrite'
import Link from 'next/link'
import { redirect } from 'next/navigation';
import CreateMatchForm from '@/app/components/CreateMatchForm';
import { useRouter } from 'next/navigation';

const pageDate = ({params}) => {
  const { user, isUserAdmin, handleLogout } = useAuth()
  const [currentDateData, setCurrentDateData] = useState()
  const [matches, setMatches] = useState([])
  const [cDate, setCDate] = useState('')
  const [chosenRef,setChosenRef] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [adminDisabled, setAdminDisabled] = useState(false)
  const [dMatches, setDMatches] = useState([])
  const [dateDif,setDateDif] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const [hide,setHide] = useState(false)
  

  

  const router = useRouter()
  // DATE DATA 
  const getDateData = async ()=> {
    try {
      const res = await db.getDocument(ODKE_DB, COL_DATES, params.id)
      setCurrentDateData(res)
      setCDate(res.date)
      const data = res.match.map((m) => m.teams)
      setMatches(data)
      const dateMatches = await db.listDocuments(ODKE_DB, COL_MATCHES, [Query.equal('date_id', params.id), Query.orderAsc('matchtime')])
      setDMatches(dateMatches.documents)
      const today = new Date()
      const mDate = new Date(res.date)
      const diffTime = Math.abs(mDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if(diffDays < 1){
        setDisabled(true)
        // setAdminDisabled(false)
      }
    } catch (error) {
      console.log('Any Error in getDateData: ', error.message);
    }
  }

  const removeRefFromMatch = async (id,ref)=> {
    try {
      const res = await db.getDocument(ODKE_DB, COL_MATCHES, id)
      const oldRefs = res.availablereferees
      //console.log(oldRefs);
      const newList = oldRefs.filter(r => r !== ref) 
      //console.log(newList);
      await db.updateDocument(ODKE_DB, COL_MATCHES, id, {availablereferees:[]})
      await db.updateDocument(ODKE_DB, COL_MATCHES, id, {availablereferees:newList})
      getDateData()
    } catch (error) {
      console.log('Remove Ref Error: ', error.message);
    }
  }

  const addRefOnMatch = async (id,ref)=> {
    try {
      const res = await db.getDocument(ODKE_DB, COL_MATCHES, id)
      const oldRefs = res.availablereferees
      const newList = [...oldRefs, ref]
      await db.updateDocument(ODKE_DB, COL_MATCHES, id, {availablereferees:[]})
      await db.updateDocument(ODKE_DB, COL_MATCHES, id, {availablereferees:newList})
      getDateData()
    } catch (error) {
      console.log('Add Ref Error: ', error.message);
    }
  }

  const removeRefFromAllMatches = () => {
    try {
      const res = dMatches.map(async (dm) => await removeRefFromMatch(dm.$id,user.$id))
      return res
    } catch (error) {
      console.log('Error removing ref from all Matches: ', error.message);
    } 
  }

  const checkIfRefisAvailable = () => {
    try {
       dMatches.map(async (dm) => {
       const result = await dm
       result.availablereferees.includes(user.$id) ? setHide(false) : setHide(true)
      }
       )
    } catch (error) {
      console.log(error);
      
    }
  }

  const handleSubmitEmail = async (e,email, user,teamA,teamB,date) => {
      e.preventDefault();
      try {
          await fetch('/api/sendconfederation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email:email, subject:`Αδυναμία Συμμετοχής ${user}`, message: `Αδυνατώ να συμμετέχω στον αγώνα ${teamA}-${teamB} στις ${date}.` }),
          });
        
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    };

    const handleSubmitEmailToCertainMatch = async (e,email, user,teamA,teamB,date) => {
      e.preventDefault();
      try {
          await fetch('/api/sendconfederation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email:email, subject:`Δυνατότητα Συμμετοχής ${user}`, message: `Επιθυμώ να συμμετέχω στον αγώνα ${teamA}-${teamB} στις ${date}.` }),
          });
        
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    };

    const handleSubmitEmailForAllDate = async (e,email,user,date) => {
      e.preventDefault();
      try {
          await fetch('/api/sendconfederation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email:email, subject:`Αδυναμία Συμμετοχής ${user}`, message: `Αδυνατώ να συμμετέχω συνολικά στις ${date}.` }),
          });
        
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    };

    


  
  useEffect(()=>{
    getDateData()
  },[])

  useEffect(()=>{
    checkIfRefisAvailable()
  })

  
  
  const goToMatch = (id) => {
    router.push(`/matches/${id}`)
  }
  
  const theDate = new Date(cDate).toLocaleDateString()
  

  //console.log('Date difference is: ', dateDif);

  // console.log('All Date Params', params);
  // console.log('User loggedin is: ', user);
  // console.log('Current Date Data are: ', currentDateData);
  // console.log('Refs in Date: ', refsInDate)
  // console.log('Refs Ids: ', refIds);
  // console.log('Date Matches are: ', dMatches);
  // console.log('Is REF ACTIVE?: ', isRefActiveOnThisDate);
  // console.log('All Matches in Date: ', matches)
  // console.log('Today is', theDate);
  // console.log('date is: ', cDate);
  

  //refsInDate.map(r=> console.log(r.name))
  
  


  if(!user){
    redirect('/')
  }
  

  //if(refIds?.includes(user.$id)){ console.log('Ref is Active'); }

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
  <h1 className="text-2xl font-bold mb-4">Ημερομηνία: {theDate} - Γεία σου {user?.name}</h1>
  { <button onClick={(e)=>{
    removeRefFromAllMatches()
    handleSubmitEmailForAllDate(e,user?.email,user?.name,theDate)
    }} className={ hide ? "hidden" : "bg-red-600 p-4 text-white hover:bg-red-400"} >Αδυναμία συμμετοχής σε ολόκληρη την αγωνιστική ημέρα</button>}
  
  {isUserAdmin && <><hr className="my-4" /><CreateMatchForm dateId={params.id} /></>}
  <hr className="my-4" />
  {dMatches && (
    <>
    <h2 className="text-lg font-bold mb-2">Όλοι οι Αγώνες της ημέρας</h2>
    <div className="flex flex-row">
    <ul>
      {dMatches?.map((d, index) => (
        <li key={d.$id} className="bg-white shadow-md rounded-md p-4 mb-4">
          <div>
          <span className='m-3 font-bold' >{d.teams[0].name}</span>-<span className='m-3 font-bold' >{d.teams[1].name}</span>
          <span className='m-5 font-bold' >Ώρα - {d.matchtime}</span> | <span className='m-5 font-bold' >Γήπεδο - {d.arena}</span>
          { !isUserAdmin && d.availablereferees.includes(user.$id) ? <><div className="inline-block ml-2 rounded-full bg-green-500 p-1">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg></div> <button onClick={(e) => {
        removeRefFromMatch(d.$id,user.$id)
        handleSubmitEmail(e,user?.email, user?.name,d.teams[0].name,d.teams[1].name,theDate)
        }} className={disabled ? "hidden" : "text-blue-500 hover:underline"}>Αδυνατώ να συμμετέχω</button></>  : !isUserAdmin && <><div className="inline-block ml-2 rounded-full bg-red-500 p-1">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div> <button onClick={(e) => {
      addRefOnMatch(d.$id,user.$id)
      handleSubmitEmailToCertainMatch(e,user?.email, user?.name,d.teams[0].name,d.teams[1].name,theDate)
      }} className={disabled ? "hidden" : "text-blue-500 hover:underline"}>Επιθυμώ να συμμετέχω</button></>} 
          </div>
          { isUserAdmin && <button onClick={() => goToMatch(d.$id)} className={adminDisabled ? "hidden" : "text-blue-500 hover:underline"} >Περισσότερα</button> }
        </li>
      ))}
    </ul>
    </div>
    </>
  )}
</div>
</main>


  )
}

export default pageDate