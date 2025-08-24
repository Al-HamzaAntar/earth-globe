import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

interface CountrySearchProps {
  onCountrySearch: (countryName: string) => void;
}

const CountrySearch: React.FC<CountrySearchProps> = ({ onCountrySearch }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onCountrySearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        />
      </div>
      <Button type="submit" variant="outline">
        {t('search.button')}
      </Button>
    </form>
  );
};

export default CountrySearch;