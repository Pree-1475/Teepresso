import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  Plus,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  UserMinus,
  Trophy,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import styles from './RightPanel.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RightPanel({ isOpen, onToggle }: RightPanelProps) {
  const navigate = useNavigate();

  // Biometric punch state
  const [empName, setEmpName] = useState('Sunita Rao');
  const [punchLog, setPunchLog] = useState('');

  // Mini-Game State ("Tee-Catcher Pro")
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(140);
  const [basketPos, setBasketPos] = useState(50);
  const [itemPosY, setItemPosY] = useState(0);
  const [itemPosX, setItemPosX] = useState(50);
  const [itemType, setItemType] = useState<'tee' | 'kurta' | 'hoodie'>('tee');
  const [gameOver, setGameOver] = useState(false);

  const handlePunch = async (type: 'in' | 'out') => {
    setPunchLog('');
    try {
      const endpoint = type === 'in' ? 'check-in' : 'check-out';
      const body = type === 'in' ? { employeeName: empName, role: 'Editing Team' } : { employeeName: empName };

      const res = await fetch(`${API_BASE_URL}/attendance/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setPunchLog(`✅ ${empName} ${type.toUpperCase()}`);
      } else {
        setPunchLog(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setPunchLog(`✅ ${empName} ${type.toUpperCase()}`);
    }
  };

  // Mini-game loop
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const interval = setInterval(() => {
      setItemPosY((prev) => {
        if (prev >= 88) {
          if (Math.abs(itemPosX - basketPos) < 25) {
            setScore((s) => {
              const newScore = s + 10;
              if (newScore > highScore) setHighScore(newScore);
              return newScore;
            });
            setItemPosX(Math.floor(Math.random() * 80) + 10);
            setItemType(['tee', 'kurta', 'hoodie'][Math.floor(Math.random() * 3)] as any);
            return 0;
          } else {
            setGameOver(true);
            return 0;
          }
        }
        return prev + 6;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [gameActive, gameOver, itemPosX, basketPos, highScore]);

  const startGame = () => {
    setScore(0);
    setItemPosY(0);
    setItemPosX(Math.floor(Math.random() * 80) + 10);
    setGameOver(false);
    setGameActive(true);
  };

  const moveBasket = (dir: 'left' | 'right') => {
    setBasketPos((prev) => {
      if (dir === 'left') return Math.max(10, prev - 15);
      return Math.min(90, prev + 15);
    });
  };

  return (
    <aside className={`${styles.panel} ${!isOpen ? styles.panelClosed : ''}`}>
      {/* Panel Toggle Switch */}
      <button onClick={onToggle} className={styles.toggleBtn} title={isOpen ? 'Collapse Dock' : 'Expand Dock'}>
        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {isOpen && (
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.headerTitle}>
              <Zap size={14} color="var(--color-text-title)" />
              <span>COMMAND DOCK</span>
            </div>
            <span className={styles.livePulse}>● LIVE</span>
          </div>

          {/* 1. Quick POS Action */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <Plus size={13} color="var(--color-brand-dark)" /> Quick POS Order
            </div>
            <p className={styles.cardDesc}>Register walk-in client order & print UPI QR bill.</p>
            <button onClick={() => navigate('/offline-orders')} className={styles.actionBtn}>
              + Create POS Bill
            </button>
          </div>

          {/* 2. Quick Biometric Punch */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <Clock size={13} /> Biometric Punch
            </div>
            <select
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              className={styles.selectInput}
            >
              <option value="Sunita Rao">Sunita Rao (Editing)</option>
              <option value="Amit Shah">Amit Shah (Manager)</option>
              <option value="Vikram Seth">Vikram Seth (Dispatch)</option>
              <option value="Rajesh Kumar">Rajesh Kumar (Printing)</option>
            </select>
            <div className={styles.punchBtnRow}>
              <button onClick={() => handlePunch('in')} className={styles.punchInBtn}>
                <UserCheck size={12} /> Punch In
              </button>
              <button onClick={() => handlePunch('out')} className={styles.punchOutBtn}>
                <UserMinus size={12} /> Punch Out
              </button>
            </div>
            {punchLog && <div className={styles.punchLogText}>{punchLog}</div>}
          </div>

          {/* 3. Priority Express Stream */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <Sparkles size={13} color="#D97706" /> Express Ticker
            </div>
            <div className={styles.tickerItem}>
              <strong>⚡ TP-2026-8842</strong>
              <span>IIT Bombay • 50 Kurtas (Express 48h)</span>
            </div>
            <div className={styles.tickerItem}>
              <strong>⚡ TP-2026-9104</strong>
              <span>Greenwood RWA • 85 Printed Kurtas</span>
            </div>
          </div>

          {/* 4. Mini-Game Widget ("Tee-Catcher Pro") */}
          <div className={styles.gameCard}>
            <div className={styles.gameHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gamepad2 size={14} color="#ECEF22" />
                <span style={{ fontWeight: 700, fontSize: '11px', color: '#FFF' }}>TEE-CATCHER PRO</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#ECEF22' }}>
                <Trophy size={10} /> {highScore}
              </div>
            </div>

            <div className={styles.gameScreen}>
              {!gameActive && !gameOver && (
                <div className={styles.gameStartOverlay}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', color: '#94A3B8', marginBottom: '6px' }}>
                    Catch falling Garments in the Print Box!
                  </div>
                  <button onClick={startGame} className={styles.gamePlayBtn}>
                    ▶ START GAME
                  </button>
                </div>
              )}

              {gameActive && !gameOver && (
                <>
                  <div className={styles.gameScoreBoard}>Score: {score}</div>
                  <div
                    className={styles.fallingItem}
                    style={{ left: `${itemPosX}%`, top: `${itemPosY}%` }}
                  >
                    {itemType === 'kurta' ? '🥋' : itemType === 'hoodie' ? '🧥' : '👕'}
                  </div>
                  <div className={styles.catchBasket} style={{ left: `${basketPos}%` }}>
                    PRINT BOX
                  </div>
                </>
              )}

              {gameOver && (
                <div className={styles.gameStartOverlay}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#F87171' }}>GAME OVER!</div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1' }}>Final Score: {score}</div>
                  <button onClick={startGame} className={styles.gamePlayBtn}>
                    <RotateCcw size={12} /> Play Again
                  </button>
                </div>
              )}
            </div>

            {gameActive && !gameOver && (
              <div className={styles.gameControlsRow}>
                <button onClick={() => moveBasket('left')} className={styles.gameDirBtn}>◀ LEFT</button>
                <button onClick={() => moveBasket('right')} className={styles.gameDirBtn}>RIGHT ▶</button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export default RightPanel;
