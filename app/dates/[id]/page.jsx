'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { COL_DATES, COL_REFS, ODKE_DB, db, Query, COL_MATCHES } from '@/app/utils/appwrite'
import Link from 'next/link'
import { redirect } from 'next/navigation';
import CreateMatchForm from '@/app/components/CreateMatchForm';
import { useRouter } from 'next/navigation';

const pageDate = ({params}) => {
  const { user, isUserAdmin } = useAuth()
  const [currentDateData, setCurrentDateData] = useState()
  const [matches, setMatches] = useState([])
  const [cDate, setCDate] = useState('')
  const [chosenRef,setChosenRef] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [adminDisabled, setAdminDisabled] = useState(true)
  const [dMatches, setDMatches] = useState([])
  const [dateDif,setDateDif] = useState(null)


  

  

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
      if(diffDays < 4){
        setDisabled(true)
        setAdminDisabled(false)
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

  
  useEffect(()=>{
    getDateData()
  },[])

  
  
  const goToMatch = (id) => {
    router.push(`/matches/${id}`)
  }
  
  const theDate = new Date(cDate).toLocaleDateString()
  

  //console.log('Date difference is: ', dateDif);

  // console.log('All Date Params', params);
  console.log('User loggedin is: ', user);
  // console.log('Current Date Data are: ', currentDateData);
  // console.log('Refs in Date: ', refsInDate)
  // console.log('Refs Ids: ', refIds);
  console.log('Date Matches are: ', dMatches);
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
  <h1 className="text-2xl font-bold mb-4">Ημερομηνία: {theDate} - Γεία σου {user?.name}</h1>
 
  <Link href={'/dates'} className="text-blue-500 hover:underline">Κεντρική Σελίδα Αγωνιστικών</Link>
  
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
      </svg></div> <button onClick={() => removeRefFromMatch(d.$id,user.$id)} className={disabled ? "hidden" : "text-blue-500 hover:underline"}>Αδυνατώ να συμμετέχω</button></>  : !isUserAdmin && <><div className="inline-block ml-2 rounded-full bg-red-500 p-1">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div> <button onClick={() => addRefOnMatch(d.$id,user.$id)} className={disabled ? "hidden" : "text-blue-500 hover:underline"}>Επιθυμώ να συμμετέχω</button></>} 
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