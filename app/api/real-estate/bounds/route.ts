import { NextResponse } from "next/server";
import { getEstatePool } from "@/lib/estate-db";

export async function GET() {
  try {
    const pool = getEstatePool();
    const { rows } = await pool.query<{
      min_price: string | null;
      max_price: string | null;
      min_price_m2: string | null;
      max_price_m2: string | null;
      min_floor: number | null;
      max_floor: number | null;
    }>(
      `
      select
        min(price) as min_price,
        max(price) as max_price,
        min(price_m2) as min_price_m2,
        max(price_m2) as max_price_m2,
        min(floor) as min_floor,
        max(floor) as max_floor
      from public.flats
      `
    );

    const r =
      rows[0] || {
        min_price: null,
        max_price: null,
        min_price_m2: null,
        max_price_m2: null,
        min_floor: null,
        max_floor: null
      };
    return NextResponse.json({
      price: {
        min: r.min_price ? Number(r.min_price) : 0,
        max: r.max_price ? Number(r.max_price) : 100_000_000
      },
      priceM2: {
        min: r.min_price_m2 ? Number(r.min_price_m2) : 0,
        max: r.max_price_m2 ? Number(r.max_price_m2) : 1_000_000
      },
      floor: {
        min: typeof r.min_floor === "number" ? r.min_floor : 1,
        max: typeof r.max_floor === "number" ? r.max_floor : 50
      }
    });
  } catch (err) {
    console.error("bounds route failed", err);
    return NextResponse.json({ error: "Failed to load bounds" }, { status: 500 });
  }
}
