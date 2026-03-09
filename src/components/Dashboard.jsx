import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#388BFD', '#39D4E8', '#3FB950', '#A371F7', '#F0883E'];

export default function Dashboard({ activities, curMonth, curYear, numbersVisible, fmt, fmtDate, MONTHS, CANAL_MAP, TIPO_ICONS }) {
  const pipeline = activities.filter(a => a.valor > 0 && a.status !== 'cancelado' && a.status !== 'recusado').reduce((s, a) => s + a.valor, 0);
  const realizadas = activities.filter(a => a.status === 'realizado').length;
  const agendadas = activities.filter(a => a.status === 'agendado').length;
  const clientes = new Set(activities.map(a => a.cliente)).size;

  // Pipeline por produto
  const byProd = {};
  activities.filter(a => a.valor > 0 && a.status !== 'cancelado' && a.status !== 'recusado').forEach(a => {
    byProd[a.produto] = (byProd[a.produto] || 0) + a.valor;
  });
  const prodSorted = Object.entries(byProd).sort((a, b) => b[1] - a[1]);
  const prodTotal = prodSorted.reduce((s, [, v]) => s + v, 0);

  // Canal de aquisição
  const canais = { indicacao: 0, parceria: 0, prospeccao: 0 };
  const canaisVal = { indicacao: 0, parceria: 0, prospeccao: 0 };
  activities.forEach(a => {
    if (a.canal && canais[a.canal] !== undefined) {
      canais[a.canal]++;
      if (a.valor) canaisVal[a.canal] += a.valor;
    }
  });
  const canalTotal = Object.values(canais).reduce((s, v) => s + v, 0);
  const semCanal = activities.filter(a => !a.canal).length;

  // Mix para gráfico
  const counts = {};
  activities.forEach(a => { counts[a.tipo] = (counts[a.tipo] || 0) + 1; });
  const pieData = Object.entries(counts).map(([tipo, value]) => ({
    name: { proposta: 'Proposta', reuniao: 'Reunião', followup: 'Follow-up', visita: 'Visita', email: 'E-mail' }[tipo] || tipo,
    value
  }));

  // Próximas
  const proximas = [...activities].filter(a => a.status === 'agendado').sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 4);

  // Top clientes
  const byClient = {};
  activities.filter(a => a.valor > 0 && a.status !== 'cancelado').forEach(a => { byClient[a.cliente] = (byClient[a.cliente] || 0) + a.valor; });
  const clientSorted = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const clientMax = clientSorted[0]?.[1] || 1;

  const n = (el) => numbersVisible ? el : <span className="num-hidden">{el}</span>;

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ animationDelay: '0.05s' }}>
          <div className="kpi-label">Pipeline do Mês</div>
          <div className="kpi-val blue">{n(fmt(pipeline))}</div>
          <div className="kpi-sub">em negociação ativa</div>
          <div className="kpi-tag tag-blue">↑ {activities.filter(a => a.tipo === 'proposta').length} propostas</div>
        </div>
        <div className="kpi-card" style={{ animationDelay: '0.1s' }}>
          <div className="kpi-label">Realizadas</div>
          <div className="kpi-val green">{n(realizadas)}</div>
          <div className="kpi-sub">atividades concluídas</div>
          <div className="kpi-tag tag-green">✓ {realizadas} este mês</div>
        </div>
        <div className="kpi-card" style={{ animationDelay: '0.15s' }}>
          <div className="kpi-label">Agendadas</div>
          <div className="kpi-val cyan">{n(agendadas)}</div>
          <div className="kpi-sub">próximas atividades</div>
          <div className="kpi-tag tag-cyan">→ {agendadas} pendentes</div>
        </div>
        <div className="kpi-card" style={{ animationDelay: '0.2s' }}>
          <div className="kpi-label">Clientes Ativos</div>
          <div className="kpi-val">{n(clientes)}</div>
          <div className="kpi-sub">contatados no mês</div>
          <div className="kpi-tag tag-orange">{MONTHS[curMonth].toUpperCase()}</div>
        </div>
      </div>

      <div className="g13">
        {/* Pipeline */}
        <div className="card" style={{ animationDelay: '0.25s' }}>
          <div className="card-head">
            <span className="card-title">Pipeline por Produto</span>
            <span className="card-sub">{n(fmt(prodTotal))}</span>
          </div>
          {prodSorted.length ? prodSorted.map(([prod, val], i) => {
            const pct = prodTotal ? (val / prodTotal * 100).toFixed(0) : 0;
            return (
              <div className="prog-row" key={prod}>
                <div className="prog-meta">
                  <span className="prog-label">{prod}</span>
                  <span className="prog-val">{n(fmt(val))}</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            );
          }) : <div className="empty"><div className="empty-icon">◎</div>Nenhum pipeline</div>}
        </div>

        {/* Canal de Aquisição */}
        <div className="card" style={{ animationDelay: '0.3s' }}>
          <div className="card-head">
            <span className="card-title">Canal de Aquisição</span>
            <span className="card-sub">{canalTotal} classificados{semCanal ? ` · ${semCanal} sem canal` : ''}</span>
          </div>
          {Object.entries(CANAL_MAP).map(([key, c]) => {
            const pct = canalTotal ? Math.round(canais[key] / canalTotal * 100) : 0;
            return (
              <div className="prog-row" key={key}>
                <div className="prog-meta">
                  <span className="prog-label" style={{ color: c.color }}>{c.label}</span>
                  <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{canais[key]} ativ.</span>
                    <span className="prog-val">{n(canaisVal[key] ? fmt(canaisVal[key]) : '—')}</span>
                  </span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${pct}%`, background: c.color }} />
                </div>
              </div>
            );
          })}
          {semCanal > 0 && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>⚠ {semCanal} sem canal — classifique em Atividades</div>}
        </div>
      </div>

      <div className="g2">
        {/* Próximas */}
        <div className="card" style={{ animationDelay: '0.35s' }}>
          <div className="card-head">
            <span className="card-title">Próximas Ações</span>
            <span className="card-sub">{proximas.length} pendentes</span>
          </div>
          {proximas.length ? proximas.map(a => (
            <div className="row-item" key={a.id}>
              <div className="ri-icon" style={{ background: 'rgba(56,139,253,0.1)' }}>{TIPO_ICONS[a.tipo] || '📋'}</div>
              <div className="ri-info">
                <div className="ri-name">{a.cliente}</div>
                <div className="ri-sub">{a.contato} · {a.produto}</div>
              </div>
              <div className="ri-right">
                <div className="ri-date">{fmtDate(a.data)}</div>
                {a.valor ? <div className="ri-val">{n(fmt(a.valor))}</div> : null}
              </div>
            </div>
          )) : <div className="empty"><div className="empty-icon">✓</div>Sem pendências</div>}
        </div>

        {/* Top clientes */}
        <div className="card" style={{ animationDelay: '0.4s' }}>
          <div className="card-head"><span className="card-title">Clientes em Pipeline</span></div>
          {clientSorted.length ? clientSorted.map(([client, val]) => {
            const pct = (val / clientMax * 100).toFixed(0);
            return (
              <div className="prog-row" key={client}>
                <div className="prog-meta">
                  <span className="prog-label">{client.length > 22 ? client.slice(0, 22) + '…' : client}</span>
                  <span className="prog-val">{n(fmt(val))}</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          }) : <div className="empty">Sem clientes</div>}
        </div>
      </div>
    </div>
  );
}
