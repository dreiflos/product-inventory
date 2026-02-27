import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, Settings, LogOut } from 'lucide-react';

const Layout = () => {
    const menuItems = [
        { 
            path: '/', 
            name: 'Dashboard de Produção', 
            icon: LayoutDashboard,
            hoverColor: 'group-hover:text-[#00c896]'
        },
        { 
            path: '/products', 
            name: 'Produtos Acabados', 
            icon: Package,
            hoverColor: 'group-hover:text-blue-400'
        },
        { 
            path: '/materials', 
            name: 'Matérias-Primas', 
            icon: Layers,
            hoverColor: 'group-hover:text-amber-400'
        },
    ];

    return (
        <div className="flex h-screen bg-[#05070a] font-sans overflow-hidden">
            
            <aside className="w-64 bg-[#05070a] border-r border-white/5 flex flex-col relative z-20">
                
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#00c896]/5 to-transparent pointer-events-none" />

                <div className="p-8 pb-10">
                    <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                        <span className="text-white">Autoflex</span>
                        <span className="text-[#00c896]"> ERP</span>
                    </h1>
                    <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest mt-1">
                        System v2.0
                    </p>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2">
                    <p className="px-4 text-slate-600 font-mono text-[10px] uppercase tracking-widest mb-2">
                        Menu Principal
                    </p>

                    {menuItems.map((item) => {
                        const Icon = item.icon; 
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `w-full flex items-center gap-3 px-4 py-3 transition-all group rounded-r-lg ${
                                        isActive 
                                        ? 'bg-gradient-to-r from-[#00c896]/10 to-transparent border-l-2 border-[#00c896] text-[#00c896] font-semibold' 
                                        : 'border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] hover:border-white/10 font-medium'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon 
                                            size={18} 
                                            className={`transition-transform group-hover:scale-110 ${!isActive ? item.hoverColor : ''}`} 
                                        />
                                        <span className="tracking-wide text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {item.name}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>


                <div className="p-4 flex flex-col gap-2 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-200 transition-colors">
                        <Settings size={16} />
                        <span className="font-medium text-sm">Configurações</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors">
                        <LogOut size={16} />
                        <span className="font-medium text-sm">Sair do Sistema</span>
                    </button>
                </div>


                <div className="p-6 bg-black/20 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00c896] shadow-[0_0_8px_#00c896] animate-pulse" />
                        <span className="text-[#00c896] font-mono text-[10px] uppercase tracking-widest">Online</span>
                    </div>
                    <span className="text-slate-600 font-mono text-[10px]">DB_SYNC</span>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-[#0a0d12] relative">
                <Outlet />
            </main>
            
        </div>
    );
};

export default Layout;