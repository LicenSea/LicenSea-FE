import { useEffect, useState } from "react";

export function useFetchWorks(packageId: string) {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packageId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const query = `
          query {
            objects(
              filter: {
                type: "${packageId}::work::Work"
              }
            ) {
              nodes {
                address
                digest
                asMoveObject {
                  contents {
                    json
                  }
                }
              }
            }
          }
        `;

        const response = await fetch("https://graphql.testnet.sui.io/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-sui-rpc-show-usage": "true",
          },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();
        setWorks(result.data?.objects?.nodes ?? []);
      } catch (err) {
        console.error("Failed to load shared works:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [packageId]);

  return { works, loading };
}
