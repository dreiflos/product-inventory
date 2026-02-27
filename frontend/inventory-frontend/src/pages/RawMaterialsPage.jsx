import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRawMaterials } from '../store/inventorySlice';
import { Plus, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

const RawMaterialsPage = () => {
  const dispatch = useDispatch();
  const { rawMaterials, loading } = useSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchRawMaterials());
  }, [dispatch]);

  const lowStock = rawMaterials.filter((m) => m.stockQuantity <= 10).length;
  const adequate = rawMaterials.filter((m) => m.stockQuantity > 10).length;
  const maxStock = rawMaterials.length > 0 ? Math.max(...rawMaterials.map((m) => m.stockQuantity)) : 1;

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 flex flex-col px-4 sm:px-8 xl:px-12 py-8">
      <div className="fixed inset-0 grid-dots pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 5% 90%, rgba(245,158,11,.04) 0%, transparent 55%)'
      }} />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col flex-1">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-erp text-amber-500 text-xs tracking-widest uppercase mb-3">
              // controle de estoque
            </p>
            <h1
              className="font-display font-extrabold text-white leading-none tracking-tight"
              style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', lineHeight: 1 }}
            >
              Matérias <span className="text-amber-400">Primas</span>
            </h1>
            <p className="font-mono-erp text-slate-600 text-xs mt-2">
              Gerencie os insumos disponíveis para produção
            </p>
          </div>

          <button className="self-start sm:self-auto flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-md font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20">
            <Plus size={15} /> Nova Matéria-Prima
          </button>
        </header>

        {/* KPI mini strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="relative overflow-hidden top-accent bg-slate-900/70 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
            <p className="font-mono-erp text-slate-500 text-xs uppercase tracking-widest mb-1.5">Total de Insumos</p>
            <p className="font-display font-bold text-white text-3xl">{rawMaterials.length}</p>
          </div>
          <div className="relative overflow-hidden top-accent bg-slate-900/70 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-sm">
            <p className="font-mono-erp text-slate-500 text-xs uppercase tracking-widest mb-1.5">Estoque Adequado</p>
            <p className="font-display font-bold text-emerald-400 text-3xl">{adequate}</p>
          </div>
          <div className="relative overflow-hidden top-accent bg-slate-900/70 border border-red-500/20 rounded-xl p-5 backdrop-blur-sm col-span-2 sm:col-span-1">
            <p className="font-mono-erp text-slate-500 text-xs uppercase tracking-widest mb-1.5">Estoque Baixo</p>
            <p className="font-display font-bold text-red-400 text-3xl">{lowStock}</p>
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-hidden top-accent rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-amber-400 animate-spin" />
              <p className="font-mono-erp text-slate-500 text-sm animate-pulse">carregando estoque...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Insumo</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Qtd. Estoque</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Nível</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rawMaterials.map((material) => {
                    const isLow = material.stockQuantity <= 10;
                    const pct = maxStock > 0 ? (material.stockQuantity / maxStock) * 100 : 0;
                    return (
                      <tr
                        key={material.id}
                        className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono-erp text-xs text-slate-600">
                            #{String(material.id).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isLow ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                            }`}>
                              <Layers size={14} className={isLow ? 'text-red-400' : 'text-amber-400'} />
                            </div>
                            <span className="font-display font-semibold text-white text-sm">{material.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-display font-bold text-white text-lg">
                            {material.stockQuantity}
                            <span className="font-mono-erp text-slate-600 text-xs ml-1 font-normal">un</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 min-w-32">
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="bar-fill h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: isLow
                                  ? 'linear-gradient(90deg,#ef4444,#f87171)'
                                  : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 font-mono-erp text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                              <AlertTriangle size={10} /> Baixo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-mono-erp text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                              <CheckCircle2 size={10} /> Adequado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rawMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Layers size={40} className="text-slate-800" />
              <p className="font-mono-erp text-slate-600 text-sm">// nenhuma matéria-prima cadastrada</p>
              <p className="font-mono-erp text-slate-700 text-xs">o algoritmo de sugestão precisa de insumos</p>
            </div>
          )}
        </div>

        <footer className="mt-12 pt-5 border-t border-slate-900 flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono-erp text-slate-700 text-xs">
            autoflex erp · matérias-primas · {new Date().toLocaleDateString('pt-BR')}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default RawMaterialsPage;