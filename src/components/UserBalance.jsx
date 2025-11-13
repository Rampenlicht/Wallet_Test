import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAppVisibility } from "../hooks/useAppVisibility";

export default function UserBalance({ session }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  const isAppVisible = useAppVisibility();

  // 1️⃣ Funktion zum Laden des Guthabens (wiederverwendbar)
  // Wir nutzen useCallback, damit wir sie in useEffects verwenden können
  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    
    // Optional: Kleines Laden anzeigen, wenn man zurück in die App kommt
    // setLoading(true); 
    
    console.log("[Data] Hole aktuelles Guthaben...");
    const { data, error } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Fehler beim Laden:", error.message);
    } else {
      setBalance(data.balance);
    }
    setLoading(false);
  }, [userId]);

  // 2️⃣ Effekt: Initiales Laden & Re-Focus Laden (DAS IST NEU)
  useEffect(() => {
    // Wenn keine UserID da ist oder App im Hintergrund -> Abbrechen
    if (!userId || !isAppVisible) return;

    // Führe den Fetch aus, wenn:
    // a) Die Komponente zum ersten Mal lädt (Mount)
    // b) isAppVisible von 'false' auf 'true' springt
    fetchBalance();

  }, [userId, isAppVisible, fetchBalance]); // <-- Reagiert auf Sichtbarkeit!


  // 3️⃣ Effekt: Echtzeit-Verbindung (WebSocket)
  useEffect(() => {
    if (!userId || !isAppVisible) return;

    console.log("[Realtime] Verbinde WebSocket...");

    const channel = supabase
      .channel(`balance-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Update empfangen!", payload);
          // Wir aktualisieren den State direkt mit dem Push-Event
          setBalance(payload.new.balance);
        }
      )
      .subscribe();

    return () => {
      console.log("[Realtime] Trenne Verbindung...");
      supabase.removeChannel(channel);
    };
  }, [userId, isAppVisible]);


  // --- Render ---
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md text-center border border-white/20 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Dein Guthaben</h2>
      <div className="text-3xl font-bold text-green-400">
        {loading ? "Lädt..." : (balance !== null ? `${balance.toFixed(2)} €` : "---")}
      </div>
    </div>
  );
}