import { useEffect, useState } from "react";
import Globe from "@/components/Globe";
import CountrySearch from "@/components/CountrySearch";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { t, i18n } = useTranslation();
  const [searchCountry, setSearchCountry] = useState<string>("");

  const handleCountrySearch = (countryName: string) => {
    setSearchCountry(countryName);
  };

  const handleCountryFound = (found: boolean) => {
    if (found) {
      toast({
        title: t('search.success'),
        description: t('search.found'),
      });
    } else {
      toast({
        title: t('search.error'),
        description: t('search.notFound'),
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    const title = "Interactive D3 Globe — World Countries";
    const description =
      "Explore a spinning D3.js globe with all world countries. Drag to rotate and hover to see names and details.";
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

    let link = document.querySelector('link[rel="canonical"]') as
      | HTMLLinkElement
      | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto flex items-center justify-end gap-2 py-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <header className="container mx-auto pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted-foreground text-base md:text-lg">
          {t('subtitle')}
        </p>
      </header>
      <section className="container mx-auto">
        <CountrySearch onCountrySearch={handleCountrySearch} />
        <Globe searchCountry={searchCountry} onCountryFound={handleCountryFound} />
      </section>
    </main>
  );
};

export default Index;
