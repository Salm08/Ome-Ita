"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Video, LogIn, LogOut, UserPlus, Shield, User } from "lucide-react";

interface SessionInfo {
  email: string;
  role: string;
}

export function Navbar() {
  const [session, setSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setSession(data.user))
      .catch(() => setSession(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    window.location.href = "/";
  };

  return (
    <nav className="glass sticky top-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Video className="w-7 h-7 text-[var(--accent)]" />
          <span>
            Ome<span className="text-[var(--accent)]">Ita</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/profile" className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profilo</span>
              </Link>
              {session.role === "ADMIN" && (
                <Link href="/admin" className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <span className="text-sm text-[var(--text-secondary)] hidden md:inline">
                {session.email}
              </span>
              <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Esci</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Accedi</span>
              </Link>
              <Link href="/register" className="btn-primary text-sm flex items-center gap-1.5 py-2 px-3">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Registrati</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
