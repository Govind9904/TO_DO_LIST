import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async () => {
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", form);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <p className="error-text">{error}</p>}
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={loading}
        />

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={loading}
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="auth-link">
          Already have account? <span className="auth-action" onClick={() => nav("/")}>Login</span>
        </div>
      </div>
    </div>
  );
}
