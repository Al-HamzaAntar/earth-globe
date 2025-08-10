import { useEffect } from "react";
import Globe from "@/components/Globe";

const Index = () => {
  useEffect(() => {
    const title = "Interactive D3 Globe — World Countries";
    const description = "Explore a spinning D3.js globe with all world countries. Drag to rotate and hover to see names.";
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);

    // Open Graph
    const setOG = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setOG("og:title", title);
    setOG("og:description", description);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Interactive D3 Globe
        </h1>
        <p className="mt-3 text-muted-foreground text-base md:text-lg">
          A responsive, accessible globe with all world countries.
        </p>
      </header>
      <section className="container mx-auto pb-12">
        <Globe />
      </section>
    </main>
  );
};

export default Index;
