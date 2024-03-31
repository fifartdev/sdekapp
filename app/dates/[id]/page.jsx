'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { COL_DATES, COL_REFS, ODKE_DB, db, Query } from '@/app/utils/appwrite'
import Link from 'next/link'
import { redirect } from 'next/navigation';
import CreateMatchForm from '@/app/components/CreateMatchForm';


const pageDate = ({params}) => {
  const { user, isUserAdmin } = useAuth()
  const [currentDateData, setCurrentDateData] = useState()
  const [refsInDate, setRefsInDate] = useState([])
  const [refIds, setRefIds] = useState([])
  const [matches, setMatches] = useState([])
  const [cDate, setCDate] = useState('')
  const [isRefActiveOnThisDate, setIsRefActiveOnThisDate] = useState(false)

  
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

  

  useEffect(()=>{
    getDateData()
  },[])

  
  

  
  const theDate = new Date(cDate).toLocaleDateString()


  // console.log('All Date Params', params);
  console.log('User loggedin is: ', user);
  console.log('Current Date Data are: ', currentDateData);
  console.log('Refs in Date: ', refsInDate)
  console.log('Refs Ids: ', refIds);
  // console.log('Is REF ACTIVE?: ', isRefActiveOnThisDate);
  // console.log('All Matches in Date: ', matches)
  // console.log('Today is', theDate);
  // console.log('date is: ', cDate);
  

  //refsInDate.map(r=> console.log(r.name))
  
  if(!user){
    redirect('/')
  }


  if(refIds?.includes(user.$id)){ console.log('Ref is Active'); }

  return (
    <>
    <h1> Match Day: {theDate} - {user?.name}</h1>
    {!isUserAdmin ? refIds?.includes(user.$id) ? <p>REF is Active on this game | <button onClick={()=>removeRefFromDate(user.$id)}>Remove Ref from this Date</button></p> : <p>Ref is Not Active on this Date | <button onClick={()=>addRefOnDate(user.$id)}>Activate Ref Again</button></p> : <p>Welcome, check all Active Refs for this date</p> }
    <Link href={'/dates'}>Back to all Dates</Link>
    <hr/>
   { isUserAdmin && <CreateMatchForm dateId={params.id} />}
    <hr/>
    <>
    { matches && 
    <>
    <h1>This Date's Matches Are</h1>
    <ul>
       {
        matches?.map((t,index)=> {
          return (<li key={index}>{matches[index][0].name} - {matches[index][1].name}</li>)
        })
      }    
      </ul>
    </>
    }
    </>
    <hr/>
    <>
    { isUserAdmin && <h2>All Refs in this Date</h2> }
    <ul>
      { isUserAdmin && refsInDate?.map((r)=>{
        return (
          <li key={r.$id}>{r.name}</li>
        )
      })}
    </ul>
    </>
    </>

  )
}

export default pageDate