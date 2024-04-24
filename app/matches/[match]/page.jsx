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
    const [disabledA, setDisabledA] = useState(false)
    const [disabledB, setDisabledB] = useState(false)
    const [disabledC, setDisabledC] = useState(false)
    const [assignedRefs,setAssignedRefs] = useState([])
    const [chosenRefEmail, setChosenRefEmail] = useState([])
    const [refA, setRefA] = useState('')
    const [refB, setRefB] = useState('')
    const [komisario, setKomisario] = useState('')


    const router = useRouter()

    const getMatchData = async ()=>{
        try {
            const res = await db.getDocument(ODKE_DB,COL_MATCHES,params.match)
            if(res.refA != ''){
              setDisabledA(true)
            } else {
              setDisabledA(false)
            }
            if(res.refB != ''){
              setDisabledB(true)
            } else {
              setDisabledB(false)
            }
            if(res.komisario != ''){
              setDisabledC(true)
            } else {
              setDisabledC(false)
            }
            setMatch(res)
            setRefIds(res.availablereferees)
            setAssignedRefs(res.referees)
            setTeams(res.teams)
            const refs = await db.listDocuments(ODKE_DB, COL_REFS, [Query.equal('user_id', res.availablereferees)])
            setRefsInMatch(refs.documents)
            const emailsRes = await db.listDocuments(ODKE_DB, COL_REFS, [Query.equal('name', res?.referees), Query.select('email')])
            setChosenRefEmail(emailsRes.documents)
        } catch (error) {
            console.log('Error on Match Page', error.message);
        }   
    }

    const updateMatchEmails = async ()=>{
            const emailsRes = await db.listDocuments(ODKE_DB, COL_REFS, [Query.equal('name', assignedRefs), Query.select('email')])
            setChosenRefEmail(emailsRes.documents)
    }

    const handleSubmitEmail = async (e,date,ateam,bteam,arena,time,refa,refb,kom) => {
      e.preventDefault();
      try {
        chosenRefEmail.forEach(async (em) => {
          await fetch('/api/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: em.email, subject:`Έχετε οριστεί σε αγώνα στις ${date}`, message: `Οριστίκατε σε αγώνα ${ateam}-${bteam}, στο Γήπεδο ${arena}, ώρα ${time}.Οι ορισμοί έχουν ως εξής. Διαιτητής Α: ${refa}, Διαιτητής Β: ${refb}, Κομισάριος: ${kom}` }),
          });
        })
        window.alert('Μήνυμα Εστάλη!')
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    };

    // const handleAssignRefInMatch = async ()=>{
    //     try {
    //       if(assignedRefs.length === 3){
    //         window.alert('Έχουν οριστοί όλοι οι διαιτητές σε αυτό τον αγώνα')
    //         return
    //       }
    //       // if(assignedRefs.includes(chosenRef)){
    //       //   window.alert('O συγκερκιμένος διατητής έχει ήδη οριστεί σε αυτό τον αγώνα')
    //       //   return
    //       // }
    //       if(chosenRef!==null){
    //         await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:[...assignedRefs,chosenRef]})
    //         getMatchData()
    //       }
    //     } catch (error) {
    //       console.log('Error in assignment', error.message);
    //     }
    //   }
    // ASIGNED REFS IN MATCHES FUNCTIONS  
    const handleAssignRefA = async () => {
      try {
        if(assignedRefs.length === 3){
        window.alert('Έχουν οριστοί όλοι οι διαιτητές σε αυτό τον αγώνα')
                  return
                }
        if(refA!==null){
          await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{refA:refA})
          await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:[...assignedRefs,refA]})
          setDisabledA(true)
          getMatchData()
        }
      } catch (error) {
        console.log('Error assigning refA: ', error.message);
      }
    }

    const handleAssignRefB = async () => {
      try {
        if(assignedRefs.length === 3){
        window.alert('Έχουν οριστοί όλοι οι διαιτητές σε αυτό τον αγώνα')
                  return
                }
        if(refB!==null){
          await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{refB:refB})
          await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:[...assignedRefs,refB]})
          getMatchData()
        }
      } catch (error) {
        console.log('Error assigning refB: ', error.message);
      }
    }

    const handleKomissario = async () => {
      try {
        if(assignedRefs.length === 3){
        window.alert('Έχουν οριστοί όλοι οι διαιτητές σε αυτό τον αγώνα')
                  return
                }
        if(komisario!==null){
          await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{komisario:komisario})
          await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:[...assignedRefs,komisario]})
          getMatchData()
        }
      } catch (error) {
        console.log('Error assigning komisario: ', error.message);
      }
    }
    // END OF ASIGNED REFS IN MATCHES FUNCTIONS

    // REMOVE REFS FROM MATCHES FUNCTIONS
    const removeRefAfromMatch = async (ref)=> {
      try {
        const res = await db.getDocument(ODKE_DB,COL_MATCHES,params.match)
        if(res.refA === res.komisario){
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{komisario:''})
        }
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{refA:''})
        const newList = assignedRefs.filter(r => r !== ref) 
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:newList})
      } catch (error) {
        console.log('Remove Ref from Match: ', error.message);
      } finally{
        getMatchData()
        updateMatchEmails()
      }
    }
    const removeRefBfromMatch = async (ref)=> {
      try {
        const res = await db.getDocument(ODKE_DB,COL_MATCHES,params.match)
        if(res.refB === res.komisario){
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{komisario:''})
        }
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{refB:''})
        const newList = assignedRefs.filter(r => r !== ref) 
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:newList})
      } catch (error) {
        console.log('Remove Ref from Match: ', error.message);
      } finally {
        getMatchData()
        updateMatchEmails()
      }
    }

    const removeKomisariofromMatch = async (ref)=> {
      try {
        const res = await db.getDocument(ODKE_DB,COL_MATCHES,params.match)
        if(res.komisario === res.refA){
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{refA:''})
        } else if(res.komisario === res.refB){
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{refB:''})
        }
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{komisario:''})
        const newList = assignedRefs.filter(r => r !== ref) 
        await db.updateDocument(ODKE_DB,COL_MATCHES,params.match,{referees:newList})
      } catch (error) {
        console.log('Remove Ref from Match: ', error.message);
      } finally {
        getMatchData()
        updateMatchEmails()
      }
    }

    // END OF REMOVE REFS FROM MATCHES FUNCTIONS
    useEffect(()=>{
        getMatchData()
    },[])
    
    let date = new Date(match.fulldate).toLocaleDateString('el-GR')

    //console.log('Match data: ', teams[0]);
    //console.log('Refs in Match: ', refsInMatch);
    //console.log('Assigned Refs: ', assignedRefs);
    //console.log('Chosen Ref:', chosenRef);
    console.log('Chosen Ref Email is:', chosenRefEmail);

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
          <td className="border px-4 py-2">{match.refA} {match.refA && <button onClick={()=>removeRefAfromMatch(match.refA)} className="bg-red-500 hover:bg-red-700 text-white p-1">Αφαίρεση</button>}</td>
          <td className="border px-4 py-2">{match.refB} {match.refB && <button onClick={()=>removeRefBfromMatch(match.refB)} className="bg-red-500 hover:bg-red-700 text-white p-1">Αφαίρεση</button>}</td>
          <td className="border px-4 py-2">{match.komisario} {match.komisario && <button onClick={()=>removeKomisariofromMatch(match.komisario)} className="bg-red-500 hover:bg-red-700 text-white p-1">Αφαίρεση</button>}</td>
        </tr>
      </tbody>
    </table>
  </>
