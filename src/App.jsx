import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { PHOTO_B64, BASE_ACTIVITIES, MONTHS, CANAL_MAP, TIPO_ICONS, fmt, fmtDate } from './data';
import Dashboard from './components/Dashboard';
import Atividades from './components/Atividades';
import Agenda from './components/Agenda';
import Relatorio from './components/Relatorio';
import Modal from './components/Modal';
import Toast from './components/Toast';

export default function App() {
  const today = new Date();
  const [tab, setTab] = useState('dashboard');
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [numbersVisible, setNumbersVisible] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load
  useEffect(() => {
    const extra = JSON.parse(localStorage.getItem('crm_extra') || '[]')
      .filter(a => a.cliente !== '[TESTE]');
    setActivities([...BASE_ACTIVITIES, ...extra]);
  }, []);

  const saveExtra = useCallback((list) => {
    const extra = list.filter(a => a.id > 99999);
    localStorage.setItem('crm_extra', JSON.stringify(extra));
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const monthActivities = activities.filter(a => {
    const d = new Date(a.data + 'T12:00:00');
    return d.getMonth() === curMonth && d.getFullYear() === curYear;
  });

  const changeMonth = (d) => {
    let m = curMonth + d, y = curYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurMonth(m); setCurYear(y);
  };

  const addActivity = (data) => {
    const newId = Date.now() * 10;
    const newList = [...activities, { ...data, id: newId }];
    setActivities(newList);
    saveExtra(newList);
    showToast('✓ Atividade salva!');
  };

  const updateActivity = (id, changes) => {
    const updated = activities.map(a => {
      if (a.id !== id) return a;
      if (a.id <= 9999) {
        // promove para extra
        return { ...a, ...changes, id: Date.now() * 10 + 1 };
      }
      return { ...a, ...changes };
    });
    // remove base se foi promovida
    const final = updated.filter((a, i, arr) =>
      !(a.id <= 9999 && arr.find(b => b.id > 99999 && b.cliente === a.cliente && b.data === a.data))
    );
    setActivities(final);
    saveExtra(final);
  };

  const deleteActivity = (id) => {
    if (id <= 9999) { showToast('Atividades base não podem ser removidas'); return; }
    const newList = activities.filter(a => a.id !== id);
    setActivities(newList);
    saveExtra(newList);
    showToast('Atividade removida');
  };

  const doSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); showToast('✓ Calendário sincronizado — 8 eventos'); }, 1800);
  };

  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  const TABS = [
    { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
    { id: 'atividades', icon: '≡', label: 'Atividades' },
    { id: 'agenda', icon: '◷', label: 'Agenda' },
    { id: 'relatorio', icon: '◈', label: 'Relatório' },
  ];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <nav className="sidebar">
        <div className="sidebar-logo">FF</div>
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* MOBILE NAV */}
      <nav className="mob-nav">
        {TABS.map(t => (
          <button key={t.id} className={`mob-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <div>{t.icon}</div>{t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{{ dashboard:'Dashboard', atividades:'Atividades', agenda:'Agenda', relatorio:'Relatório' }[tab]}</div>
            <div className="topbar-date">{dateStr}</div>
          </div>
          <div className="topbar-right">
            <div className="month-nav">
              <button className="month-btn" onClick={() => changeMonth(-1)}>‹</button>
              <div className="month-label">{MONTHS[curMonth]} {curYear}</div>
              <button className="month-btn" onClick={() => changeMonth(1)}>›</button>
            </div>
            <button className={`btn-sync`} onClick={doSync}>
              <span className={syncing ? 'spin' : ''}>⟳</span> Sync
            </button>
            <button className={`btn-hide ${!numbersVisible ? 'active' : ''}`} onClick={() => setNumbersVisible(v => !v)}>
              {numbersVisible ? '👁' : '🙈'} {numbersVisible ? 'Ocultar' : 'Mostrar'}
            </button>
            <div className="profile-chip">
              <img className="profile-pic" src={`data:image/jpeg;base64,${PHOTO_B64}`} alt="Allana" />
              <div>
                <div className="profile-name">Allana Campos</div>
                <div className="profile-role">FFA Group</div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        {tab === 'dashboard' && (
          <Dashboard
            activities={monthActivities}
            allActivities={activities}
            curMonth={curMonth}
            curYear={curYear}
            numbersVisible={numbersVisible}
            fmt={fmt}
            fmtDate={fmtDate}
            MONTHS={MONTHS}
            CANAL_MAP={CANAL_MAP}
            TIPO_ICONS={TIPO_ICONS}
          />
        )}
        {tab === 'atividades' && (
          <Atividades
            activities={monthActivities}
            numbersVisible={numbersVisible}
            fmt={fmt}
            fmtDate={fmtDate}
            CANAL_MAP={CANAL_MAP}
            TIPO_ICONS={TIPO_ICONS}
            onUpdateActivity={updateActivity}
            onDeleteActivity={deleteActivity}
            onShowToast={showToast}
          />
        )}
        {tab === 'agenda' && (
          <Agenda
            activities={monthActivities}
            curMonth={curMonth}
            curYear={curYear}
            MONTHS={MONTHS}
            TIPO_ICONS={TIPO_ICONS}
            fmt={fmt}
            fmtDate={fmtDate}
          />
        )}
        {tab === 'relatorio' && (
          <Relatorio
            activities={monthActivities}
            curMonth={curMonth}
            curYear={curYear}
            MONTHS={MONTHS}
            numbersVisible={numbersVisible}
            fmt={fmt}
          />
        )}
      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal(true)}>+</button>

      {/* MODAL */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onSave={addActivity}
          CANAL_MAP={CANAL_MAP}
        />
      )}

      {/* TOAST */}
      {toast && <Toast msg={toast} />}
    </div>
  );
}
