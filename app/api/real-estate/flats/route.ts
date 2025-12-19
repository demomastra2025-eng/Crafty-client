import { NextRequest, NextResponse } from "next/server";
import { getEstatePool } from "@/lib/estate-db";

type EstateTypeId = "apartment" | "storage" | "parking";

function parseNumber(value: string | null, fallback: number | null = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const pool = getEstatePool();
    const url = req.nextUrl;
    const page = Math.max(0, parseNumber(url.searchParams.get("page"), 0) || 0);
    const pageSize = Math.min(
      100,
      Math.max(1, parseNumber(url.searchParams.get("pageSize"), 30) || 30)
    );

    const minPrice = parseNumber(url.searchParams.get("minPrice"), 0) ?? 0;
    const maxPrice = parseNumber(url.searchParams.get("maxPrice"), 100_000_000) ?? 100_000_000;
    const minPriceM2 = parseNumber(url.searchParams.get("minPriceM2"), 0) ?? 0;
    const maxPriceM2 =
      parseNumber(url.searchParams.get("maxPriceM2"), 1_000_000) ?? 1_000_000;
    const complexId = parseNumber(url.searchParams.get("complexId"), null);
    const search = (url.searchParams.get("search") || "").trim();

    const typesParam = (url.searchParams.get("types") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean) as EstateTypeId[];
    const types = typesParam.length ? typesParam : null;

    const roomsParam = (url.searchParams.get("rooms") || "")
      .split(",")
      .map((r) => parseNumber(r, null))
      .filter((r): r is number => typeof r === "number");
    const rooms = roomsParam.length ? roomsParam : null;

    const floorMin = parseNumber(url.searchParams.get("floorMin"), null);
    const floorMax = parseNumber(url.searchParams.get("floorMax"), null);

    const where: string[] = [];
    const values: unknown[] = [];
    const add = (sql: string, val?: unknown) => {
      if (val !== undefined) {
        values.push(val);
        where.push(sql.replace("?", `$${values.length}`));
      } else {
        where.push(sql);
      }
    };

    add("price >= ?", minPrice);
    add("price <= ?", maxPrice);
    add("price_m2 >= ?", minPriceM2);
    add("price_m2 <= ?", maxPriceM2);

    if (typeof complexId === "number") add("complex_id = ?", complexId);

    if (search) {
      values.push(`%${search}%`);
      const p = `$${values.length}`;
      where.push(`(complex_name ilike ${p} or address ilike ${p} or title ilike ${p})`);
    }

    if (types) {
      const typeClauses: string[] = [];
      if (types.includes("apartment")) typeClauses.push("(rooms is not null)");
      if (types.includes("storage"))
        typeClauses.push("(rooms is null and (title_image is null or trim(title_image) = ''))");
      if (types.includes("parking"))
        typeClauses.push("(rooms is null and (title_image is not null and trim(title_image) <> ''))");
      if (typeClauses.length) where.push(`(${typeClauses.join(" or ")})`);
    }

    if (rooms) {
      values.push(rooms);
      where.push(`rooms = any($${values.length})`);
    }

    if (typeof floorMin === "number") add("floor >= ?", floorMin);
    if (typeof floorMax === "number") add("floor <= ?", floorMax);

    const offset = page * pageSize;
    values.push(pageSize + 1, offset);
    const limitParam = `$${values.length - 1}`;
    const offsetParam = `$${values.length}`;

    const sql = `
      select
        id,
        complex_id,
        complex_name,
        address,
        rooms,
        area::float8 as area,
        price,
        price_m2,
        floor,
        floors_in_house,
        entrance,
        flat_number,
        title_image,
        status_name,
        is_reserved,
        is_sold,
        title,
        description,
        updated_at
      from public.flats
      ${where.length ? `where ${where.join(" and ")}` : ""}
      order by updated_at desc
      limit ${limitParam} offset ${offsetParam}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > pageSize;
    const items = hasMore ? rows.slice(0, pageSize) : rows;

    return NextResponse.json({ items, hasMore });
  } catch (err) {
    console.error("flats route failed", err);
    return NextResponse.json({ error: "Failed to load flats" }, { status: 500 });
  }
}
