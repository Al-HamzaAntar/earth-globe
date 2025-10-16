import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface CountryData {
  name: string;
  nameArabic?: string;
  capital?: string;
  capitalArabic?: string;
  population?: number;
  area?: number;
  currencies?: { [key: string]: { name: string; symbol?: string } };
  languages?: { [key: string]: string };
  flags?: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  region?: string;
  regionArabic?: string;
  subregion?: string;
  subregionArabic?: string;
}

interface CountryInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  countryData: CountryData | null;
  loading?: boolean;
}

const CountryInfoDialog: React.FC<CountryInfoDialogProps> = ({
  isOpen,
  onClose,
  countryData,
  loading = false,
}) => {
  const { t, i18n } = useTranslation();

  if (!countryData && !loading) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US').format(num);
  };

  const getLanguages = () => {
    if (!countryData?.languages) return t('countryInfo.unknown');
    const languagesList = Object.values(countryData.languages);
    
    if (i18n.language === 'ar') {
      return languagesList
        .map(lang => t(`languages.${lang}`, { defaultValue: lang }))
        .join('، ');
    }
    
    return languagesList.join(', ');
  };

  const getCurrencies = () => {
    if (!countryData?.currencies) return t('countryInfo.unknown');
    const currenciesList = Object.values(countryData.currencies);
    
    if (i18n.language === 'ar') {
      return currenciesList
        .map(curr => {
          const translatedName = t(`currencies.${curr.name}`, { defaultValue: curr.name });
          return curr.symbol ? `${translatedName} (${curr.symbol})` : translatedName;
        })
        .join('، ');
    }
    
    return currenciesList
      .map(curr => curr.symbol ? `${curr.name} (${curr.symbol})` : curr.name)
      .join(', ');
  };

  const displayName = i18n.language === 'ar' && countryData?.nameArabic 
    ? countryData.nameArabic 
    : countryData?.name;

  const displayCapital = i18n.language === 'ar' && countryData?.capitalArabic
    ? countryData.capitalArabic
    : countryData?.capital;

  const displayRegion = i18n.language === 'ar' && countryData?.regionArabic
    ? countryData.regionArabic
    : countryData?.region;

  const displaySubregion = i18n.language === 'ar' && countryData?.subregionArabic
    ? countryData.subregionArabic
    : countryData?.subregion;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {countryData?.flags?.png && (
              <img 
                src={countryData.flags.png} 
                alt={countryData.flags.alt || `${displayName} flag`}
                className="w-8 h-6 object-cover rounded border"
              />
            )}
            <span>{displayName || t('countryInfo.loading')}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">{t('countryInfo.loading')}</div>
          </div>
        ) : countryData ? (
          <div className="space-y-4">
            {/* Capital */}
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('countryInfo.capital')}
              </div>
              <div className="text-base">
                {displayCapital || t('countryInfo.unknown')}
              </div>
            </div>

            <Separator />

            {/* Population */}
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('countryInfo.population')}
              </div>
              <div className="text-base">
                {countryData.population 
                  ? formatNumber(countryData.population)
                  : t('countryInfo.unknown')}
              </div>
            </div>

            <Separator />

            {/* Area */}
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('countryInfo.area')}
              </div>
              <div className="text-base">
                {countryData.area 
                  ? `${formatNumber(countryData.area)} ${t('countryInfo.km2')}`
                  : t('countryInfo.unknown')}
              </div>
            </div>

            <Separator />

            {/* Languages */}
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('countryInfo.languages')}
              </div>
              <div className="text-base">
                {getLanguages()}
              </div>
            </div>

            <Separator />

            {/* Currency */}
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                {t('countryInfo.currency')}
              </div>
              <div className="text-base">
                {getCurrencies()}
              </div>
            </div>

            {/* Region */}
            {displayRegion && (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('countryInfo.region')}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary">{displayRegion}</Badge>
                    {displaySubregion && (
                      <Badge variant="outline">{displaySubregion}</Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CountryInfoDialog;