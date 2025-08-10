import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature as topojsonFeature } from "topojson-client";
import type { Feature as GeoFeature, Polygon, MultiPolygon } from "geojson";

// Types for GeoJSON features with optional name property
type CountryFeature = GeoFeature<
  Polygon | MultiPolygon,
  { name?: string; [key: string]: any }
> & { id?: number | string };

const WORLD_TOPO_URL =
  "https://unpkg.com/world-atlas@2/countries-110m.json";
const COUNTRY_NAMES_TSV_URL =
  "https://unpkg.com/world-atlas@2/country-names.tsv";

type RestCountry = {
  ccn3?: string;
  name: { common: string; official?: string };
  capital?: string[];
  region?: string;
  subregion?: string;
  population?: number;
  flag?: string;
  flags?: { svg?: string; png?: string };
};

const Globe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef({ lambda: 0, phi: -15 });
  const speedRef = useRef(0.015); // deg per ms
  const featuresRef = useRef<CountryFeature[]>([]);
  const countryInfoRef = useRef<Map<string, RestCountry>>(new Map());
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

      const radius = Math.min(width, height) / 2 - 8;
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

      const radius = Math.min(width, height) / 2 - 8;
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

    // Fetch world + names + country info
    (async () => {
      try {
        const [world, namesTSV, restCountries] = await Promise.all([
          d3.json(WORLD_TOPO_URL) as Promise<any>,
          d3.tsv(COUNTRY_NAMES_TSV_URL) as Promise<Array<{ id: string; name: string }>>,
          fetch(
            "https://restcountries.com/v3.1/all?fields=ccn3,name,capital,region,subregion,population,flag,flags"
          ).then((r) => r.json()) as Promise<RestCountry[]>,
        ]);

        const byIdName = new Map(
          (namesTSV as Array<{ id: string; name: string }>).map((d) => [
            Number(d.id),
            d.name,
          ])
        );

        const countries = (topojsonFeature(world, world.objects.countries)
          .features as CountryFeature[]).map((f) => ({
          ...f,
          properties: {
            ...(f.properties || {}),
            name: byIdName.get(Number(f.id)) || f.properties?.name,
          },
        })) as CountryFeature[];

        featuresRef.current = countries;

        const infoMap = new Map<string, RestCountry>();
        (restCountries as RestCountry[]).forEach((rc) => {
          if (rc.ccn3) infoMap.set(String(Number(rc.ccn3)), rc);
        });
        countryInfoRef.current = infoMap;

        setLoading(false);
        draw();
      } catch (e) {
        console.error("Failed to load world data", e);
        setLoading(false);
      }
    })();

    // Drag interaction (basic yaw/pitch)
    const drag = d3
      .drag<SVGSVGElement, unknown>()
      .on("start", () => {
        if (animationRef.current) {
          // Temporarily slow during drag
          speedRef.current = 0;
        }
      })
      .on("drag", (event) => {
        const { dx, dy } = event as any;
        rotationRef.current.lambda += dx * 0.25; // yaw
        rotationRef.current.phi = Math.max(
          -60,
          Math.min(60, rotationRef.current.phi - dy * 0.25)
        ); // pitch clamp
        draw();
      })
      .on("end", () => {
        // Resume slow spin
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          speedRef.current = 0.015;
        }
      });

    svg.call(drag as any);

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
        const info = countryInfoRef.current.get(String(Number(hovered.id)));
        const capital = info?.capital?.[0] ?? "—";
        const region = info?.region ?? "—";
        const population = info?.population ? d3.format(",")(info.population) : "—";
        const flag = info?.flag ?? "";
        tooltip.style("opacity", "1");
        tooltip.style("transform", `translate(${x + 12}px, ${y + 12}px)`);
        tooltip.html(
          `<div class="space-y-0.5">
            <div class="font-medium text-foreground">${flag ? `${flag} ` : ""}${name ?? ""}</div>
            <div class="text-muted-foreground">Capital: ${capital}</div>
            <div class="text-muted-foreground">Region: ${region}</div>
            <div class="text-muted-foreground">Population: ${population}</div>
          </div>`
        );
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
      .attr("class", "fill-current text-accent/20");

    // Graticule
    const graticule = d3.geoGraticule10();
    const grat = svg.select('[data-layer="graticule"]').selectAll("path").data([graticule as any]);

    grat
      .join("path")
      .attr("d", path as any)
      .attr("class", "fill-none stroke-ring stroke-opacity-20 stroke-[0.5px]");

    // Countries
    const baseClasses = "stroke-border stroke-[0.5px] fill-current";
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
            const highlighted = hoveredIdRef.current === (d.id ?? null);
            return highlighted
              ? `${baseClasses} text-primary fill-opacity-60`
              : `${baseClasses} text-secondary`;
          })
      )
      .attr("d", path as any)
      .attr("class", (d) => {
        const highlighted = hoveredIdRef.current === (d.id ?? null);
        return highlighted
          ? `${baseClasses} text-primary fill-opacity-60`
          : `${baseClasses} text-secondary`;
      });
  };

  return (
    <section aria-labelledby="globe-title" className="w-full">
      <header className="mb-6 text-center">
        <h2 id="globe-title" className="text-xl font-semibold text-foreground">
          World Countries Globe
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag to rotate. Hover a country to see details.
        </p>
      </header>
      <div
        ref={containerRef}
        className="relative w-full mx-auto rounded-xl border border-border bg-card shadow-sm"
      >
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            Loading map…
          </div>
        )}
      </div>
    </section>
  );
};

export default Globe;
