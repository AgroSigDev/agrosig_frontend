"use client"; // indica que es un componente cliente
import { useEffect, useState } from "react";
import { getUsers, setAuthToken } from "../../../services/api";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ⚠️ Pon aquí tu token JWT válido
    setAuthToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX2lkIjoyLCJpYXQiOjE3NTg5OTI4MDcsImV4cCI6MTc1OTAzNjAwN30.FNyyPtBV7MdH3qwEXZG-jQZJVZVmo2EtNKV7deG43Gw");

    getUsers()
      .then(data => setUsuarios(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Usuarios</h1>
      <ul>
        {usuarios.map(u => (
          <li key={u.user_id}>
            {u.first_name} {u.paternal_surname} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
