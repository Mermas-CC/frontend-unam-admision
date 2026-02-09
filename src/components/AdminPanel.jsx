import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaSync, FaServer, FaFileAlt, FaTerminal, FaTimes } from 'react-icons/fa';

const AdminPanel = ({ onClose, theme }) => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [fetchingMetrics, setFetchingMetrics] = useState(false);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const getAuthHeader = () => {
    return { 'Authorization': 'Basic ' + btoa(`${username}:${password}`) };
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-10));
  };

  const fetchStatus = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`${API_URL}/admin/status`, {
        headers: { ...getAuthHeader() }
      });
      if (res.status === 401) {
        setIsLoggedIn(false);
        setAuthError("Sesión expirada o credenciales incorrectas.");
        return;
      }
      const data = await res.json();
      setStatus(data);
      setFiles(data.files || []);
    } catch (err) {
      addLog("❌ Error obteniendo estado: " + err.message);
    }
  };

  const fetchMetrics = async () => {
    if (!isLoggedIn) return;
    setFetchingMetrics(true);
    try {
      const res = await fetch(`${API_URL}/admin/metrics`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setFetchingMetrics(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
      setAuthError('');
    } else {
      setAuthError('Introduce usuario y contraseña');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchStatus();
      fetchMetrics();
      const interval = setInterval(() => {
        fetchStatus();
        fetchMetrics();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    addLog(`📤 Subiendo ${file.name}...`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/admin/files`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      if (res.ok) {
        addLog(`✅ Archivo ${file.name} subido.`);
        fetchStatus();
        fetchMetrics();
      } else {
        addLog(`❌ Error subiendo archivo (Status ${res.status}).`);
      }
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`¿Eliminar ${filename}?`)) return;
    
    addLog(`🗑️ Eliminando ${filename}...`);
    try {
      const res = await fetch(`${API_URL}/admin/files/${filename}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        addLog(`✅ Archivo eliminado.`);
        fetchStatus();
        fetchMetrics();
      }
    } catch (err) {
      addLog(`❌ Error eliminando: ${err.message}`);
    }
  };

  const handleIngest = async (force = false) => {
    setIsIngesting(true);
    addLog(`🚀 Iniciando Ingestión (Force=${force})...`);
    try {
      const res = await fetch(`${API_URL}/admin/ingest?force=${force}`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      addLog(`🏁 ${data.message}`);
      fetchStatus();
      fetchMetrics();
    } catch (err) {
      addLog(`❌ Error en ingestión: ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  if (!isLoggedIn) {
    return (
        <div className="admin-overlay">
          <div className="admin-glass-panel login-panel">
            <div className="admin-header">
                <h2>Acceso Restringido</h2>
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
            </div>
            <form onSubmit={handleLogin} className="login-form">
                <p>Ingresa tus credenciales administrativas para continuar.</p>
                <input 
                    type="text" 
                    placeholder="Usuario" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {authError && <div className="error-msg">{authError}</div>}
                <button type="submit" className="upload-btn">Entrar al Portal</button>
            </form>
          </div>
          <style jsx>{`
            .admin-overlay {
              position: fixed; top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
              z-index: 2000; display: flex; align-items: center; justify-content: center;
            }
            .login-panel { width: 350px; padding-bottom: 2rem; }
            .login-form { padding: 0 2rem; display: flex; flex-direction: column; gap: 1rem; }
            .login-form p { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem; }
            .login-form input {
              background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
              padding: 0.8rem; border-radius: 8px; color: white; outline: none;
            }
            .login-form input:focus { border-color: #3b82f6; }
            .error-msg { color: #ef4444; font-size: 0.8rem; text-align: center; }
            .admin-header { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; }
            .upload-btn { background: #3b82f6; color: white; padding: 0.8rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; }
            .close-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 1.2rem; }
          `}</style>
        </div>
    );
  }

  return (
    <div className="admin-overlay">
      <div className="admin-glass-panel">
        <div className="admin-header">
          <div className="admin-title">
            <FaServer className="admin-icon" />
            <h2>Centro de Conocimiento</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Cerrar Sesión</button>
            <button className="close-btn" onClick={onClose}><FaTimes /></button>
          </div>
        </div>

        <div className="admin-grid">
          {/* Status Section */}
          <div className="admin-card status-card">
            <h3><FaSync /> Estado del Sistema</h3>
            {status ? (
              <div className="status-info">
                <div className="status-item">
                  <span>Vectores en DB:</span>
                  <strong>{status.vector_count}</strong>
                </div>
                <div className="status-item">
                  <span>Archivos:</span>
                  <strong>{status.files_count}</strong>
                </div>
                <div className="status-item">
                  <span>Persistencia:</span>
                  <strong className={status.persisted_db ? "text-success" : "text-warning"}>
                    {status.persisted_db ? "Activo" : "Inactivo"}
                  </strong>
                </div>
              </div>
            ) : (
              <p>Cargando estado...</p>
            )}
            
            <button 
              className={`ingest-btn ${isIngesting ? 'loading' : ''}`}
              onClick={() => handleIngest(true)}
              disabled={isIngesting}
            >
              <FaSync className={isIngesting ? 'spin' : ''} />
              {isIngesting ? 'Procesando...' : 'Re-procesar Todo'}
            </button>
          </div>

          {/* Metrics Section - NEW */}
          <div className="admin-card metrics-card">
            <h3><FaSync /> Salud del Conocimiento</h3>
            {metrics && metrics.doc_distribution ? (
                <div className="metrics-list">
                    <div className="metric-header">Distribución por Archivo (Chunks):</div>
                    {Object.entries(metrics.doc_distribution).map(([doc, count]) => (
                        <div key={doc} className="metric-item">
                            <span title={doc}>{doc.length > 25 ? doc.substring(0,25)+'...' : doc}</span>
                            <div className="metric-bar-bg">
                                <div 
                                    className="metric-bar-fill" 
                                    style={{ width: `${(count / metrics.total_chunks) * 100}%` }}
                                ></div>
                            </div>
                            <small>{count}</small>
                        </div>
                    ))}
                    {metrics?.doc_distribution && Object.keys(metrics.doc_distribution).length === 0 && <p className="empty-msg">No hay datos RAG.</p>}
                </div>
            ) : (
                <p>{metrics?.error || "Cargando métricas..."}</p>
            )}
          </div>

          {/* Files Section */}
          <div className="admin-card files-card">
            <h3><FaFileAlt /> Gestión de Archivos (Knowledge Base)</h3>
            <div className="file-list">
              {files.map(f => (
                <div key={f} className="file-item">
                  <span>{f}</span>
                  <button onClick={() => handleDelete(f)}><FaTrash /></button>
                </div>
              ))}
              {files.length === 0 && <p className="empty-msg">No hay archivos en ./data</p>}
            </div>
            
            <div className="upload-section">
              <label className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                <FaUpload /> {uploading ? 'Subiendo...' : 'Subir Documento'}
                <input type="file" onChange={handleUpload} disabled={uploading} hidden />
              </label>
            </div>
          </div>

          {/* Logs Section */}
          <div className="admin-card terminal-card">
            <h3><FaTerminal /> Consola de Eventos</h3>
            <div className="terminal-view">
              {logs.map((log, i) => (
                <div key={i} className="log-line">{log}</div>
              ))}
              {logs.length === 0 && <div className="log-placeholder">Esperando eventos...</div>}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .admin-glass-panel {
          background: rgba(20, 20, 20, 0.85);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          color: white;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .admin-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .admin-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .admin-title h2 { margin: 0; font-size: 1.4rem; font-weight: 500; }
        .admin-icon { color: #3b82f6; font-size: 1.5rem; }
        .close-btn { 
          background: none; border: none; color: #666; cursor: pointer; font-size: 1.2rem;
          transition: color 0.3s;
        }
        .close-btn:hover { color: white; }

        .admin-grid {
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto auto;
          gap: 1.5rem;
          overflow-y: auto;
        }

        .admin-card {
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .admin-card h3 { 
          margin-top: 0; margin-bottom: 1rem; font-size: 1rem; color: #94a3b8;
          display: flex; align-items: center; gap: 0.5rem;
        }

        .status-info { margin-bottom: 1.5rem; }
        .status-item {
          display: flex; justify-content: space-between; margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .status-item strong { color: #3b82f6; }
        .text-success { color: #10b981 !important; }
        .text-warning { color: #f59e0b !important; }

        .file-list {
          height: 150px; overflow-y: auto;
          margin-bottom: 1rem; padding-right: 0.5rem;
        }
        .file-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.6rem; background: rgba(0,0,0,0.2); margin-bottom: 0.4rem;
          border-radius: 6px; font-size: 0.85rem;
        }
        .file-item button {
          background: none; border: none; color: #ef4444; cursor: pointer;
          opacity: 0.6; transition: opacity 0.3s;
        }
        .file-item button:hover { opacity: 1; }
        .empty-msg { color: #475569; font-style: italic; font-size: 0.85rem; text-align: center; }

        .upload-section { margin-top: auto; }
        .upload-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: #3b82f6; color: white; padding: 0.7rem; border-radius: 8px;
          cursor: pointer; font-size: 0.9rem; font-weight: 500;
          transition: background 0.3s;
        }
        .upload-btn:hover { background: #2563eb; }
        .upload-btn.disabled { opacity: 0.5; cursor: not-allowed; }

        .ingest-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 0.7rem; border-radius: 8px; cursor: pointer;
          font-size: 0.9rem; transition: all 0.3s;
        }
        .ingest-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: #3b82f6; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }

        .logout-btn {
          background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1);
          padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;
          transition: all 0.3s;
        }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

        .metrics-list { display: flex; flex-direction: column; gap: 0.8rem; }
        .metric-header { font-size: 0.8rem; color: #64748b; margin-bottom: 0.4rem; }
        .metric-item { display: flex; align-items: center; gap: 0.8rem; font-size: 0.8rem; color: #cbd5e1; }
        .metric-item span { min-width: 140px; }
        .metric-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .metric-bar-fill { height: 100%; background: #3b82f6; border-radius: 3px; transition: width 0.5s ease-out; }
        .metric-item small { min-width: 25px; text-align: right; color: #3b82f6; font-weight: 500; }

        .terminal-card { grid-column: span 2; }
        .terminal-view {
          background: #000; border-radius: 8px; padding: 1rem;
          height: 120px; overflow-y: auto; font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem; border: 1px solid #1e293b;
        }
        .log-line { color: #10b981; margin-bottom: 0.2rem; }
        .log-placeholder { color: #334155; }
      `}</style>
    </div>
  );
};

export default AdminPanel;
