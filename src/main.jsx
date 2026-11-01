import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="fatal-error"><img src="/favicon.svg" alt="" width="64"/><h1>Volvamos a explorar.</h1><p>No se pudo mostrar esta pantalla. Recarga para recuperar el avance que ya guardaste.</p><button className="primary" onClick={() => location.reload()}>Recargar Terra</button></main> : this.props.children; }
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>);
