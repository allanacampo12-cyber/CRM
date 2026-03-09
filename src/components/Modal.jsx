import { useState } from 'react';

export default function Modal({ onClose, onSave, CANAL_MAP }) {
  const [form, setForm] = useState({
    tipo: 'proposta', status: 'agendado', cliente: '', contato: '',
    produto: '', canal: '', valor: '', data: new Date().toISOString().split('T')[0], obs: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.cliente || !form.data) return;
    onSave({ ...form, valor: parseFloat(form.valor) || 0 });
    onClose();
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>+ Nova Atividade</h2>
        <div className="frow">
          <div className="fg">
            <label className="flabel">Tipo</label>
            <select className="fsel" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option value="proposta">📄 Proposta</option>
              <option value="reuniao">🤝 Reunião</option>
              <option value="followup">💬 Follow-up</option>
              <option value="visita">🚶 Visita</option>
              <option value="email">📧 E-mail</option>
            </select>
          </div>
          <div className="fg">
            <label className="flabel">Status</label>
            <select className="fsel" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="agendado">Agendado</option>
              <option value="realizado">Realizado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
        </div>
        <div className="fg"><label className="flabel">Cliente</label><input className="finput" value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nome da empresa" /></div>
        <div className="fg"><label className="flabel">Contato</label><input className="finput" value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="Nome do responsável" /></div>
        <div className="fg"><label className="flabel">Produto / Serviço</label><input className="finput" value={form.produto} onChange={e => set('produto', e.target.value)} placeholder="Ex: Transação Tributária" /></div>
        <div className="fg">
          <label className="flabel">Canal de Aquisição</label>
          <select className="fsel" value={form.canal} onChange={e => set('canal', e.target.value)}>
            <option value="">— Não informado —</option>
            <option value="indicacao">🟣 Indicação</option>
            <option value="parceria">🔵 Parceria</option>
            <option value="prospeccao">🟠 Prospecção Própria</option>
          </select>
        </div>
        <div className="frow">
          <div className="fg"><label className="flabel">Valor (R$)</label><input className="finput" type="number" value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0" /></div>
          <div className="fg"><label className="flabel">Data</label><input className="finput" type="date" value={form.data} onChange={e => set('data', e.target.value)} /></div>
        </div>
        <div className="fg"><label className="flabel">Observação</label><input className="finput" value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Opcional" /></div>
        <div className="btn-row">
          <button className="btn-g" onClick={onClose}>Cancelar</button>
          <button className="btn-p" onClick={handleSave}>Salvar Atividade</button>
        </div>
      </div>
    </div>
  );
}
