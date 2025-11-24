'use client'

import React, {useEffect, useState} from 'react'
import Link from 'next/link'
import { ODKE_DB, db, COL_REFS } from '@/app/utils/appwrite'
import RefMatches from '@/app/components/RefMatches'

const refereePage = (params) => {
    //console.log('params are: ',params.params.id);
    
    const [ref, setRef] = useState(null)
    const [activeTab, setActiveTab] = useState("tab1");
    // console.log(ref);

    const getRefMatches = async ()=> {
      try {
        const resp = await db.getDocument(ODKE_DB, COL_REFS, params.params.id)
        setRef(resp)        
      } catch (error) {
        console.log('Error from Refs Page',error.message);
      }
    }


    

    useEffect(()=>{
      getRefMatches()
    },[])
    
    

    return (
      <main className="flex justify-center min-h-screen">
       <div className="w-full p-10">
       <div className='flex justify-center bg-cyan-500 p-5'>
        <img src="https://oseka.gr/wp-content/uploads/2018/11/logo-oseka-white.png"/>
      </div>
  <nav className="flex items-center justify-between flex-wrap bg-blue-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/">
          <span className="font-semibold text-xl tracking-tight cursor-pointer m-3">Αρχική</span>
        </Link>
      </div>
      </nav>
      <div className="text-xl font-bold mb-4 text-center mt-3"><Link style={{backgroundColor:'black',color:'white',padding:4, borderRadius:5}} href={'/referees'}>Πίσω</Link> - Σελίδα Διαιτητή: {ref?.name}</div>
      <div role="tablist" className="flex border-b border-gray-200">
        <button
          role="tab"
          aria-selected={activeTab === "tab1"}
          aria-controls="tab1-panel"
          id="tab1"
          onClick={() => setActiveTab("tab1")}
          className={`py-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "tab1"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-500"
          }`}
        >
          2025-26
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "tab2"}
          aria-controls="tab2-panel"
          id="tab2"
          onClick={() => setActiveTab("tab2")}
          className={`py-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "tab2"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-500"
          }`}
        >
          2024-25
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "tab3"}
          aria-controls="tab3-panel"
          id="tab3"
          onClick={() => setActiveTab("tab3")}
          className={`py-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "tab3"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-500"
          }`}
        >
          2023-24
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
       {activeTab === "tab1" && (
          <div
            id="tab1-panel"
            role="tabpanel"
            aria-labelledby="tab1"
            className="p-4 bg-gray-50 rounded"
          >
            <h2 className="text-lg font-semibold">2025-26</h2>
            <p className="mt-2 text-gray-700">
                      <RefMatches id={params.params.id} start={'2025-11-01T00:00:00.000+00:00'} end={'2026-06-01T00:00:00.000+00:00'} />
            </p>
          </div>
        )}
        {activeTab === "tab2" && (
          <div
            id="tab2-panel"
            role="tabpanel"
            aria-labelledby="tab2"
            className="p-4 bg-gray-50 rounded"
          >
            <h2 className="text-lg font-semibold">2024-25</h2>
            <p className="mt-2 text-gray-700">
                      <RefMatches id={params.params.id} start={'2024-11-01T00:00:00.000+00:00'} end={'2025-06-01T00:00:00.000+00:00'} />
            </p>
          </div>
        )}
        {activeTab === "tab3" && (
          <div
            id="tab3-panel"
            role="tabpanel"
            aria-labelledby="tab3"
            className="p-4 bg-gray-50 rounded"
          >
            <h2 className="text-lg font-semibold">2023-24</h2>
            <p className="mt-2 text-gray-700">
                      <RefMatches id={params.params.id} start={'2023-11-01T00:00:00.000+00:00'} end={'2024-06-01T00:00:00.000+00:00'} />
            </p>
          </div>
        )}
      </div>
    </div>
    </main>
  )
}

export default refereePage