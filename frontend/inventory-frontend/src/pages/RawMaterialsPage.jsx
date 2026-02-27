import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from '../store/inventorySlice';
import { Plus, AlertTriangle, CheckCircle2, Layers, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-md bg-[#0e1117] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
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

const MaterialModal = ({ material, onClose }) => {
  const dispatch = useDispatch();
  const { actionLoading } = useSelector(s => s.inventory);
  const [form, setForm] = useState({ name: material?.name ?? '', stockQuantity: material?.stockQuantity ?? '' });
  const [error, setError] = useState('');

  const isEdit = !!material;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Nome é obrigatório.');
    if (form.stockQuantity === '' || isNaN(form.stockQuantity) || Number(form.stockQuantity) < 0)
      return setError('Informe uma quantidade válida.');

    const payload = { name: form.name.trim(), stockQuantity: parseInt(form.stockQuantity, 10) };
    const action = isEdit
      ? dispatch(updateRawMaterial({ id: material.id, data: payload }))
      : dispatch(createRawMaterial(payload));

    const result = await action;
    if (!result.error) onClose();
    else setError(result.error.message || 'Erro ao salvar.');
  };

  return (
    <Modal title={isEdit ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono-erp text-xs text-slate-500 uppercase tracking-widest mb-1.5">Nome do Insumo</label>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm font-display focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
            placeholder="Ex: Aço carbono"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-mono-erp text-xs text-slate-500 uppercase tracking-widest mb-1.5">Quantidade em Estoque</label>
          <input
            type="number"
            min="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm font-display focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
            placeholder="0"
            value={form.stockQuantity}
            onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))}
          />
        </div>
        {error && <p className="text-red-400 font-mono-erp text-xs">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-display font-semibold text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? 'Salvar Alterações' : 'Criar Insumo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const RawMaterialsPage = () => {
  const dispatch = useDispatch();
  const { rawMaterials, loading } = useSelector(s => s.inventory);

  const [showModal, setShowModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchRawMaterials());
  }, [dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteRawMaterial(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const lowStock = rawMaterials.filter(m => m.stockQuantity <= 10).length;
  const adequate = rawMaterials.filter(m => m.stockQuantity > 10).length;
  const maxStock = rawMaterials.length > 0 ? Math.max(...rawMaterials.map(m => m.stockQuantity)) : 1;

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 flex flex-col px-4 sm:px-8 xl:px-12 py-8">
      <div className="fixed inset-0 grid-dots pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 5% 90%, rgba(245,158,11,.04) 0%, transparent 55%)'
      }} />

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col flex-1">

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-erp text-amber-500 text-xs tracking-widest uppercase mb-3">// controle de estoque</p>
            <h1 className="font-display font-extrabold text-white leading-none tracking-tight" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', lineHeight: 1 }}>
              Matérias <span className="text-amber-400">Primas</span>
            </h1>
            <p className="font-mono-erp text-slate-600 text-xs mt-2">Gerencie os insumos disponíveis para produção</p>
          </div>
          <button
            onClick={() => { setEditMaterial(null); setShowModal(true); }}
            className="self-start sm:self-auto flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-md font-display font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20"
          >
            <Plus size={15} /> Nova Matéria-Prima
          </button>
        </header>

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
                    <th className="px-6 py-4 font-mono-erp text-xs text-slate-500 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rawMaterials.map(material => {
                    const isLow = material.stockQuantity <= 10;
                    const pct = maxStock > 0 ? (material.stockQuantity / maxStock) * 100 : 0;
                    return (
                      <tr key={material.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <span className="font-mono-erp text-xs text-slate-600">#{String(material.id).padStart(3, '0')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLow ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
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
                                background: isLow ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
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
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setEditMaterial(material); setShowModal(true); }}
                              className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(material)}
                              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
              <button
                onClick={() => { setEditMaterial(null); setShowModal(true); }}
                className="mt-2 flex items-center gap-2 text-amber-400 hover:text-amber-300 font-mono-erp text-xs transition-colors"
              >
                <Plus size={12} /> Adicionar primeiro insumo
              </button>
            </div>
          )}
        </div>

        <footer className="mt-12 pt-5 border-t border-slate-900 flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono-erp text-slate-700 text-xs">
            autoflex erp · matérias-primas · {new Date().toLocaleDateString('pt-BR')}
          </span>
        </footer>
      </div>

      {showModal && (
        <MaterialModal
          material={editMaterial}
          onClose={() => { setShowModal(false); setEditMaterial(null); }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          message={`Deseja excluir o insumo "${deleteTarget.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default RawMaterialsPage;
