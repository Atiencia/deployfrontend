import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecuperarContrasena.css';

const RecuperarContrasena: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/solicitar-recuperacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.message);
        setEmail('');
        // Redirigir al login después de 5 segundos
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setError(data.message || 'Error al solicitar recuperación de contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-contrasena-container">
      <div className="recuperar-contrasena-card">
        <div className="recuperar-contrasena-header">
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
        </div>

        <form onSubmit={handleSubmit} className="recuperar-contrasena-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="icon-error">⚠️</i>
              {error}
            </div>
          )}

          {mensaje && (
            <div className="alert alert-success">
              <i className="icon-success">✓</i>
              {mensaje}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Enviando...
              </>
            ) : (
              'Enviar Instrucciones'
            )}
          </button>
        </form>

        <div className="recuperar-contrasena-footer">
          <button 
            onClick={() => navigate('/login')} 
            className="btn-link"
            disabled={loading}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
