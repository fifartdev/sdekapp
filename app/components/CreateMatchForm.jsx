'use client'
import {useEffect, useState} from 'react'
import { db, COL_DATES, ID, ODKE_DB, COL_MATCHES, COL_TEAMS, Query } from '@/app/utils/appwrite'
import { useRouter } from 'next/navigation'


const CreateMatchForm = ({dateId}) => {
    const [teams, setTeams] = useState([])
    const [teamA, setTeamA] = useState('')
    const [teamB, setTeamB] = useState('')
    const [matches, setMatches] = useState([])
    const [disabled, setDisabled] = useState(false)
    const [date, setDate] = useState()

    //console.log(dateId);
    
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
        console.log(final);
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
        getCurrentMatches()
    },[])

    useEffect(()=>{
        getTeams()
    },[])

    // console.log('date value is: ', props.date);   
    // console.log('Current matches: ', matches);
    //console.log('DATE IS: ', date);
    console.log('DATE ID IS: ', date);
    
    
    const router = useRouter()

    const handleCreateMatch = async (e) => {

        try {
            e.preventDefault()
            window.alert("Ο Αγώνας Δημιουργήθηκε")
            const newMatch = await db.createDocument(ODKE_DB, COL_MATCHES, ID.unique(), {
            date_id: dateId,
            teams: [teamA, teamB]
            })
            await db.updateDocument(ODKE_DB, COL_DATES, dateId, {match:[...matches, newMatch]})
            console.log('The Match is', newMatch);
            router.refresh(`/dates/`)
            router.push(`/dates/`)
            setTeamA('')
            setTeamB('')
            getCurrentMatches()
            getTeams()
        } catch (error) {
            if(error.code===409){
                alert('Teams Exist')
            } else {
                console.log(error.message);
            }
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
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Προσθήκη</button>
  </form>
</>

  )
}

export default CreateMatchForm
