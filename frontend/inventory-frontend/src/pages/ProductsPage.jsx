import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/inventorySlice';
import { Plus, Package, ChevronRight } from 'lucide-react';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 flex flex-col px-4 sm:px-8 xl:px-12 py-8">
      <div className="fixed inset-0 grid-dots pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 90% 10%, rgba(59,130,246,.05) 0%, transparent 55%)'
      }} />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col flex-1">

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-erp text-blue-500 text-xs tracking-widest uppercase mb-3">
              // catálogo de produtos
            </p>
            <h1
              className="font-display font-extrabold text-white leading-none tracking-tight"
              style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', lineHeight: 1 }}
            >
              Produtos <span className="text-blue-400">Acabados</span>
            </h1>
            <p className="font-mono-erp text-slate-600 text-xs mt-2">
              {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-md font-display font-semibold text-sm tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20">
            <Plus size={15} /> Novo Produto
          </button>
        </header>

        <div className="relative overflow-hidden top-accent rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Nome do Produto</th>
                  <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Preço de Venda</th>
                  <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Composição</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono-erp text-xs text-slate-600">
                        #{String(product.id).padStart(3, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-blue-400" />
                        </div>
                        <span className="font-display font-semibold text-white text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-display font-bold text-emerald-400 text-base">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center font-mono-erp text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                        {product.compositions?.length || 0} insumos
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Package size={40} className="text-slate-800" />
              <p className="font-mono-erp text-slate-600 text-sm">// nenhum produto cadastrado</p>
            </div>
          )}
        </div>

        <footer className="mt-12 pt-5 border-t border-slate-900 flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono-erp text-slate-700 text-xs">
            autoflex erp · produtos acabados · {new Date().toLocaleDateString('pt-BR')}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default ProductsPage;