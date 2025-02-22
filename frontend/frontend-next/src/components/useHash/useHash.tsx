import { useEffect, useState } from "react";

export function useHash() {
  const [hash, setHash] = useState<string>(location.hash);
  useEffect(() => {
    const f = () => setHash(location.hash);
    self.addEventListener("hashchange", f);
    return () => self.removeEventListener("hashchange", f);
  }, [setHash]);
  return hash;
}