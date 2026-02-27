import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProducts,
  fetchRawMaterials,
  createProduct,
  updateProduct,
  deleteProduct,
  addComposition,
  removeComposition,
} from '../store/inventorySlice';
import {
  Plus, Package, Pencil, Trash2, X, ChevronRight,
  Layers, AlertTriangle, Check, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-lg bg-[#0e1117] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h2 className="font-display font-bold text-white text-lg tracking-tight">{title}</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onClose, loading }) => (
  <Modal title="Confirmar exclusão" onClose={onClose}>
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <p className="font-mono-erp text-slate-300 text-sm text-center leading-relaxed">{message}</p>
      <div className="flex gap-3 w-full">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-display font-semibold text-sm">
          Cancelar
        </button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors font-display font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Excluir
        </button>
      </div>
    </div>
  </Modal>
);

const ProductModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const { actionLoading } = useSelector(s => s.inventory);
  const [form, setForm] = useState({ name: product?.name ?? '', price: product?.price ?? '' });
  const [error, setError] = useState('');

  const isEdit = !!product;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Nome é obrigatório.');
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) return setError('Informe um preço válido.');

    const payload = { name: form.name.trim(), price: parseFloat(form.price) };
    const action = isEdit
      ? dispatch(updateProduct({ id: product.id, data: payload }))
      : dispatch(createProduct(payload));

    const result = await action;
    if (!result.error) onClose();
    else setError(result.error.message || 'Erro ao salvar.');
  };

  return (
    <Modal title={isEdit ? 'Editar Produto' : 'Novo Produto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono-erp text-xs text-slate-500 uppercase tracking-widest mb-1.5">Nome do Produto</label>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm font-display focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
            placeholder="Ex: Produto Alpha"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-mono-erp text-xs text-slate-500 uppercase tracking-widest mb-1.5">Preço de Venda (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm font-display focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
            placeholder="0.00"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          />
        </div>
        {error && <p className="text-red-400 font-mono-erp text-xs">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-display font-semibold text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors font-display font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const CompositionPanel = ({ product }) => {
  const dispatch = useDispatch();
  const { rawMaterials, actionLoading } = useSelector(s => s.inventory);
  const [form, setForm] = useState({ rawMaterialId: '', quantity: '' });
  const [error, setError] = useState('');

  const compositions = product.compositions ?? [];
  const usedIds = compositions.map(c => c.rawMaterial?.id ?? c.rawMaterialId);
  const available = rawMaterials.filter(m => !usedIds.includes(m.id));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.rawMaterialId) return setError('Selecione um insumo.');
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Informe uma quantidade válida.');

    const result = await dispatch(addComposition({
      productId: product.id,
      data: { rawMaterialId: Number(form.rawMaterialId), quantity: Number(form.quantity) },
    }));
    if (!result.error) setForm({ rawMaterialId: '', quantity: '' });
    else setError(result.error.message || 'Erro ao adicionar.');
  };

  const handleRemove = async (cId) => {
    await dispatch(removeComposition({ productId: product.id, compositionId: cId }));
  };

  return (
    <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2">
        <Layers size={14} className="text-blue-400" />
        <span className="font-mono-erp text-xs text-slate-400 uppercase tracking-widest">Composição de Insumos</span>
      </div>
      {compositions.length > 0 && (
        <div className="divide-y divide-slate-800/60">
          {compositions.map((c) => {
            const materialName = c.rawMaterial?.name ?? c.rawMaterialName ?? `Insumo #${c.rawMaterialId}`;
            return (
              <div key={c.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-slate-300 text-sm font-display">{materialName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-erp text-xs text-slate-500">{c.quantity} un</span>
                  <button
                    onClick={() => handleRemove(c.id)}
                    disabled={actionLoading}
                    className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <form onSubmit={handleAdd} className="px-4 py-3 bg-slate-900/30 flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-display focus:outline-none focus:border-blue-500 transition-colors"
            value={form.rawMaterialId}
            onChange={e => setForm(f => ({ ...f, rawMaterialId: e.target.value }))}
          >
            <option value="">Selecionar insumo...</option>
            {available.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-display focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
            placeholder="Qtd"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
          />
          <button
            type="submit"
            disabled={actionLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 font-display font-semibold text-xs"
          >
            {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Add
          </button>
        </div>
        {error && <p className="text-red-400 font-mono-erp text-xs">{error}</p>}
        {available.length === 0 && (
          <p className="text-slate-600 font-mono-erp text-xs">// todos os insumos já foram adicionados</p>
        )}
      </form>
    </div>
  );
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(s => s.inventory);

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchRawMaterials());
  }, [dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteProduct(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 flex flex-col px-4 sm:px-8 xl:px-12 py-8">
      <div className="fixed inset-0 grid-dots pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 90% 10%, rgba(59,130,246,.05) 0%, transparent 55%)'
      }} />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col flex-1">

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-erp text-blue-500 text-xs tracking-widest uppercase mb-3">// catálogo de produtos</p>
            <h1 className="font-display font-extrabold text-white leading-none tracking-tight" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', lineHeight: 1 }}>
              Produtos <span className="text-blue-400">Acabados</span>
            </h1>
            <p className="font-mono-erp text-slate-600 text-xs mt-2">
              {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-md font-display font-semibold text-sm tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <Plus size={15} /> Novo Produto
          </button>
        </header>

        <div className="relative overflow-hidden top-accent rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-blue-400 animate-spin" />
              <p className="font-mono-erp text-slate-500 text-sm animate-pulse">carregando produtos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Nome do Produto</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Preço de Venda</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest">Composição</th>
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <>
                      <tr
                        key={product.id}
                        className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono-erp text-xs text-slate-600">#{String(product.id).padStart(3, '0')}</span>
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
                            R$ {Number(product.price).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleExpand(product.id)}
                            className="inline-flex items-center gap-1.5 font-mono-erp text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500/20 transition-colors"
                          >
                            {product.compositions?.length || 0} insumos
                            {expandedId === product.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setEditProduct(product); setShowModal(true); }}
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === product.id && (
                        <tr key={`comp-${product.id}`} className="border-b border-slate-800/40 bg-slate-900/40">
                          <td colSpan={5} className="px-6 py-4">
                            <CompositionPanel product={product} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Package size={40} className="text-slate-800" />
              <p className="font-mono-erp text-slate-600 text-sm">// nenhum produto cadastrado</p>
              <button
                onClick={() => { setEditProduct(null); setShowModal(true); }}
                className="mt-2 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-mono-erp text-xs transition-colors"
              >
                <Plus size={12} /> Adicionar primeiro produto
              </button>
            </div>
          )}
        </div>

        <footer className="mt-12 pt-5 border-t border-slate-900 flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono-erp text-slate-700 text-xs">
            autoflex erp · produtos acabados · {new Date().toLocaleDateString('pt-BR')}
          </span>
        </footer>
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          message={`Deseja excluir o produto "${deleteTarget.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ProductsPage;
