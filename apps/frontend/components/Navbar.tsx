export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-white">
              ESTAFEE
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
