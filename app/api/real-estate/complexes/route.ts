import { NextResponse } from "next/server";
import { getEstatePool } from "@/lib/estate-db";

export async function GET() {
  try {
    const pool = getEstatePool();
    const { rows } = await pool.query<{ id: number; name: string | null }>(
      `
      select id, name
      from public.complexes
      where name is not null and trim(name) <> ''
      order by name asc
      limit 500
      `
    );
    return NextResponse.json(
      rows.map((r: { id: number; name: string | null }) => ({
        id: r.id,
        name: r.name?.trim() || ""
      }))
    );
  } catch (err) {
    console.error("complexes route failed", err);
    return NextResponse.json({ error: "Failed to load complexes" }, { status: 500 });
  }
}
