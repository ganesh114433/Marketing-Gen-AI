interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 md:hidden">
          <i className="ri-rocket-2-fill mr-2"></i>
          MarketingAI
        </h1>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            type="button" 
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onMenuClick}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
        
        <div className="flex-1 md:flex md:ml-6">
          <div className="max-w-lg w-full ml-auto flex">
            <div className="relative flex-1 mr-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                placeholder="Search..."
              />
            </div>
            
            <div className="flex items-center">
              <button 
                type="button" 
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <i className="ri-notification-3-line text-xl"></i>
              </button>
              <button 
                type="button" 
                className="ml-3 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <i className="ri-question-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
