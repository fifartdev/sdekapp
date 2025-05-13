import React, { useEffect, useState } from 'react';
import { ODKE_DB, db, COL_MATCHES, Query, COL_REFS } from '@/app/utils/appwrite';

function ParticipationCounter({ id, start, end, year }) {
    const [mdays, setMdays] = useState([]);
    const [ref, setRef] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refId, setRefId] = useState(id);

    const startDate = new Date(start);
    const endDate = new Date(end);

    const getRefMatches = async () => {
        setLoading(true);
        try {
            const resp = await db.getDocument(ODKE_DB, COL_REFS, refId);
            setRef(resp);
            if (resp) {
                const res = await db.listDocuments(
                    ODKE_DB,
                    COL_MATCHES,
                    [
                        Query.contains('referees', [resp.name]),
                        Query.orderAsc('fulldate'),
                        Query.between('fulldate', startDate.toISOString(), endDate.toISOString())
                    ]
                );
                setMdays(res.documents);
            }
        } catch (error) {
            console.log('Error from Participation Counter Component: ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRefMatches();
    }, []);

    return (
        <>
            {loading
                ? <div className="w-2 h-2 border-8 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
                : <><br/> <strong>Σύνολο Συμμετοχών για το {year} : </strong> {mdays.length}</>
            }
        </>
    );
}

export default ParticipationCounter;
