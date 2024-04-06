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
  const [refsInDate, setRefsInDate] = useState([])
  const [refIds, setRefIds] = useState([])
  const [matches, setMatches] = useState([])
  const [cDate, setCDate] = useState('')
  const [chosenRef,setChosenRef] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [dMatches, setDMatches] = useState([])
  

  const router = useRouter()
  // DATE DATA 
  const getDateData = async ()=> {
    try {
      const res = await db.getDocument(ODKE_DB, COL_DATES, params.id)
      setCurrentDateData(res)
      setCDate(res.date)
      const data = res.match.map((m) => m.teams)
      setMatches(data)
      setRefIds(res.referees)
      const refs = await db.listDocuments(ODKE_DB, COL_REFS, [Query.equal('user_id', res.referees)])
      setRefsInDate(refs.documents)
      setRefIds(res.referees)
      const dateMatches = await db.listDocuments(ODKE_DB, COL_MATCHES, [Query.equal('date_id', params.id)])
      setDMatches(dateMatches.documents)
    } catch (error) {
      console.log('Any Error in getDateData: ', error.message);
    }
  }

  const removeRefFromDate = async (ref)=> {
    try {
      const newList = currentDateData.referees.filter(r => r !== ref)
      setRefIds(newList)
      await db.updateDocument(ODKE_DB, COL_DATES, params.id, {referees:[]})
      await db.updateDocument(ODKE_DB, COL_DATES, params.id, {referees:newList})
    } catch (error) {
      console.log('Remove Ref Error: ', error.message);
    }
  }

  const addRefOnDate = async (ref)=> {
    try {
      const newList = [...currentDateData.referees, ref]
      setRefIds(newList)
      await db.updateDocument(ODKE_DB, COL_DATES, params.id, {referees:[]})
      await db.updateDocument(ODKE_DB, COL_DATES, params.id, {referees:newList})
    } catch (error) {
      console.log('Remove Ref Error: ', error.message);
    }
  }

  const handleAssignRefInMatch = async (match_id)=>{
    try {
      const mRefs = await db.getDocument(ODKE_DB,COL_MATCHES,match_id)
      //console.log(mRefs.referees);
      if(mRefs.referees.length === 2){
        window.alert('Έχουν οριστοί όλοι οι διαιτητές σε αυτό τον αγώνα')
        return
      }
      if(mRefs.referees.includes(chosenRef)){
        window.alert('O συγκερκιμένος διατητής έχει ήδη οριστεί σε αυτό τον αγώνα')
        return
      }
      if(chosenRef!==null){
        await db.updateDocument(ODKE_DB,COL_MATCHES,match_id,{referees:[...mRefs.referees,chosenRef]})
      }
    } catch (error) {
      console.log('Error in assignment', error.message);
    }
  }

  useEffect(()=>{
    getDateData()
  },[])

  
  

  
  const theDate = new Date(cDate).toLocaleDateString()


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
  <h1 className="text-2xl font-bold mb-4">Ημερομηνία: {theDate} - Γεία σου {user?.name}</h1>
  {!isUserAdmin ? (
    refIds?.includes(user.$id) ? (
      <p className="mb-4"> <div className="inline-block ml-2 rounded-full bg-green-500 p-1">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    </div> Ενεργός στη λίστα διαιτητών της ημέρας | <button onClick={() => removeRefFromDate(user.$id)} className="text-blue-500 hover:underline">Αδυνατώ να συμμετέχω αυτή την ημ/νία</button></p>
    ) : (
      <p className="mb-4"> <div className="inline-block ml-2 rounded-full bg-red-500 p-1">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div> Ανενενεργός στη λίστα διαιτητών της ημέρας | <button onClick={() => addRefOnDate(user.$id)} className="text-blue-500 hover:underline">Επιθυμώ να συμμετέχω</button></p>
    )
  ) : (
    <p className="mb-4">Πιο κάτω μπορείτε να δείτε όλους τους διαθέσιμους διαιτητές της αγωνιστικής ημέρας</p>
  )}
  <Link href={'/dates'} className="text-blue-500 hover:underline">Κεντρική Σελίδα Αγωνιστικών</Link>
  <hr className="my-4" />
  {isUserAdmin && <CreateMatchForm dateId={params.id} />}
  <hr className="my-4" />
  {matches && (
    <>
    <h2 className="text-lg font-bold mb-2">Όλοι οι Αγώνες της ημέρας</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match, index) => (
        <div key={index} className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-bold mb-2">{match[0].name} - {match[1].name}</h2>
        </div>
      ))}
    </div>
    </>
  )}
  <hr className="my-4" />
  {isUserAdmin && (
    <>
    <h2 className="text-lg font-bold mb-2">Όλοι οι διαθέσιμοι διαιτητές αυτής της ημέρας</h2>
    <ul>
      {refsInDate?.map((r) => (
        <li key={r.$id} className="bg-white shadow-md rounded-md p-4 mb-4">{r.name}</li>
      ))}
    </ul>
    <h2 className="text-lg font-bold mb-2">ΟΡΙΣΜΟΙ ΔΙΑΙΤΗΤΩΝ ΑΓΩΝΩΝ</h2>
    <ul>
      {dMatches?.map((d, index) => (
        <li key={d.$id} className="bg-white shadow-md rounded-md p-4 mb-4">
          <div>
          <span className='m-3 font-bold' >{d.teams[0].name}</span>-<span className='m-3 font-bold' >{d.teams[1].name}</span>
          <span className='m-5 font-bold' >Ώρα - {d.matchtime}</span> | <span className='m-5 font-bold' >Γήπεδο - {d.arena}</span>
          </div>
          <p className="text-gray-700">{d.referees.map((d, index) => {return <span key={index} className='m-3 font-semibold' >{d}</span>})}</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log(d.$id, chosenRef);
            handleAssignRefInMatch(d.$id);
            setChosenRef('');
            getDateData();
            router.refresh(`/dates/${params.id}`);
            router.push(`/dates/${params.id}`);
          }}>
            <label htmlFor={index+'ref'}>Ορισμός Διατητή</label>
            <select
              name={index+'ref'}
              id={index+'ref'}
              onChange={(e) => setChosenRef(e.target.value)}
              value={chosenRef}
              required
              disabled={disabled}
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Επιλέξτε Διαιτητή</option>
              {refsInDate.map((r) => (
                <option value={r.name} key={r.$id}>{r.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Ορισμός</button>
          </form>
        </li>
      ))}
    </ul>
  </>
  )}
</div>
</main>


  )
}

export default pageDate