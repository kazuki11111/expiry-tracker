import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'ホーム', icon: '📋' },
  { to: '/scan', label: 'スキャン', icon: '📷' },
  { to: '/add', label: '追加', icon: '➕' },
  { to: '/settings', label: '設定', icon: '⚙' },
];

export function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <h1 className="text-center text-lg font-bold text-gray-800">
          賞味期限マネージャー
        </h1>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 border-t bg-white shadow-inner">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center py-2 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