</div>
{ assignedRefs !=0 ? <div className="flex w-full justify-center text-center p-10">

    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={(e)=>handleSubmitEmail(e,date,teams[0].name,teams[1].name,match.arena,match.matchtime,match.refA,match.refB,match.komisario)}>Αποστολή Ενημέρωσης</button>

   </div> : null }
</div>

        <form onSubmit={(e) => {
            e.preventDefault();
            handleAssignRefA('')
            setRefA('')
          }}>
            <label htmlFor={'refa'}>Ορισμός Διατητή A</label>
            <select
              name={'refa'}
              id={'refa'}
              onChange={(e) => setRefA(e.target.value)}
              value={refA}
              required
              disabled={disabledA}
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Επιλέξτε Διαιτητή A</option>
              {refsInMatch.map((r) => (
                <option value={r.name} key={r.$id}>{r.name}</option>
              ))}
            </select>
            <button disabled={disabledA} type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Ορισμός</button>
          </form>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAssignRefB();
            setRefB('');
          }}>
            <label htmlFor={'refb'}>Ορισμός Διατητή B</label>
            <select
              name={'refb'}
              id={'refb'}
              onChange={(e) => setRefB(e.target.value)}
              value={refB}
              required
              disabled={disabledB}
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Επιλέξτε Διαιτητή B</option>
              {refsInMatch.map((r) => (
                <option value={r.name} key={r.$id}>{r.name}</option>
              ))}
            </select>
            <button disabled={disabledB} type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Ορισμός</button>
          </form>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleKomissario();
            setKomisario('');
          }}>
            <label htmlFor={'kom'}>Ορισμός Κομισάριου</label>
            <select
              name={'kom'}
              id={'kom'}
              onChange={(e) => setKomisario(e.target.value)}
              value={komisario}
              required
              disabled={disabledC}
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Επιλέξτε Κομισάριο</option>
              {refsInMatch.map((r) => (
                <option value={r.name} key={r.$id}>{r.name}</option>
              ))}
            </select>
            <button disabled={disabledC} type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Ορισμός</button>
          </form>
        </div>
        </main>
    )
}

export default matchPage