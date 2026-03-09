const PILL = { realizado: 'pill-green', agendado: 'pill-blue', pendente: 'pill-orange', cancelado: 'pill-red', vendido: 'pill-green', recusado: 'pill-red' };

export default function Agenda({ activities, curMonth, curYear, MONTHS, TIPO_ICONS, fmt, fmtDate }) {
  const today = new Date().toISOString().split('T')[0];
  const sorted = [...activities].sort((a, b) => new Date(a.data) - new Date(b.data));

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Agenda — {MONTHS[curMonth]} {curYear}</span>
        <span className="card-sub">{sorted.length} eventos</span>
      </div>
      {sorted.length ? (
        <div className="tl-wrap">
          {sorted.map(a => {
            const d = new Date(a.data + 'T12:00:00');
            const past = a.data < today;
            return (
              <div className={`tl-item ${past ? 'past' : ''}`} key={a.id}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 44 }}>
                    <div className="tl-day">{String(d.getDate()).padStart(2, '0')}</div>
                    <div className="tl-mo">{d.toLocaleString('pt-BR', { month: 'short' })}</div>
                  </div>
                  <div>
                    <div className="tl-title">{TIPO_ICONS[a.tipo] || '📋'} {a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)} — {a.cliente}</div>
                    <div className="tl-client">{a.contato}</div>
                    <div className="tl-detail">
                      {a.produto}{a.valor ? ' · ' + fmt(a.valor) : ''} · <span className={`pill ${PILL[a.status] || ''}`}>{a.status}</span>
                      {a.obs ? <span style={{ marginLeft: 6, color: 'var(--text3)' }}>— {a.obs}</span> : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty"><div className="empty-icon">◷</div>Nenhum evento este mês</div>
      )}
    </div>
  );
}
