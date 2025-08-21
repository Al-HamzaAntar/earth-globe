import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature as topojsonFeature } from "topojson-client";
import type { Feature as GeoFeature, Polygon, MultiPolygon } from "geojson";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

// Types for GeoJSON features with optional name property
type CountryFeature = GeoFeature<
  Polygon | MultiPolygon,
  { name?: string; [key: string]: any }
> & { id?: number | string };

type CountryInfo = {
  name: string;
  capital?: string;
};

// Using a reliable source for world topology data
const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";


const Globe: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef({ lambda: 0, phi: -15 });
  const speedRef = useRef(0); // Disabled rotation
  const featuresRef = useRef<CountryFeature[]>([]);
  const countryInfoRef = useRef<Map<string, CountryInfo>>(new Map());
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const currentZoomRef = useRef(1);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const pathRef = useRef<d3.GeoPath<any, d3.GeoPermissibleObjects> | null>(
    null
  );
  const hoveredIdRef = useRef<string | number | null>(null);

  // Resize handling for responsiveness
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      if (!svgRef.current) return;
      const width = el.clientWidth;
      const height = Math.max(420, Math.min(720, Math.round(width * 0.65)));
      svgRef.current.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svgRef.current.setAttribute("width", String(width));
      svgRef.current.setAttribute("height", String(height));

      const radius = (Math.min(width, height) / 2 - 8) * currentZoomRef.current;
      const projection = d3
        .geoOrthographic()
        .precision(0.5)
        .clipAngle(90)
        .rotate([rotationRef.current.lambda, rotationRef.current.phi])
        .translate([width / 2, height / 2])
        .scale(radius);

      const path = d3.geoPath(projection);
      projectionRef.current = projection;
      pathRef.current = path;

      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    return () => ro.disconnect();
  }, []);

  // Build the scene once
  useEffect(() => {
    if (!containerRef.current) return;

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("role", "img")
      .attr("aria-label", "Interactive spinning globe with world countries")
      .attr("class", "w-full h-auto select-none");

    // Capture SVG element
    svgRef.current = svg.node() as SVGSVGElement;

    // Initialize sizing and projection immediately
    if (containerRef.current && svgRef.current) {
      const el = containerRef.current;
      const width = el.clientWidth;
      const height = Math.max(420, Math.min(720, Math.round(width * 0.65)));
      svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);

      const radius = (Math.min(width, height) / 2 - 8) * currentZoomRef.current;
      const projection = d3
        .geoOrthographic()
        .precision(0.5)
        .clipAngle(90)
        .rotate([rotationRef.current.lambda, rotationRef.current.phi])
        .translate([width / 2, height / 2])
        .scale(radius);

      const path = d3.geoPath(projection);
      projectionRef.current = projection;
      pathRef.current = path;
    }
    // Background and layers
    svg
      .append("rect")
      .attr("class", "fill-background")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("data-bg", "true");

    svg.append("g").attr("data-layer", "oceans");
    svg.append("g").attr("data-layer", "graticule");
    svg.append("g").attr("data-layer", "countries");

    // Tooltip container
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointerEvents", "none")
      .attr(
        "class",
        "px-2 py-1 rounded-md bg-popover text-popover-foreground border border-border shadow-sm text-sm opacity-0 transition-opacity duration-150"
      );

    // Fetch world topology data and country info
    (async () => {
      try {
        const [world, restCountries] = await Promise.all([
          d3.json(WORLD_TOPO_URL) as Promise<any>,
          fetch("https://restcountries.com/v3.1/all?fields=name,capital")
            .then((r) => r.json())
            .catch(() => []) as Promise<Array<{ name: { common: string }; capital?: string[] }>>
        ]);

        const countries = topojsonFeature(world, world.objects.countries)
          .features as CountryFeature[];

        // Replace Israel with Palestine
        const modifiedCountries = countries.map(country => {
          if (country.properties?.name === 'Israel' || 
              country.properties?.name?.toLowerCase().includes('israel')) {
            return {
              ...country,
              properties: {
                ...country.properties,
                name: 'Palestine'
              }
            };
          }
          return country;
        });

        featuresRef.current = modifiedCountries;

        // Create country info map with fallback capitals
        const countryInfoMap = new Map<string, CountryInfo>();
        
        // Add fallback capitals for common countries
        const fallbackCapitals: { [key: string]: string } = {
          "United States of America": "Washington, D.C.",
          "United Kingdom": "London",
          "Russia": "Moscow",
          "China": "Beijing",
          "India": "New Delhi",
          "Japan": "Tokyo",
          "Germany": "Berlin",
          "France": "Paris",
          "Italy": "Rome",
          "Spain": "Madrid",
          "Brazil": "Brasília",
          "Canada": "Ottawa",
          "Australia": "Canberra",
          "Mexico": "Mexico City",
          "South Africa": "Cape Town",
          "Egypt": "Cairo",
          "Nigeria": "Abuja",
          "Kenya": "Nairobi",
          "Argentina": "Buenos Aires",
          "Chile": "Santiago",
          "Colombia": "Bogotá",
          "Peru": "Lima",
          "Venezuela": "Caracas",
          "Ecuador": "Quito",
          "Bolivia": "Sucre",
          "Uruguay": "Montevideo",
          "Paraguay": "Asunción",
          "Guyana": "Georgetown",
          "Suriname": "Paramaribo",
          "Turkey": "Ankara",
          "Iran": "Tehran",
          "Iraq": "Baghdad",
          "Saudi Arabia": "Riyadh",
          "Palestine": "Jerusalem",
          "Jordan": "Amman",
          "Lebanon": "Beirut",
          "Syria": "Damascus",
          "Afghanistan": "Kabul",
          "Pakistan": "Islamabad",
          "Bangladesh": "Dhaka",
          "Myanmar": "Naypyidaw",
          "Thailand": "Bangkok",
          "Vietnam": "Hanoi",
          "Cambodia": "Phnom Penh",
          "Laos": "Vientiane",
          "Malaysia": "Kuala Lumpur",
          "Singapore": "Singapore",
          "Indonesia": "Jakarta",
          "Philippines": "Manila",
          "South Korea": "Seoul",
          "North Korea": "Pyongyang",
          "Mongolia": "Ulaanbaatar",
          "Kazakhstan": "Nur-Sultan",
          "Uzbekistan": "Tashkent",
          "Ukraine": "Kyiv",
          "Poland": "Warsaw",
          "Czech Republic": "Prague",
          "Slovakia": "Bratislava",
          "Hungary": "Budapest",
          "Romania": "Bucharest",
          "Bulgaria": "Sofia",
          "Greece": "Athens",
          "Albania": "Tirana",
          "Serbia": "Belgrade",
          "Croatia": "Zagreb",
          "Slovenia": "Ljubljana",
          "Austria": "Vienna",
          "Switzerland": "Bern",
          "Netherlands": "Amsterdam",
          "Belgium": "Brussels",
          "Denmark": "Copenhagen",
          "Sweden": "Stockholm",
          "Norway": "Oslo",
          "Finland": "Helsinki",
          "Estonia": "Tallinn",
          "Latvia": "Riga",
          "Lithuania": "Vilnius",
          "Ireland": "Dublin",
          "Portugal": "Lisbon",
          "Morocco": "Rabat",
          "Algeria": "Algiers",
          "Tunisia": "Tunis",
          "Libya": "Tripoli",
          "Sudan": "Khartoum",
          "Ethiopia": "Addis Ababa",
          "Somalia": "Mogadishu",
          "Tanzania": "Dodoma",
          "Uganda": "Kampala",
          "Rwanda": "Kigali",
          "Burundi": "Gitega",
          "Dem. Rep. Congo": "Kinshasa",
          "Congo": "Brazzaville",
          "Central African Rep.": "Bangui",
          "Chad": "N'Djamena",
          "Niger": "Niamey",
          "Mali": "Bamako",
          "Burkina Faso": "Ouagadougou",
          "Senegal": "Dakar",
          "Mauritania": "Nouakchott",
          "Ghana": "Accra",
          "Côte d'Ivoire": "Yamoussoukro",
          "Liberia": "Monrovia",
          "Sierra Leone": "Freetown",
          "Guinea": "Conakry",
          "Guinea-Bissau": "Bissau",
          "Gambia": "Banjul",
          "Cameroon": "Yaoundé",
          "Gabon": "Libreville",
          "Eq. Guinea": "Malabo",
          "São Tomé and Príncipe": "São Tomé",
          "Angola": "Luanda",
          "Zambia": "Lusaka",
          "Zimbabwe": "Harare",
          "Botswana": "Gaborone",
          "Namibia": "Windhoek",
          "eSwatini": "Mbabane",
          "Lesotho": "Maseru",
          "Malawi": "Lilongwe",
          "Mozambique": "Maputo",
          "Madagascar": "Antananarivo"
        };
        
        // First add REST Countries data
        restCountries.forEach((country) => {
          const name = country.name?.common;
          const capital = country.capital?.[0];
          if (name) {
            countryInfoMap.set(name, { name, capital });
            countryInfoMap.set(name.toLowerCase(), { name, capital });
          }
        });
        
        // Then add fallback capitals
        Object.entries(fallbackCapitals).forEach(([name, capital]) => {
          if (!countryInfoMap.has(name)) {
            countryInfoMap.set(name, { name, capital });
            countryInfoMap.set(name.toLowerCase(), { name, capital });
          }
        });
        
        countryInfoRef.current = countryInfoMap;

        // Find and highlight Yemen by default
        const yemenCountry = modifiedCountries.find(country => 
          country.properties?.name === "Yemen" || 
          country.properties?.name?.toLowerCase().includes("yemen")
        );
        if (yemenCountry) {
          hoveredIdRef.current = yemenCountry.id ?? null;
        }

        setLoading(false);
        draw();
      } catch (e) {
        console.error("Failed to load world data", e);
        setLoading(false);
      }
    })();

    // Zoom behavior - allow wheel zoom without Ctrl key
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .filter((event) => {
        // Allow wheel events for zoom, but prevent drag events from being handled by zoom
        return event.type === 'wheel' || (event.type === 'mousedown' && event.ctrlKey);
      })
      .on("start", () => {
        speedRef.current = 0; // Stop auto-rotation
      })
      .on("zoom", (event) => {
        if (event.sourceEvent && event.sourceEvent.type === 'wheel') {
          // Update the scale for the projection
          currentZoomRef.current = event.transform.k;
          
          // Update projection scale
          if (projectionRef.current && containerRef.current) {
            const width = containerRef.current.clientWidth;
            const height = Math.max(420, Math.min(720, Math.round(width * 0.65)));
            const radius = (Math.min(width, height) / 2 - 8) * currentZoomRef.current;
            projectionRef.current.scale(radius);
          }
          
          draw();
        }
      });

    // Drag behavior for rotation
    const drag = d3.drag<SVGSVGElement, unknown>()
      .filter((event) => !event.ctrlKey && event.button === 0) // Only left mouse drag without Ctrl
      .on("start", () => {
        speedRef.current = 0; // Stop auto-rotation
        svg.style("cursor", "grabbing");
      })
      .on("drag", (event) => {
        const { dx, dy } = event;
        rotationRef.current.lambda += dx * 0.25; // yaw
        rotationRef.current.phi = Math.max(
          -60,
          Math.min(60, rotationRef.current.phi - dy * 0.25)
        ); // pitch clamp
        draw();
      })
      .on("end", () => {
        svg.style("cursor", "grab");
      });

    zoomRef.current = zoom;
    
    // Apply behaviors
    svg.call(zoom);
    svg.call(drag);
    svg.style("cursor", "grab");

    // Hover highlight + tooltip
    svg.on("mousemove", (event: MouseEvent) => {
      if (!projectionRef.current || !pathRef.current) return;
      const [x, y] = d3.pointer(event);
      const p = projectionRef.current.invert([x, y]);
      if (!p) return;

      const hovered = featuresRef.current.find((f) => d3.geoContains(f as any, p));
      const id = hovered?.id ?? null;

      if (id !== hoveredIdRef.current) {
        hoveredIdRef.current = id;
        draw();
      }

      if (hovered) {
        const name = hovered.properties?.name || "";
        const countryInfo = countryInfoRef.current.get(name) || 
                           countryInfoRef.current.get(name.toLowerCase()) || 
                           { name, capital: undefined };
        
        // Get translated country name and capital based on current language
        let translatedName: string;
        let translatedCapital: string;
        
        if (i18n.language === 'ar') {
          // In Arabic mode, only show Arabic translations
          translatedName = t(`countries.${name}`, { defaultValue: '' });
          const originalCapital = countryInfo.capital || '';
          translatedCapital = originalCapital ? t(`capitals.${originalCapital}`, { defaultValue: '' }) : '';
          
          // If no Arabic translation exists, don't show the tooltip
          if (!translatedName) return;
        } else {
          // In English mode, show English with fallbacks
          translatedName = t(`countries.${name}`, { defaultValue: name });
          const originalCapital = countryInfo.capital || t('globe.unknown');
          translatedCapital = t(`capitals.${originalCapital}`, { defaultValue: originalCapital });
        }
        
        // Get container bounds for proper positioning
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;
        
        tooltip.style("opacity", "1");
        tooltip.style("left", `${mouseX + 12}px`);
        tooltip.style("top", `${mouseY - 8}px`);
        tooltip.html(`
          <div class="space-y-1" dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}">
            <div class="font-medium text-foreground">${translatedName}</div>
            <div class="text-sm text-muted-foreground">${t('globe.capital')}: ${translatedCapital}</div>
          </div>
        `);
      } else {
        tooltip.style("opacity", "0");
      }
    });

    svg.on("mouseleave", () => {
      hoveredIdRef.current = null;
      draw();
      tooltip.style("opacity", "0");
    });

    // Auto-rotation animation
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) speedRef.current = 0;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (speedRef.current !== 0) {
        rotationRef.current.lambda += dt * speedRef.current;
        draw();
      }
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      d3.select(svgRef.current).remove();
      tooltip.remove();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw paths based on current projection/size/state
  const draw = () => {
    const svg = d3.select(svgRef.current);
    const projection = projectionRef.current;
    const path = pathRef.current;
    if (!svg.node() || !projection || !path) return;

    const width = Number(svg.attr("width")) || 800;
    const height = Number(svg.attr("height")) || 520;

    // Update background rect size if present
    svg
      .select('[data-bg="true"]')
      .attr("width", width)
      .attr("height", height);

    projection.rotate([rotationRef.current.lambda, rotationRef.current.phi]);

    // Oceans (the sphere)
    const oceans = svg.select('[data-layer="oceans"]').selectAll("path").data([{
      type: "Sphere",
    }] as any);

    oceans
      .join("path")
      .attr("d", path as any)
      .attr("class", "fill-accent/30");

    // Graticule
    const graticule = d3.geoGraticule10();
    const grat = svg.select('[data-layer="graticule"]').selectAll("path").data([graticule as any]);

    grat
      .join("path")
      .attr("d", path as any)
      .attr("class", "fill-none stroke-ring stroke-opacity-20 stroke-[0.5px]");

    // Countries
    const baseClasses = "stroke-muted-foreground stroke-opacity-40 stroke-[0.5px]";
    const countries = svg
      .select('[data-layer="countries"]')
      .selectAll<SVGPathElement, CountryFeature>("path")
      .data(featuresRef.current, (d: any) => d?.id ?? (d?.properties?.name ?? ""));

        countries
      .join((enter) =>
        enter
          .append("path")
          .attr("d", path as any)
          .attr("data-id", (d) => String(d.id ?? d.properties?.name ?? ""))
          .attr("class", (d) => {
            const isYemen = d.properties?.name === "Yemen" || 
                           d.properties?.name?.toLowerCase().includes("yemen");
            const isExcluded = d.properties?.name === "Somaliland" ||
                              d.properties?.name === "N. Cyprus" ||
                              d.properties?.name === "Kosovo" ||
                              d.properties?.name?.toLowerCase().includes("somaliland") ||
                              d.properties?.name?.toLowerCase().includes("cyprus") ||
                              d.properties?.name?.toLowerCase().includes("kosovo");
            const isHovered = hoveredIdRef.current === (d.id ?? null) && !isExcluded;
            
            if (isYemen) {
              return `${baseClasses} fill-foreground stroke-foreground stroke-2`;
            }
            return isHovered
              ? `${baseClasses} fill-primary fill-opacity-60`
              : `${baseClasses} fill-card`;
          })
      )
      .attr("d", path as any)
      .attr("class", (d) => {
        const isYemen = d.properties?.name === "Yemen" || 
                       d.properties?.name?.toLowerCase().includes("yemen");
        const isExcluded = d.properties?.name === "Somaliland" ||
                          d.properties?.name === "N. Cyprus" ||
                          d.properties?.name === "Kosovo" ||
                          d.properties?.name?.toLowerCase().includes("somaliland") ||
                          d.properties?.name?.toLowerCase().includes("cyprus") ||
                          d.properties?.name?.toLowerCase().includes("kosovo");
        const isHovered = hoveredIdRef.current === (d.id ?? null) && !isExcluded;
        
        if (isYemen) {
          return `${baseClasses} fill-foreground stroke-foreground stroke-2`;
        }
        return isHovered
          ? `${baseClasses} fill-primary fill-opacity-60`
          : `${baseClasses} fill-card`;
      });
  };

  return (
    <section aria-labelledby="globe-title" className="w-full">
      <header className="mb-6 text-center">
        <h2 id="globe-title" className="text-xl font-semibold text-foreground">
          {t('globe.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('globe.instructions')}
        </p>
      </header>
      <div
        ref={containerRef}
        className="relative w-full mx-auto rounded-xl border border-border bg-card shadow-sm"
      >
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            {t('globe.loading')}
          </div>
        )}
      </div>
    </section>
  );
};

export default Globe;
