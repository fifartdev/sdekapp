'use client'
import { redirect, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ODKE_DB, db, Query, COL_MATCHES, COL_REFS } from '@/app/utils/appwrite'
import Link from 'next/link'


const matchPage = ({params})=>{
    const [refsInMatch, setRefsInMatch] = useState([])
    const [refIds, setRefIds] = useState([])
    const [match,setMatch] = useState({})
    const [teams, setTeams] = useState([])
    const [chosenRef,setChosenRef] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [assignedRefs,setAssignedRefs] = useState([])

    const router = useRouter()

    const getMatchData = async ()=>{
        try {
            const res = await db.getDocument(ODKE_DB,COL_MATCHES,params.match)
            setMatch(res)
            setRefIds(res.availablereferees)
            setAssignedRefs(res.referees)
            setTeams(res.teams)
            const refs = await db.listDocuments(ODKE_DB, COL_REFS, [Query.equal('user_id', res.availablereferees)])
            setRefsInMatch(refs.documents)
        } catch (error) {
            console.log('Error on Match Page', error.message);
        }   
    }

    const handleAssignRefInMatch = async ()=>{
        try {
          if(assignedRefs.length === 3){
            window.alert('Έχουν οριστοί όλοι οι διαιτητές σε αυτό τον αγώνα')
            return
          }
          if(assignedRefs.includes(chosenRef)){
            window.alert('O συγκερκιμένος διατητής έχει ήδη οριστεί σε αυτό τον αγώνα')
            return
          }
          if(chosenRef!==null){
            await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:[...assignedRefs,chosenRef]})
            getMatchData()
          }
        } catch (error) {
          console.log('Error in assignment', error.message);
        }
      }


    useEffect(()=>{
        getMatchData()
    },[])
    
    let date = new Date(match.fulldate).toLocaleDateString('el-GR')

    //console.log('Match data: ', teams[0]);
    console.log('Refs in Match: ', refsInMatch);
    console.log('Assigned Refs: ', assignedRefs);

    const { user } = useAuth()

    if(!user){
        redirect('/')
      }

    return (
        <main className="flex justify-center min-h-screen">
        <div className="w-full text-center p-10">
        <button onClick={()=>router.back()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >Πίσω στην Αγωνιστική</button>
        <div className="bg-white shadow-md rounded-md p-4 mb-4">
  <h1 className="text-lg font-bold mb-2">{date}</h1>
  <div className="overflow-x-auto flex justify-center">
    <table className="table-auto border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-4 py-2">Γήπεδο</th>
          <th className="px-4 py-2">Ώρα</th>
          <th className="px-4 py-2">Γηπεδούχος</th>
          <th className="px-4 py-2">Φιλοξενούμενη</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-4 py-2">{match.arena}</td>
          <td className="border px-4 py-2">{match.matchtime}</td>
          {teams.map((t, index) => (
            <td key={index} className="border px-4 py-2">{t.name}</td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
  <div className='flex justify-center w-full my-5'>
{ assignedRefs !=0 ? 
   <>
  <table className="table-auto border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-4 py-2">Διαιτητής Α</th>
          <th className="px-4 py-2">Διαιτητής Β</th>
          <th className="px-4 py-2">Κομισάριος</th>
        </tr>
      </thead>
      <tbody>
        <tr>
        {
        assignedRefs?.map((r,index)=>{
            return (
                <td key={index} className="border px-4 py-2">{r}</td>
            )
        })
    }
        </tr>
      </tbody>
    </table>
 </>
 
 : null }
</div>
</div>

        <form onSubmit={(e) => {
            e.preventDefault();
            handleAssignRefInMatch();
            setChosenRef('');
          }}>
            <label htmlFor={'ref'}>Ορισμός Διατητή</label>
            <select
              name={'ref'}
              id={'ref'}
              onChange={(e) => setChosenRef(e.target.value)}
              value={chosenRef}
              required
              disabled={disabled}
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Επιλέξτε Διαιτητή</option>
              {refsInMatch.map((r) => (
                <option value={r.name} key={r.$id}>{r.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Ορισμός</button>
          </form>
        </div>
        </main>
    )
}

export default matchPage