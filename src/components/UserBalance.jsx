import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAppVisibility } from "../hooks/useAppVisibility"; // <-- Immer noch benötigt

// 1. KEINE `session` prop mehr!
export default function UserBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Wir verwalten die userId in einem eigenen State
  const [userId, setUserId] = useState(null);

  const isAppVisible = useAppVisibility();

  // 3. NEUER EFFEKT: Holt den User beim Start (Kaltstart)
  // Dieser Effekt läuft NUR EINMAL beim Mounten der Komponente.
  useEffect(() => {
    let isMounted = true; // Verhindert State-Updates, falls Komponente schnell unmounted

    // (A) Versucht, den User aus der laufenden Session zu holen (Kaltstart)
    async function getInitialUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted && user) {
        setUserId(user.id);
      }
    }
    
    getInitialUser();

    // (B) Lauscht auf zukünftige Auth-Änderungen (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUserId(session?.user?.id ?? null);
        }
      }
    );

    // Cleanup-Funktion
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []); // <-- Das leere Array [] ist entscheidend. Läuft nur 1x.


  // 4. DATEN-ABRUF (unverändert)
  const fetchBalance = useCallback(async () => {
    if (!userId) return;

    setLoading(true); // Wir wollen beim Neuladen/Refocus den Lade-State
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
  }, [userId]); // Abhängig vom lokalen userId-State


  // 5. EFFEKT FÜR RE-FOCUS & NEUSTART (unverändert)
  useEffect(() => {
    if (!userId || !isAppVisible) return;
    fetchBalance(); // Holt Daten beim Start UND wenn App zurückkommt
  }, [userId, isAppVisible, fetchBalance]);


  // 6. EFFEKT FÜR ECHTZEIT (unverändert)
  useEffect(() => {
    if (!userId || !isAppVisible) return;

    console.log("[Realtime] Verbinde WebSocket...");
    const channel = supabase
      .channel(`balance-updates-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` },
        (payload) => {
          console.log("[Realtime] Update empfangen!");
          setBalance(payload.new.balance);
        }
      )
      .subscribe();

    return () => {
      console.log("[Realtime] Trenne Verbindung.");
      supabase.removeChannel(channel);
    };
  }, [userId, isAppVisible]); // Abhängig vom lokalen userId-State


  // --- RENDER ---
  const displayBalance = loading 
    ? "Lädt..." 
    : (balance !== null ? `${balance.toFixed(2)} €` : "---");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md text-center border border-white/20 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Dein Guthaben</h2>
      <div className="text-3xl font-bold text-green-400">
        {displayBalance}
      </div>
    </div>
  );
}