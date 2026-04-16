import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }

    try {
      await API.post("/auth/register", form);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        />

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={submit}>Register</button>

        <div className="auth-link">
          Already have account? <span className="auth-action" onClick={() => nav("/")}>Login</span>
        </div>
      </div>
    </div>
  );
}
