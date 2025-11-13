import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // passe den Pfad ggf. an

export default function UserBalance({ session }) {
  const [balance, setBalance] = useState(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    // 1️⃣ Guthaben einmalig laden
    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("balance")
        .eq("id", userId)
        .single();

      if (error) console.error(error);
      else setBalance(data.balance);
    };

    fetchBalance();

    // 2️⃣ Echtzeit-Update aktivieren
    const channel = supabase
      .channel("balance-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setBalance(payload.new.balance);
        }
      )
      .subscribe();

    // Cleanup beim Verlassen
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md text-center border border-white/20 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Dein Guthaben</h2>
      <div className="text-3xl font-bold text-green-400">
        {balance !== null ? `${balance.toFixed(2)} €` : "Lädt..."}
      </div>
    </div>
  );
}
