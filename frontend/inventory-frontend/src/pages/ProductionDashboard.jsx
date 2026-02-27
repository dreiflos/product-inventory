import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSuggestions } from '../store/inventorySlice';
import { Package, RefreshCw, DollarSign, Award, Zap, Activity } from 'lucide-react';

const ProductionDashboard = () => {
  const dispatch = useDispatch();
  const { suggestions = [], loading, total = 0 } = useSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  const totalUnits = suggestions.reduce((sum, item) => sum + (item.quantityToProduce ?? 0), 0);
  const maxSubtotal = suggestions.length > 0 ? Math.max(...suggestions.map((s) => s.subtotal)) : 1;
  const bestProduct = suggestions.length > 0
    ? suggestions.reduce((prev, cur) => (prev.subtotal > cur.subtotal ? prev : cur))
    : null;

  return (
    <div className="w-full h-full min-h-full bg-slate-950 text-slate-100 flex flex-col px-4 sm:px-8 xl:px-12 py-8">

      <div className="fixed inset-0 grid-dots pointer-events-none z-0" />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 5% 0%, rgba(16,185,129,.06) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 95% 100%, rgba(59,130,246,.05) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col w-full max-w-screen-2xl mx-auto">

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="dot-live" />
              <span className="font-mono-erp text-emerald-500 text-xs tracking-widest uppercase">
                Oracle Database · Tempo Real
              </span>
            </div>
            <h1
              className="font-display font-extrabold text-white leading-none tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1 }}
            >
              Sugestão de{' '}
              <span className="text-emerald-400">Produção</span>
            </h1>
            <p className="font-mono-erp text-slate-600 text-xs mt-2 tracking-wide">
              // Autoflex ERP · Painel de Planejamento
            </p>
          </div>

          <button
            onClick={() => dispatch(fetchSuggestions())}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-md font-display font-semibold text-sm tracking-widest uppercase transition-all duration-200 hover:bg-emerald-500/10 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'transparent' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 min-h-96">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
            <p className="font-mono-erp text-slate-500 text-sm tracking-widest animate-pulse">
              consultando banco de dados...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                {
                  icon: <DollarSign size={17} />,
                  label: 'Receita Estimada',
                  value: `R$ ${(total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  sub: 'valor total de produção sugerida',
                  border: 'border-emerald-500/20',
                  iconCls: 'bg-emerald-500/10 text-emerald-400',
                  valCls: 'text-emerald-300',
                },
                {
                  icon: <Package size={17} />,
                  label: 'Unidades a Produzir',
                  value: totalUnits.toLocaleString('pt-BR'),
                  sub: `${suggestions.length} produto${suggestions.length !== 1 ? 's' : ''} na fila`,
                  border: 'border-blue-500/20',
                  iconCls: 'bg-blue-500/10 text-blue-400',
                  valCls: 'text-blue-300',
                },
                {
                  icon: <Award size={17} />,
                  label: 'Produto Destaque',
                  value: bestProduct?.productName ?? '—',
                  sub: bestProduct
                    ? `R$ ${bestProduct.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'sem dados',
                  border: 'border-amber-500/20',
                  iconCls: 'bg-amber-500/10 text-amber-400',
                  valCls: 'text-amber-300',
                },
              ].map(({ icon, label, value, sub, border, iconCls, valCls }) => (
                <div
                  key={label}
                  className={`relative overflow-hidden top-accent bg-slate-900/70 border ${border} rounded-xl p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`inline-flex items-center justify-center p-2.5 rounded-lg ${iconCls} mb-4`}>
                    {icon}
                  </div>
                  <p className="font-mono-erp text-slate-500 text-xs uppercase tracking-widest mb-1.5">{label}</p>
                  <p
                    className={`font-display font-bold ${valCls} leading-tight truncate`}
                    style={{ fontSize: 'clamp(16px, 2vw, 26px)' }}
                  >
                    {value}
                  </p>
                  <p className="font-mono-erp text-slate-600 text-xs mt-1 truncate">{sub}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Activity size={13} className="text-slate-600 flex-shrink-0" />
              <span className="font-display font-semibold text-slate-500 uppercase tracking-widest text-sm whitespace-nowrap">
                Sugestões Detalhadas
              </span>
              <div className="flex-1 h-px bg-slate-800/80" />
              <span className="font-mono-erp text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full whitespace-nowrap">
                {suggestions.length} itens
              </span>
            </div>

            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 min-h-64 border border-dashed border-slate-800 rounded-xl">
                <Package size={40} className="text-slate-800" />
                <p className="font-mono-erp text-slate-600 text-sm">// nenhuma sugestão disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {suggestions.map((item, idx) => {
                  const isBest = bestProduct?.productName === item.productName;
                  const pct = maxSubtotal > 0 ? (item.subtotal / maxSubtotal) * 100 : 0;

                  return (
                    <div
                      key={idx}
                      className={`relative overflow-hidden top-accent rounded-xl p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                        isBest
                          ? 'bg-emerald-950/50 border border-emerald-500/35 hover:border-emerald-400/50'
                          : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono-erp text-slate-600 text-xs">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        {isBest ? (
                          <span className="flex items-center gap-1 font-mono-erp text-xs text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded-full">
                            <Award size={9} /> Top
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-mono-erp text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <Zap size={9} /> Produzir
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-white text-lg leading-snug mb-4 line-clamp-2 min-h-14">
                        {item.productName}
                      </h3>

                      <div className="h-px bg-slate-800/80 mb-4" />

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-erp text-slate-500 text-xs uppercase tracking-wider">Quantidade</span>
                          <span className="font-display font-bold text-blue-300 text-xl leading-none">
                            {item.quantityToProduce}
                            <span className="font-mono-erp text-slate-600 text-xs ml-1 font-normal">un</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-erp text-slate-500 text-xs uppercase tracking-wider">Subtotal</span>
                          <span className="font-display font-bold text-emerald-400 text-base leading-none">
                            R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="bar-fill h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: isBest
                              ? 'linear-gradient(90deg,#10b981,#34d399)'
                              : 'linear-gradient(90deg,#3b82f6,#60a5fa)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <footer className="mt-12 pt-5 border-t border-slate-900 flex items-center justify-between gap-4 flex-wrap">
              <span className="font-mono-erp text-slate-700 text-xs">
                autoflex erp · oracle database · {new Date().toLocaleDateString('pt-BR')}
              </span>
              <div className="flex items-center gap-2">
                <div className="dot-live" />
                <span className="font-mono-erp text-slate-700 text-xs">connected</span>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboard;