export default function loadingPageArenas(){
    return (
        <main className="flex justify-center items-center min-h-screen">
       <div className="w-full max-w-lg p-4">
  <div className="animate-pulse">
    <h1 className="text-gray-700 font-bold text-xl mb-4">Περιμένετε όσο φορτώνει...</h1>
    <div className="bg-gray-300 h-4 w-32 rounded-full mb-2"></div>
    <div className="bg-gray-300 h-4 w-48 rounded-full mb-2"></div>
    <div className="bg-gray-300 h-4 w-24 rounded-full mb-2"></div>
    <div className="bg-gray-300 h-4 w-64 rounded-full mb-2"></div>
    <div className="bg-gray-300 h-4 w-40 rounded-full mb-2"></div>
  </div>
</div>
</main>
    )
}