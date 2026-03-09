import { useState } from 'react';

export default function Relatorio({ activities, curMonth, curYear, MONTHS, numbersVisible, fmt }) {
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);

  const pipeline = activities.filter(a => a.valor > 0 && a.status !== 'cancelado').reduce((s, a) => s + a.valor, 0);
  const realizadas = activities.filter(a => a.status === 'realizado');
  const agendadas = activities.filter(a => a.status === 'agendado');
  const clientes = [...new Set(activities.map(a => a.cliente))];
  const propostas = activities.filter(a => a.tipo === 'proposta').length;
  const vendidas = activities.filter(a => a.status === 'vendido').length;

  const n = (el) => numbersVisible ? el : <span className="num-hidden">{el}</span>;

  const gerarRelatorio = async () => {
    setLoading(true);
    const prompt = `Você é consultora sênior de vendas B2B. Gere um relatório quinzenal executivo e objetivo (máx 350 palavras) para Allana Campos, executiva comercial da FFA Group (consultoria tributária e contábil), referente a ${MONTHS[curMonth]} ${curYear}.

REALIZADAS: ${realizadas.map(a => `${a.tipo} com ${a.cliente} (${a.produto}${a.valor ? ', R$' + a.valor : ''})`).join('; ') || 'Nenhuma'}
AGENDADAS: ${agendadas.map(a => `${a.tipo} com ${a.cliente} - ${a.contato} (${a.produto})`).join('; ') || 'Nenhuma'}
Pipeline total: R$ ${pipeline.toLocaleString('pt-BR')}
Clientes: ${clientes.join(', ') || 'Nenhum'}

Estruture em: 1) Destaques do período  2) Status do pipeline  3) Recomendações estratégicas. Seja direta e profissional.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      setAiText(data.content?.find(c => c.type === 'text')?.text || 'Erro ao gerar.');
    } catch {
      setAiText('Erro de conexão com a IA.');
    }
    setLoading(false);
  };

  return (
    <div className="report-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="report-title">Relatório Quinzenal</div>
          <div className="report-period">1–15 {MONTHS[curMonth]} {curYear}</div>
        </div>
        <button className="btn-gen" onClick={gerarRelatorio} disabled={loading}>
          {loading ? '⟳ Gerando...' : '⚡ Gerar com IA'}
        </button>
      </div>

      <hr className="report-divider" />

      <div className="report-sec">
        <h3>Métricas do Período</h3>
        {[
          ['Pipeline total', n(fmt(pipeline))],
          ['Atividades realizadas', n(realizadas.length)],
          ['Atividades agendadas', n(agendadas.length)],
          ['Clientes contatados', n(clientes.length)],
          ['Propostas enviadas', n(propostas)],
          ['Propostas vendidas', n(vendidas)],
        ].map(([label, val]) => (
          <div className="report-metric" key={label}>
            <span className="rm-label">{label}</span>
            <span className="rm-val">{val}</span>
          </div>
        ))}
      </div>

      {aiText && (
        <>
          <hr className="report-divider" />
          <div className="report-sec">
            <h3>Análise Estratégica · IA</h3>
            <div className="ai-text">{aiText}</div>
          </div>
        </>
      )}
    </div>
  );
}
