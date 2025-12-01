export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Estafee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
