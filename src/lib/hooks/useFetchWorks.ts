import { useEffect, useState } from "react";

export function useFetchWorks() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/works");
        const data = await response.json();
        setWorks(data.works ?? []);
      } catch (err) {
        console.error("Failed to load works:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { works, loading };
}
