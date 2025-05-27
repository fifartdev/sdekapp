import React, { useEffect, useState } from 'react';
import { ODKE_DB, db, COL_MATCHES, Query, COL_REFS } from '@/app/utils/appwrite';

function ListMatches({ start, end }) {
    const [mdays, setMdays] = useState([]);
    const [loading, setLoading] = useState(false);

    const startDate = new Date(start);
    const endDate = new Date(end);

    const getListMatches = async () => {
        setLoading(true);
        try {
                const res = await db.listDocuments(
                    ODKE_DB,
                    COL_MATCHES,
                    [ 
                        Query.orderDesc('fulldate'),
                        Query.between('fulldate', startDate.toISOString(), endDate.toISOString()),
                        Query.limit(200)
                    ]
                );
                setMdays(res.documents);
        } catch (error) {
            console.log('Error from Participation Counter Component: ', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getListMatches();
    }, []);

    // EXPORT TO CSV CODE
        const exportToCSV = () => {
  if (!mdays.length) return;

  // Define headers
  const headers = [
    'Ημ/νία', 'Ώρα', 'Γήπεδο', 'Ομάδες', 'Διατητής Α', 'Διατητής Β', 'Κομισάριος'
  ];

  // Create CSV rows
  const rows = mdays.map(m => [
    new Date(m.fulldate).toLocaleDateString('el-Gr'),
    m.matchtime,
    m.arena,
    `${m.teams[0]?.name ?? ''} - ${m.teams[1]?.name ?? ''}`,
    m.refA,
    m.refB,
    m.komisario
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'matches.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ExportButton = ()=> {
    return(
        <button
  className="mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
  onClick={exportToCSV}
  disabled={loading || !mdays.length}
>
  Εξαγωγή σε CSV
</button>

    )
}


    // END EXPORT CODE

    return (
        <>
            {loading
                ? <div className="w-2 h-2 border-8 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
                :
                <div className="overflow-x-auto">
                    <ExportButton />
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
          <td className="px-3 py-2 whitespace-nowrap font-bold">{m.refA}</td>
          <td className="px-3 py-2 whitespace-nowrap font-bold">{m.refB}</td>
          <td className="px-3 py-2 whitespace-nowrap font-bold">{m.komisario}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

            }
        </>
    );
}

export default ListMatches;
