import { useState } from 'react';
import {
  FaMoon,
  FaSun,
  FaGraduationCap,
  FaFileAlt,
  FaCalendarAlt,
  FaHeadset,
  FaTimes,
  FaPlus,
} from "react-icons/fa";

const SidebarSection = ({ title, children }) => (
  <div className="sidebar-section">
    {title && <h2 className="sidebar-title">{title}</h2>}
    <div className="sidebar-section-content">
      {children}
    </div>
  </div>
);

const SuggestionItem = ({ icon: Icon, title, onClick, disabled }) => (
  <div 
    className={`example-prompt-sidebar ${disabled ? 'disabled' : ''}`} 
    onClick={!disabled ? onClick : undefined} 
    role="button" 
    tabIndex={disabled ? -1 : 0}
    aria-disabled={disabled}
  >
    <div className="prompt-icon-wrapper">
      <Icon className="prompt-icon" />
    </div>
    <div className="prompt-content">
      <div className="prompt-title">{title}</div>
    </div>
  </div>
);

const Sidebar = ({ theme, toggleTheme, sendExampleMessage, isOpen, toggleSidebar, isTyping }) => {
  const logoSrc = theme === 'light' ? '/unam.png' : '/unam_logo_claro.png';
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} id="sidebar">
      <button className="close-sidebar-btn" onClick={toggleSidebar} aria-label="Cerrar sidebar">
        <FaTimes />
      </button>

      <div className="sidebar-header">
        <img id="unam-logo" src={logoSrc} alt="UNAM Logo" />
      </div>

      <div className="sidebar-body no-scrollbar">
        <SidebarSection title="Sugerencias">
          <div className="example-prompts-sidebar">
            <SuggestionItem 
              icon={FaGraduationCap} 
              title="Proceso de admisión" 
              onClick={() => sendExampleMessage("¿Como funciona el Proceso de admisión?")}
              disabled={isTyping}
            />
            <SuggestionItem 
              icon={FaFileAlt} 
              title="Documentos requeridos" 
              onClick={() => sendExampleMessage("¿Cuáles son los documentos requeridos?")}
              disabled={isTyping}
            />
            <SuggestionItem 
              icon={FaCalendarAlt} 
              title="Fechas importantes" 
              onClick={() => sendExampleMessage("¿Cuáles son las fechas importantes?")}
              disabled={isTyping}
            />
            <SuggestionItem 
              icon={FaHeadset} 
              title="Contacto y soporte" 
              onClick={() => sendExampleMessage("¿Cómo puedo contactar y obtener soporte?")}
              disabled={isTyping}
            />
          </div>
        </SidebarSection>


      </div>
      
      <div className="sidebar-footer">
        <div className="developed-by-sidebar">
          <span>DEVELOPED BY:</span>
          <img 
            src={theme === 'light' ? '/logo_aimara_dark.png' : '/logo_aimara_white.png'} 
            alt="Aimara Lab" 
            className="developed-by-logo"
          />
        </div>
        
        <div className="sidebar-controls">
          <button
            onClick={() => window.location.reload()}
            className="control-btn new-chat-btn"
            title="Nueva Conversación"
          >
            <FaPlus /> Nuevo Chat
          </button>
          <button
            onClick={toggleTheme}
            className="control-btn theme-toggle-btn"
            title="Cambiar Tema"
          >
            {theme === "dark" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
