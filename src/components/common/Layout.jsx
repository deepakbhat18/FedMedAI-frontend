import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MLServiceBanner from './MLServiceBanner';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex text-[var(--text-primary)] w-full overflow-x-hidden antialiased font-sans transition-colors duration-150">
      {/* Desktop Persistent Sidebar — Normal flex child in document flow */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Column — Automatically expands to fill all remaining viewport width */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen w-full">
        {/* Top App Header */}
        <Header
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          sidebarCollapsed={sidebarCollapsed}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* ML Service Banner (alerts if ML engine is unreachable) */}
        <MLServiceBanner />

        {/* Dynamic Page Outlet with full-width responsive padding */}
        <main
          id="main-content"
          className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 min-w-0"
        >
          <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
