
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Next.js with Tailwind CSS!</h1>
      <p className="text-lg">
        If you see this styled page, Tailwind CSS is working perfectly. 🎉
      </p>
      <button className="mt-6 px-4 py-2 bg-white text-blue-500 font-semibold rounded shadow-lg hover:bg-gray-100">
        Click Me!
      </button>
    </div>
  );
}
