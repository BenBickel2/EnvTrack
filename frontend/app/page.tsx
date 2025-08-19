"use client";
import { useEffect, useState } from "react";
import MapView from "./MapView";

export default function HomePage() {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:8000/areas?limit=50");
        if (!r.ok) throw new Error(`API failed: ${r.status}`);
        const json = await r.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message ?? "fetch failed");
      }
    })();
  }, []);

  if (error) return <div style={{ padding: 24 }}>Error: {error}</div>;
  if (!data) return (
    <main>
      <h1>Boston Environmental Tracker</h1>
      <MapView />
      <div style={{ padding: 24 }}>Loading…</div>
    </main>
  );

  return (
    <main>
      <h1>Boston Environmental Tracker</h1>
      <MapView />
      <table cellPadding={8} style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Score</th><th>Air</th><th>Water</th><th>Hazard</th></tr>
        </thead>
        <tbody>
          {data.items.map((a: any) => (
            <tr key={a.area_id}>
              <td>{a.area_id}</td>
              <td>{a.name}</td>
              <td>{a.score}</td>
              <td>{a.theme_air}</td>
              <td>{a.theme_water}</td>
              <td>{a.theme_hazard}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}