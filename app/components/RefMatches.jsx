import React, { useEffect, useState } from 'react';
import { ODKE_DB, db, COL_MATCHES, Query, COL_REFS } from '@/app/utils/appwrite';

function RefMatches({ id, start, end }) {
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
                :
                <div className="overflow-x-auto">
  <table className="min-w-full bg-white shadow-md rounded-md">
    <thead>
      <tr>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ημ/νία</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ώρα</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Γήπεδο</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ομάδες</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Διατητής Α</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Διατητής Β</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Κομισάριος</th>
      </tr>
    </thead>
    <tbody>
      {mdays?.map((m, index) => (
        <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 transition">
          <td className="px-3 py-2 whitespace-nowrap">{new Date(m.fulldate).toLocaleDateString('el-Gr')}</td>
          <td className="px-3 py-2 whitespace-nowrap">{m.matchtime}</td>
          <td className="px-3 py-2 whitespace-nowrap">{m.arena}</td>
          <td className="px-3 py-2 whitespace-nowrap">{m.teams[0].name} - {m.teams[1].name}</td>
          <td className={`px-3 py-2 whitespace-nowrap ${ref?.name === m.refA ? 'text-red-600 font-bold' : ''}`}>{m.refA}</td>
          <td className={`px-3 py-2 whitespace-nowrap ${ref?.name === m.refB ? 'text-red-600 font-bold' : ''}`}>{m.refB}</td>
          <td className={`px-3 py-2 whitespace-nowrap ${ref?.name === m.komisario ? 'text-red-600 font-bold' : ''}`}>{m.komisario}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

            }
        </>
    );
}

export default RefMatches;
