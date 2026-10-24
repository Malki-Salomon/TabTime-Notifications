import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";

const App = lazy(() => import("../App.jsx"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "תזכורת תרופות" },
      { name: "description", content: "אפליקציית תזכורות תרופות עם זיהוי מרשמים בתמונה והתראות דחיפה." },
    ],
  }),
  component: ClientApp,
});

function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}

