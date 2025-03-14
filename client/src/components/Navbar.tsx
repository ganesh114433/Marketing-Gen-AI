import { useLocation } from "wouter";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [location] = useLocation();
  
  // Get page title based on current location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/content-generator":
        return "Content Generation";
      case "/image-generator":
        return "Image Generation";
      case "/content-calendar":
        return "Content Calendar";
      case "/campaign-analytics":
        return "Campaign Analytics";
      case "/google-ads":
        return "Google Ads";
      case "/google-analytics":
        return "Google Analytics";
      default:
        return "Page Not Found";
    }
  };
  
  return (
    <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden rounded-full h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-100"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
        <h2 className="text-xl font-semibold font-heading hidden sm:block">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="py-2 pl-10 pr-4 bg-slate-100 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-slate-500"></i>
        </div>
        
        <button className="relative rounded-full h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-100">
          <i className="ri-notification-3-line text-xl"></i>
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"></span>
        </button>
        
        <button className="relative rounded-full h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-100">
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
