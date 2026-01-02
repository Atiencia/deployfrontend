import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './RestablecerContrasena.css';
import { AUTH_URL } from '../config/api';

const RestablecerContrasena: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de recuperación no válido');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validarContrasena = (contrasena: string): string | null => {
    if (contrasena.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar fortaleza de la contraseña
    const errorValidacion = validarContrasena(nuevaContrasena);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    if (!token) {
      setError('Token no válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}/restablecer-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          nuevaContrasena 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(data.message);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        if (data.tokenExpirado) {
          setError('El token ha expirado. Por favor, solicita una nueva recuperación de contraseña.');
        } else {
          setError(data.message || 'Error al restablecer la contraseña');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const obtenerFuerzaContrasena = (contrasena: string): { nivel: string; color: string; porcentaje: number } => {
    let fuerza = 0;
    if (contrasena.length >= 6) fuerza += 25;
    if (contrasena.length >= 8) fuerza += 25;
    if (/[a-z]/.test(contrasena) && /[A-Z]/.test(contrasena)) fuerza += 25;
    if (/\d/.test(contrasena)) fuerza += 15;
    if (/[^a-zA-Z0-9]/.test(contrasena)) fuerza += 10;

    if (fuerza <= 25) return { nivel: 'Débil', color: '#f44336', porcentaje: 25 };
    if (fuerza <= 50) return { nivel: 'Media', color: '#ff9800', porcentaje: 50 };
    if (fuerza <= 75) return { nivel: 'Buena', color: '#2196F3', porcentaje: 75 };
    return { nivel: 'Fuerte', color: '#4CAF50', porcentaje: 100 };
  };

  const fuerzaContrasena = obtenerFuerzaContrasena(nuevaContrasena);

  return (
    <div className="restablecer-contrasena-container">
      <div className="restablecer-contrasena-card">
        <div className="restablecer-contrasena-header">
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="restablecer-contrasena-form">
          <div className="form-group">
            <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                id="nuevaContrasena"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                required
                disabled={loading || !token}
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                tabIndex={-1}
              >
                {mostrarContrasena ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {nuevaContrasena && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{ 
                      width: `${fuerzaContrasena.porcentaje}%`,
                      backgroundColor: fuerzaContrasena.color
                    }}
                  ></div>
                </div>
                <span style={{ color: fuerzaContrasena.color }}>
                  {fuerzaContrasena.nivel}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              id="confirmarContrasena"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              required
              disabled={loading || !token}
              minLength={6}
            />
            {confirmarContrasena && confirmarContrasena !== nuevaContrasena && (
              <small className="text-error">Las contraseñas no coinciden</small>
            )}
          </div>

          <div className="password-requirements">
            <p className="requirements-title">Requisitos de la contraseña:</p>
            <ul>
              <li className={nuevaContrasena.length >= 6 ? 'valid' : ''}>
                Mínimo 6 caracteres
              </li>
              <li className={/[a-z]/.test(nuevaContrasena) && /[A-Z]/.test(nuevaContrasena) ? 'valid' : ''}>
                Mayúsculas y minúsculas (recomendado)
              </li>
              <li className={/\d/.test(nuevaContrasena) ? 'valid' : ''}>
                Al menos un número (recomendado)
              </li>
            </ul>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="icon-error">⚠️</i>
              {error}
              {error.includes('expirado') && (
                <div className="mt-2">
                  <button 
                    type="button"
                    onClick={() => navigate('/recuperar-contrasena')}
                    className="btn-link-small"
                  >
                    Solicitar nueva recuperación
                  </button>
                </div>
              )}
            </div>
          )}

          {mensaje && (
            <div className="alert alert-success">
              <i className="icon-success">✓</i>
              {mensaje}
              <p className="mt-2">Redirigiendo al inicio de sesión...</p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading || !token || nuevaContrasena !== confirmarContrasena}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Restableciendo...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>

        <div className="restablecer-contrasena-footer">
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

export default RestablecerContrasena;
