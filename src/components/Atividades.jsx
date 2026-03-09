import { useState } from 'react';

const PILL = { realizado: 'pill-green', agendado: 'pill-blue', pendente: 'pill-orange', cancelado: 'pill-red', vendido: 'pill-green', recusado: 'pill-red' };

export default function Atividades({ activities, numbersVisible, fmt, fmtDate, CANAL_MAP, TIPO_ICONS, onUpdateActivity, onDeleteActivity, onShowToast }) {
  const [filterType, setFilterType] = useState('todos');
  const [search, setSearch] = useState('');

  let list = [...activities].sort((a, b) => new Date(b.data) - new Date(a.data));
  if (filterType === 'vendido') list = list.filter(a => a.status === 'vendido');
  else if (filterType === 'recusado') list = list.filter(a => a.status === 'recusado');
  else if (filterType !== 'todos') list = list.filter(a => a.tipo === filterType);
  if (search) list = list.filter(a => a.cliente.toLowerCase().includes(search) || a.contato.toLowerCase().includes(search));

  const n = (el) => numbersVisible ? el : <span className="num-hidden">{el}</span>;

  const FILTERS = [
    { id: 'todos', label: 'Todos' },
    { id: 'proposta', label: 'Proposta' },
    { id: 'reuniao', label: 'Reunião' },
    { id: 'followup', label: 'Follow-up' },
    { id: 'vendido', label: '✓ Vendido' },
    { id: 'recusado', label: '✕ Recusado' },
  ];

  return (
    <div>
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f.id} className={`fchip ${filterType === f.id ? 'active' : ''}`} onClick={() => setFilterType(f.id)}>{f.label}</button>
        ))}
        <input className="fsearch" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value.toLowerCase())} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="act-wrap">
          <table className="act-table">
            <thead>
              <tr>
                <th>Tipo</th><th>Cliente</th><th>Contato</th>
                <th>Produto</th><th>Canal</th><th>Valor</th><th>Data</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.length ? list.map(a => (
                <tr key={a.id}>
                  <td>{TIPO_ICONS[a.tipo] || '📋'} <span style={{ fontSize: 11, color: 'var(--text3)' }}>{a.tipo}</span></td>
                  <td className="bold">{a.cliente}</td>
                  <td>{a.contato}</td>
                  <td>{a.produto}</td>
                  <td>
                    <select
                      className="canal-sel"
                      value={a.canal || ''}
                      onChange={e => { onUpdateActivity(a.id, { canal: e.target.value }); }}
                    >
                      <option value="">—</option>
                      <option value="indicacao">🟣 Indicação</option>
                      <option value="parceria">🔵 Parceria</option>
                      <option value="prospeccao">🟠 Prospecção</option>
                    </select>
                  </td>
                  <td className="mono">{n(a.valor ? fmt(a.valor) : '—')}</td>
                  <td className="mono">{fmtDate(a.data)}</td>
                  <td><span className={`pill ${PILL[a.status] || 'pill-orange'}`}>{a.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
                      {a.tipo === 'proposta' && a.status !== 'vendido' && a.status !== 'recusado' && (
                        <>
                          <button className="btn-won" onClick={() => { onUpdateActivity(a.id, { status: 'vendido' }); onShowToast('🎉 Proposta marcada como VENDIDA!'); }}>✓ Vendido</button>
                          <button className="btn-lost" onClick={() => { onUpdateActivity(a.id, { status: 'recusado' }); onShowToast('📋 Proposta marcada como recusada.'); }}>✕ Recusado</button>
                        </>
                      )}
                      {a.id > 99999 && <button className="btn-del" onClick={() => onDeleteActivity(a.id)}>✕</button>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9}><div className="empty"><div className="empty-icon">◎</div>Nenhuma atividade este mês</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
