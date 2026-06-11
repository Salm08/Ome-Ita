"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle, Users, Video, MessageCircle, Activity, ScrollText } from "lucide-react";
import { GENDER_LABELS } from "@/lib/constants";
import type { Gender } from "@prisma/client";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  createdAt: string;
  reporter: { email: string };
  reported: { id: string; email: string; gender: Gender; region: string };
}

interface GuestReport {
  id: string;
  reason: string;
  description: string | null;
  reporterIp: string | null;
  partnerInfo: string | null;
  createdAt: string;
}

interface UserRow {
  id: string;
  email: string;
  gender: Gender;
  age: number;
  region: string;
  isBanned: boolean;
  _count: { reportsReceived: number };
}

interface Stats {
  socket: {
    onlineSockets: number;
    waitingVideo: number;
    waitingText: number;
    activePairs: number;
    totalMatches: number;
    matchesToday: number;
  };
  users: { total: number; banned: number };
  reports: { pending: number; pendingGuest: number };
  bansToday: number;
}

interface ModLog {
  id: string;
  action: string;
  details: string | null;
  targetUserId: string | null;
  targetIp: string | null;
  createdAt: string;
  admin: { email: string };
}

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<"stats" | "reports" | "guest" | "users" | "logs">("stats");
  const [reports, setReports] = useState<Report[]>([]);
  const [guestReports, setGuestReports] = useState<GuestReport[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<ModLog[]>([]);
  const [adminGenderFilter, setAdminGenderFilter] = useState<Gender | "ALL">("ALL");

  const loadAll = useCallback(() => {
    fetch("/api/admin/reports").then((r) => r.json()).then((d) => setReports(d.reports || []));
    fetch("/api/admin/guest-reports").then((r) => r.json()).then((d) => setGuestReports(d.reports || []));
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users || []));
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d));
    fetch("/api/admin/logs").then((r) => r.json()).then((d) => setLogs(d.logs || []));
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role === "ADMIN") {
          setAuthorized(true);
          loadAll();
          interval = setInterval(() => {
            fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d));
          }, 10000);
        } else {
          router.push("/");
        }
      });
    return () => clearInterval(interval!);
  }, [router, loadAll]);

  const dismissReport = async (id: string, type: "user" | "guest") => {
    const url = type === "user" ? "/api/admin/reports" : "/api/admin/guest-reports";
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id, status: "dismissed" }),
    });
    loadAll();
  };

  const banUser = async (userId: string, hours?: number, permanent?: boolean) => {
    const reason = prompt("Motivo del ban:");
    if (!reason) return;
    await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason, durationHours: hours, permanent }),
    });
    loadAll();
  };

  const banIp = async (ip: string) => {
    const reason = prompt("Motivo del ban IP:");
    if (!reason || !ip) return;
    await fetch("/api/admin/ban-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, reason, durationHours: 48 }),
    });
    loadAll();
  };

  const unbanUser = async (userId: string) => {
    await fetch("/api/admin/ban", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    loadAll();
  };

  const startAdminChat = (mode: "video" | "text") => {
    sessionStorage.setItem(
      "ome_prefs",
      JSON.stringify({
        gender: "MALE" as Gender,
        region: "Admin",
        stato: "moderatore",
        isAdmin: true,
        adminGenderFilter: adminGenderFilter === "ALL" ? null : adminGenderFilter,
      })
    );
    router.push(mode === "video" ? "/video" : "/text");
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <Shield className="w-8 h-8 animate-pulse text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-[var(--accent)]" />
        <h1 className="text-2xl font-bold">Pannello Admin</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Online", value: stats.socket.onlineSockets, icon: Activity },
            { label: "In coda video", value: stats.socket.waitingVideo, icon: Video },
            { label: "Match oggi", value: stats.socket.matchesToday, icon: Users },
            { label: "Segnalazioni", value: stats.reports.pending + stats.reports.pendingGuest, icon: AlertTriangle },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <s.icon className="w-5 h-5 text-[var(--accent)] mx-auto mb-1" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Video className="w-5 h-5" /> Chat Admin con Filtro Genere
        </h2>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "MALE", "FEMALE", "COUPLE"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setAdminGenderFilter(g)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                adminGenderFilter === g ? "bg-[var(--accent)] text-white" : "bg-white/5 border border-[var(--border)]"
              }`}
            >
              {g === "ALL" ? "Tutti" : GENDER_LABELS[g]}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => startAdminChat("video")} className="btn-primary flex items-center gap-2">
            <Video className="w-4 h-4" /> Video
          </button>
          <button onClick={() => startAdminChat("text")} className="btn-secondary flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Testo
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[var(--border)] overflow-x-auto">
        {([
          ["stats", "Dashboard", Activity],
          ["reports", `Utenti (${reports.length})`, AlertTriangle],
          ["guest", `Ospiti (${guestReports.length})`, AlertTriangle],
          ["users", `Account (${users.length})`, Users],
          ["logs", "Log", ScrollText],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === id ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent"
            }`}
          >
            <Icon className="w-4 h-4 inline mr-1" />
            {label}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="glass rounded-xl p-5 space-y-2 text-sm">
          <p>Utenti registrati: <strong>{stats.users.total}</strong> (bannati: {stats.users.banned})</p>
          <p>Coppie attive: <strong>{stats.socket.activePairs}</strong></p>
          <p>In coda testo: <strong>{stats.socket.waitingText}</strong></p>
          <p>Match totali (sessione server): <strong>{stats.socket.totalMatches}</strong></p>
          <p>Ban emessi oggi: <strong>{stats.bansToday}</strong></p>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-center text-[var(--text-secondary)] py-8">Nessuna segnalazione utente</p>}
          {reports.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4 space-y-2">
              <p className="font-medium text-[var(--danger)]">{r.reason}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {r.reported.email} ({GENDER_LABELS[r.reported.gender]}) — da {r.reporter.email}
              </p>
              {r.description && <p className="text-sm">{r.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => banUser(r.reported.id, 24)} className="btn-danger text-sm py-1.5 px-3">Ban 24h</button>
                <button onClick={() => banUser(r.reported.id, undefined, true)} className="btn-danger text-sm py-1.5 px-3">Permanente</button>
                <button onClick={() => dismissReport(r.id, "user")} className="btn-secondary text-sm py-1.5 px-3">Ignora</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "guest" && (
        <div className="space-y-3">
          {guestReports.length === 0 && <p className="text-center text-[var(--text-secondary)] py-8">Nessuna segnalazione ospite</p>}
          {guestReports.map((r) => {
            const info = r.partnerInfo ? JSON.parse(r.partnerInfo) : null;
            return (
              <div key={r.id} className="glass rounded-xl p-4 space-y-2">
                <p className="font-medium text-[var(--danger)]">{r.reason}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  IP segnalante: {r.reporterIp || "N/D"}
                  {info && ` — Partner: ${GENDER_LABELS[info.gender] || info.gender}, ${info.region}`}
                </p>
                {r.description && <p className="text-sm">{r.description}</p>}
                <div className="flex gap-2">
                  {r.reporterIp && (
                    <button onClick={() => banIp(r.reporterIp!)} className="btn-danger text-sm py-1.5 px-3">Ban IP</button>
                  )}
                  <button onClick={() => dismissReport(r.id, "guest")} className="btn-secondary text-sm py-1.5 px-3">Ignora</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--text-secondary)] border-b border-[var(--border)]">
                <th className="text-left py-2 px-3">Email</th>
                <th className="text-left py-2 px-3">Genere</th>
                <th className="text-left py-2 px-3">Regione</th>
                <th className="text-left py-2 px-3">Segn.</th>
                <th className="text-left py-2 px-3">Stato</th>
                <th className="text-left py-2 px-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)]/50">
                  <td className="py-2 px-3">{u.email}</td>
                  <td className="py-2 px-3">{GENDER_LABELS[u.gender]}</td>
                  <td className="py-2 px-3">{u.region}</td>
                  <td className="py-2 px-3">{u._count.reportsReceived}</td>
                  <td className="py-2 px-3">
                    {u.isBanned ? <span className="text-[var(--danger)]">Bannato</span> : <span className="text-[var(--success)]">Attivo</span>}
                  </td>
                  <td className="py-2 px-3">
                    {u.isBanned ? (
                      <button onClick={() => unbanUser(u.id)} className="text-[var(--success)] text-xs underline">Sbanna</button>
                    ) : (
                      <button onClick={() => banUser(u.id, 48)} className="text-[var(--danger)] text-xs underline">Ban 48h</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "logs" && (
        <div className="space-y-2">
          {logs.length === 0 && <p className="text-center text-[var(--text-secondary)] py-8">Nessun log</p>}
          {logs.map((l) => (
            <div key={l.id} className="glass rounded-lg px-4 py-2 text-sm flex justify-between">
              <span>
                <strong>{l.action}</strong> — {l.admin.email}
                {l.details && `: ${l.details}`}
                {l.targetIp && ` (IP: ${l.targetIp})`}
              </span>
              <span className="text-[var(--text-secondary)]">{new Date(l.createdAt).toLocaleString("it-IT")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
