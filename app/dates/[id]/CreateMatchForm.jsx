'use client'
import {useEffect, useState} from 'react'
import { db, COL_DATES, ID, ODKE_DB, COL_MATCHES, COL_TEAMS, Query } from '@/utils/appwrite'
import { useRouter } from 'next/navigation'


export default function CreateMatchForm({date, dateId}) {
    const [teams, setTeams] = useState([])
    const [teamA, setTeamA] = useState('')
    const [teamB, setTeamB] = useState('')
    const [matches, setMatches] = useState([])
    const [disabled, setDisabled] = useState(false)
       
    // GET ALL TEAMS
    const getTeams = async ()=> { try {
        //FIRST ALL AVAILABLE TEAMS
        const res = await db.listDocuments(ODKE_DB,COL_TEAMS)
        const availableTeams = res.documents        
        const avTids = []
        availableTeams.map(t=>avTids.push(t.$id))
        //CHECK IF THERE ARE TEAMS WITH MATCHES
        const data = await db.listDocuments(ODKE_DB, COL_DATES, [Query.equal('date',date)])
        const participatingTeams = data.documents[0].match
        const currentTeams = []
        participatingTeams.map(p=>{
            p.teams.map(t=>currentTeams.push(t.$id))
            })
        //SET FINAL AVAILABLE NUMBER
        const final = avTids.filter(item => !currentTeams.includes(item)) 
        // console.log(final);
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
            const resp = await db.listDocuments(ODKE_DB, COL_DATES, [Query.equal('date',date)])
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

   
    //console.log('Current matches: ', matches);
    // console.log('DATE IS: ', date);
    // console.log('DATE ID IS: ', dateId);
    
    
    const router = useRouter()

    const handleCreateMatch = async (e) => {

        try {
            e.preventDefault()
            //window.alert(teamA+'-'+teamB)
            const newMatch = await db.createDocument(ODKE_DB, COL_MATCHES, ID.unique(), {
            date_id: dateId,
            teams: [teamA, teamB]
            })
            await db.updateDocument(ODKE_DB, COL_DATES, dateId, {match:[...matches, newMatch]})
            console.log('The Match is', newMatch);
            router.push(`/dates/${dateId}`)
            router.refresh(`/dates/${dateId}`)
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
    <div>CreateMatchForm</div>
    <form onSubmit={handleCreateMatch}>
    <div className="mb-4">
    <label htmlFor="omadaA">Ομάδα Α</label>
    <select
      name="select"
      id="omadaA"
      onChange={(e) => {
        setTeamA(e.target.value) 
        }}
      value={teamA}
      required
      disabled={disabled}
      >
        <option value="" disabled>
          Επιλέξετε Ομάδα Α
          </option>
        {teams.map((t)=>{
          return (
            <option value={t.$id} key={t.$id}>{t.name}</option>
          )
        })}
      </select>
  </div>
  <div className="mb-4">
    <label htmlFor="omadaΒ" >Ομάδα B</label>
    <select
      name="select"
      id="omadaΒ"
      onChange={(e) => {
        setTeamB(e.target.value)
    }}
      value={teamB}
      required
      disabled={disabled}
      >
         <option value="" disabled>
          Επιλέξετε Ομάδα B
          </option>
        {teams.filter(o => o.$id !== teamA).map((t)=>{
          
          return (
            <option value={t.$id} key={t.$id}>{t.name}</option>
          )
        })}
      </select>
  </div>
    <button type="submit">Δημιουργία</button>
    </form>
    </>
  )
}
