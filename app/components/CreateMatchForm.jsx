'use client'
import {useEffect, useState} from 'react'
import { db, COL_DATES, ID, ODKE_DB, COL_MATCHES, COL_REFS, COL_TEAMS, Query, COL_ARENAS } from '@/app/utils/appwrite'
import { useRouter } from 'next/navigation'


const CreateMatchForm = ({dateId}) => {
    const [teams, setTeams] = useState([])
    const [teamA, setTeamA] = useState('')
    const [teamB, setTeamB] = useState('')
    const [matches, setMatches] = useState([])
    const [disabled, setDisabled] = useState(false)
    const [date, setDate] = useState()
    const [arenas, setArenas] = useState([])
    const [arena, setArena] = useState('')
    const [matchTime, setMatchTime] = useState('')
    const [refs, setRefs] = useState([])
    const [emails, setEmails] = useState([])
    

    const getAllRefsEmails = async ()=>{
      try {
        const res = await db.listDocuments(ODKE_DB, COL_REFS, [Query.select(["email"])])
        setEmails(res.documents)
        
      } catch (error) {
        console.log('Error retrieving Refs Emails', error.message);
      }
      
    }

    useEffect(()=>{
      getAllRefsEmails()
    },[])

    const getAllRefs = async () => {

      try {
        const res = (await db.listDocuments(ODKE_DB,COL_REFS, [ Query.select('user_id')])).documents
        let refIds = []
        res.map(r=> refIds.push(r.user_id))
        setRefs(refIds)
        
      } catch (error) {
        console.log('Get all refs error', error.message);
      }

    }

    //console.log(dateId);


    const getArenas = async ()=> {
      try {
        const res = await db.listDocuments(ODKE_DB,COL_ARENAS)
        setArenas(res.documents)
      } catch (error) {
        console.log('ARENA ERROR: ', error.message);
      }
    }
    // console.log('Arenas are: ',arenas);

    // GET ALL TEAMS
    const getTeams = async ()=> { try {
        //FIRST ALL AVAILABLE TEAMS
        const theDate = await db.getDocument(ODKE_DB, COL_DATES, dateId)
        setDate(theDate.date)
        const res = await db.listDocuments(ODKE_DB,COL_TEAMS)
        const availableTeams = res.documents        
        const avTids = []
        availableTeams.map(t=>avTids.push(t.$id))
        //CHECK IF THERE ARE TEAMS WITH MATCHES
        const data = await db.listDocuments(ODKE_DB, COL_DATES, [Query.equal('$id',dateId)])
        const participatingTeams = data.documents[0].match
        const currentTeams = []
        participatingTeams.map(p=>{
            p.teams.map(t=>currentTeams.push(t.$id))
            })
        //SET FINAL AVAILABLE NUMBER
        const final = avTids.filter(item => !currentTeams.includes(item)) 
        //console.log(final);
        if(final.length === 0){
            setTeams([])
            setDisabled(true)
        } else {

            const definiteData = await db.listDocuments(ODKE_DB, COL_TEAMS, [
                Query.equal('$id', final)
            ])
            setTeams(definiteData.documents)
        }
    } catch (error) {
        console.log('Teams Error', error.message);
    } } 
    
    // console.log('FINAL AVAILABLE ARE: ', teams);
    const getCurrentMatches = async () => {
        try {
            const resp = await db.listDocuments(ODKE_DB, COL_DATES, [Query.equal('$id',dateId)])
            setMatches(resp.documents[0].match)
        } catch (error) {
            console.log('Matches error is: ',error.message);
        }
    }

    useEffect(()=>{
      getAllRefs()
    },[])

    useEffect(()=>{
        getCurrentMatches()
    },[])

    useEffect(()=>{
        getTeams()
    },[])

    useEffect(()=>{
      getArenas()
    },[])

  
    //console.log('Current matches: ', matches);
    //console.log('DATE IS: ', date);
    // console.log('DATE ID IS: ', date);
    //console.log('Refs are: ', refs);
    
    
    const router = useRouter()

    // const handleSubmitEmail = async (e,em,date,ateam,bteam) => {
    //   e.preventDefault();
      
    //   let finalDate = new Date(date).toLocaleDateString('el-GR')
      
    //   try {
    //       await fetch('/api/send', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ email:em, subject:`Προστέθηκε νέος Αγώνας στις ${finalDate} και ώρα ${matchTime}`, message:`Ο αγώνας που προστέθηκε είναι o ${ateam}-${bteam}. Έχετε μέχρι και τρία (24ωρα) πριν από την έναρξη του αγώνα για να δηλώσετε τη διαθεσιμότητα σας. Διαφορετικά είσατε αυτομάτως διαθέσιμος/η και μπορείτε να επιλεγείτε.` }),
    //       });
        
    //   } catch (err) {
    //     console.error('Failed to send email:', err);
    //   }
    // };

    const handleCreateMatch = async (e) => {

        try {
          if(teamA===teamB){
            window.alert('Επιλέξετε εκ νέου τις 2 ομάδες!')
            return 
          }
            e.preventDefault()
            const newMatch = await db.createDocument(ODKE_DB, COL_MATCHES, ID.unique(), {
            date_id: dateId,
            teams: [teamA, teamB],
            arena: arena,
            matchtime: matchTime,
            fulldate: date,
            availablereferees:refs
            })
            await db.updateDocument(ODKE_DB, COL_DATES, dateId, {match:[...matches, newMatch]})
            //emails.forEach(async (em)=>{ await handleSubmitEmail(e,em.email,date,newMatch.teams[0].name,newMatch.teams[1].name)})
            //console.log('The Match is', newMatch);
            setTeamA('')
            setTeamB('')
            setArena('')
            getCurrentMatches()
            getTeams()
            window.alert("Ο Αγώνας Δημιουργήθηκε")
        } catch (error) {
            if(error.code===409){
                alert('Teams Exist')
            } else {
                console.log(error.message);
            }
        } finally {
            router.replace(`/dates/`)
            router.refresh()
        }
        
    }

    // console.log('Team A ', teamA);
    // console.log('Team B ', teamB);

  return (
    <>
  <div className="text-lg font-bold mb-4">Προσθήκη Αγώνα</div>
  <form onSubmit={handleCreateMatch} className="max-w-md mx-auto">
    <div className="mb-4">
      <label htmlFor="omadaA" className="block text-gray-700 text-sm font-bold mb-2">Ομάδα Α</label>
      <select
        name="omadaA"
        id="omadaA"
        onChange={(e) => setTeamA(e.target.value)}
        value={teamA}
        required
        disabled={disabled}
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="" disabled>
          Επιλέξτε Ομάδα Α
        </option>
        {teams.map((t) => (
          <option value={t.$id} key={t.$id}>{t.name}</option>
        ))}
      </select>
    </div>
    <div className="mb-4">
      <label htmlFor="omadaB" className="block text-gray-700 text-sm font-bold mb-2">Ομάδα Β</label>
      <select
        name="omadaB"
        id="omadaB"
        onChange={(e) => setTeamB(e.target.value)}
        value={teamB}
        required
        disabled={disabled}
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="" disabled>
          Επιλέξτε Ομάδα Β
        </option>
        {teams.filter(o => o.$id !== teamA).map((t) => (
          <option value={t.$id} key={t.$id}>{t.name}</option>
        ))}
      </select>
    </div>
    <div className="mb-4">
      <label htmlFor="arena" className="block text-gray-700 text-sm font-bold mb-2">Γήπεδο</label>
      <select
        name="arena"
        id="arena"
        onChange={(e) => setArena(e.target.value)}
        value={arena}
        disabled={disabled}
        required
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="" disabled>
          Επιλέξτε Γήπεδο
        </option>
        {arenas.map((a) => (
          <option value={a.name} key={a.$id}>{a.name}</option>
        ))}
      </select>
    </div>
    <div className="mb-4">
    <label htmlFor="match-time" className="block text-gray-700">Ώρα Αγώνα:</label> 
    <input value={matchTime} onChange={(e=>setMatchTime(e.target.value))} disabled={disabled} type="time" id="match-time" name="match-time" className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required/>
    </div>
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Προσθήκη</button>
  </form>
</>

  )
}

export default CreateMatchForm
