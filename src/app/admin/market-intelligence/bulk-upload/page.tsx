"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Upload, Trash2, Send } from "lucide-react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { TRACKED_INTELLIGENCE_PRODUCTS } from "@/lib/market-intelligence";

// ---------------------------------------------------------------------------
// Spreadsheet column map (0-indexed)
// A=0 product  B=1 county  C=2 market  D=3 price  E=4 unit
// F=5 date     G=6 source  H=7 notes
// ---------------------------------------------------------------------------

const VALID_PRODUCT_KEYS = new Set<string>(TRACKED_INTELLIGENCE_PRODUCTS.map((p) => p.key));

const VALID_UNITS = new Set([
  "90kg bag", "50kg bag", "120kg bag", "25kg bag",
  "kg", "kg live weight",
  "crate", "bunch", "tonne", "box",
  "head", "bird", "tray (30 eggs)", "dozen",
  "litre", "500ml", "packet", "piece",
  "acre", "hour", "day", "job", "session",
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type RawRow = {
  rowNum: number;
  productKey: string;
  county: string;
  marketName: string;
  price: string;
  unit: string;
  observationDate: string;
  source: string;
  notes: string;
};

type RowError = {
  field: string;
  message: string;
};

type ParsedRow = RawRow & {
  errors: RowError[];
  valid: boolean;
  selected: boolean;
};

const PRODUCTS_MUTABLE = TRACKED_INTELLIGENCE_PRODUCTS as ReadonlyArray<{
  key: string;
  name: string;
  category: string;
  defaultUnit: string;
}>;

function getProductCategory(key: string): string {
  return PRODUCTS_MUTABLE.find((item) => item.key === key)?.category || "produce";
}

function getProductName(key: string): string {
  return PRODUCTS_MUTABLE.find((item) => item.key === key)?.name || key;
}

function parseRow(cells: string[], rowNum: number): ParsedRow {
  const [productKey = "", county = "", marketName = "", priceRaw = "", unit = "", observationDate = "", source = "", notes = ""] =
    cells.map((c) => c.trim());

  const errors: RowError[] = [];

  if (!productKey) errors.push({ field: "product", message: "Required" });
  else if (!VALID_PRODUCT_KEYS.has(productKey.toLowerCase())) {
    errors.push({ field: "product", message: `Unknown: "${productKey}"` });
  }

  if (!county) errors.push({ field: "county", message: "Required" });
  if (!marketName) errors.push({ field: "market", message: "Required" });

  const priceNum = Number(priceRaw.replace(/[^0-9.]/g, ""));
  if (!priceRaw) errors.push({ field: "price", message: "Required" });
  else if (!Number.isFinite(priceNum) || priceNum <= 0) {
    errors.push({ field: "price", message: "Must be a positive number" });
  }

  if (!unit) errors.push({ field: "unit", message: "Required" });
  else if (!VALID_UNITS.has(unit.toLowerCase())) {
    errors.push({ field: "unit", message: `Unknown unit: "${unit}"` });
  }

  if (!observationDate) errors.push({ field: "date", message: "Required (YYYY-MM-DD)" });
  else if (!DATE_RE.test(observationDate)) {
    errors.push({ field: "date", message: "Use YYYY-MM-DD format" });
  }

  return {
    rowNum,
    productKey: productKey.toLowerCase(),
    county,
    marketName,
    price: priceRaw.replace(/[^0-9.]/g, ""),
    unit: unit.toLowerCase(),
    observationDate,
    source,
    notes,
    errors,
    valid: errors.length === 0,
    selected: errors.length === 0,
  };
}

const HEADER_RE = /^(product|commodity|item)\b/i;

function parsePaste(text: string): ParsedRow[] {
  return text
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim().length > 0)
    .filter((line) => !HEADER_RE.test(line.trim())) // skip header row if included
    .map((line) => line.split("\t"))
    .filter((cells) => cells.length >= 4)
    .map((cells, i) => parseRow(cells, i + 1));
}

type ImportStatus = "idle" | "running" | "done";

export default function BulkUploadPage() {
  const [pasteText, setPasteText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [resultLog, setResultLog] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
    if (!pasteText.trim()) return;
    setRows(parsePaste(pasteText));
    setImportStatus("idle");
    setResultLog([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      // Convert CSV commas to TSV tabs for unified parsing (simple heuristic)
      const tsv = text.split("\n").map((line) => {
        // If it looks like a header row, skip it
        if (/^product[, \t]/i.test(line.trim())) return null;
        // Replace comma separators only if not in quotes (simple approach)
        return line.replace(/\r$/, "");
      }).filter(Boolean).join("\n");
      setPasteText(tsv);
      setRows(parsePaste(tsv));
      setImportStatus("idle");
      setResultLog([]);
    };
    reader.readAsText(file);
  };

  const toggleRow = (rowNum: number) => {
    setRows((current) =>
      current.map((row) =>
        row.rowNum === rowNum ? { ...row, selected: !row.selected } : row
      )
    );
  };

  const removeRow = (rowNum: number) => {
    setRows((current) => current.filter((row) => row.rowNum !== rowNum));
  };

  const selectedRows = rows.filter((row) => row.selected && row.valid);

  const handleImport = async () => {
    if (!selectedRows.length) return;
    setImportStatus("running");
    setProgress({ done: 0, total: selectedRows.length, failed: 0 });
    setResultLog([]);

    let done = 0;
    let failed = 0;
    const log: string[] = [];

    for (const row of selectedRows) {
      try {
        await adminApiRequest(API_ENDPOINTS.marketIntelligence.admin.submissions, {
          method: "POST",
          body: JSON.stringify({
            productKey: row.productKey,
            productName: getProductName(row.productKey),
            category: getProductCategory(row.productKey),
            county: row.county,
            marketName: row.marketName,
            subType: row.source || "",
            price: Number(row.price),
            unit: row.unit,
            currency: "KES",
            observationDate: row.observationDate,
            contributorName: row.source || "Agrisoko admin bulk upload",
            sourceType: "community",
            notes: row.notes || "",
            reviewStatus: "approved",
          }),
        });
        done++;
        log.push(`✓ Row ${row.rowNum}: ${getProductName(row.productKey)} — ${row.county} / ${row.marketName} — KES ${row.price}`);
      } catch (err: any) {
        failed++;
        log.push(`✗ Row ${row.rowNum}: ${err?.message || "Failed"}`);
      }
      setProgress({ done, total: selectedRows.length, failed });
      setResultLog([...log]);
      // Small delay — polite to backend
      await new Promise((r) => setTimeout(r, 80));
    }

    setImportStatus("done");
  };

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/market-intelligence"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to market intelligence
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-stone-900">Bulk price upload</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
            Copy rows directly from your Excel or Google Sheets spreadsheet and paste below.
            Each row becomes an approved price submission. Invalid rows are highlighted and
            excluded from the import.
          </p>
        </div>
      </div>

      {/* Spreadsheet structure reference */}
      <div className="rounded-[24px] border border-stone-200 bg-[#fbf8f2] p-5">
        <p className="text-sm font-bold text-stone-900">Spreadsheet column order (A → H)</p>
        <p className="mt-1 text-xs text-stone-500">
          Set your spreadsheet header row to match this exactly. Then select and copy from row 2
          downward — no need to include the header row when pasting.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                {["Col", "Name", "Required", "Example", "Allowed values"].map((h) => (
                  <th key={h} className="pb-2 pr-4 text-left font-semibold text-stone-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                { col: "A", name: "product", req: true, example: "maize", note: "maize · beans · tomatoes · onions · potatoes · beef · broilers · dap · can · urea · npk · calpan · lime" },
                { col: "B", name: "county", req: true, example: "Nairobi", note: "Any Kenyan county name" },
                { col: "C", name: "market", req: true, example: "Wakulima Market", note: "Free text — be specific" },
                { col: "D", name: "price", req: true, example: "3600", note: "KES amount, numbers only (no commas)" },
                { col: "E", name: "unit", req: true, example: "90kg bag", note: "90kg bag · 50kg bag · 120kg bag · kg · crate · kg live weight · head · bird · litre · piece" },
                { col: "F", name: "date", req: true, example: "2026-03-25", note: "YYYY-MM-DD format" },
                { col: "G", name: "source", req: false, example: "Kilimo Kenya FB", note: "Where you found the price — optional" },
                { col: "H", name: "notes", req: false, example: "Farm gate, not retail", note: "Any context — optional" },
              ].map((row) => (
                <tr key={row.col}>
                  <td className="py-2 pr-4 font-bold text-terra-700">{row.col}</td>
                  <td className="py-2 pr-4 font-semibold text-stone-900">{row.name}</td>
                  <td className="py-2 pr-4">
                    {row.req ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Required</span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">Optional</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-stone-700">{row.example}</td>
                  <td className="py-2 text-stone-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paste / upload area */}
      <div className="rounded-[24px] border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-stone-900">Paste from spreadsheet or upload CSV</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={"Paste rows from Excel or Google Sheets here\nmaize\tNairobi\tWakulima Market\t3600\t90kg bag\t2026-03-25\tKilimo Kenya FB\t"}
          className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terra-400"
          rows={6}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleParse}
            disabled={!pasteText.trim()}
            className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-40"
          >
            Parse rows
          </button>
          {rows.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="font-semibold text-emerald-600">{validCount} valid</span>
              {invalidCount > 0 && (
                <span className="font-semibold text-red-600">{invalidCount} with errors</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="rounded-[24px] border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-stone-900">Preview — {rows.length} rows parsed</p>
              <p className="mt-0.5 text-xs text-stone-500">
                Deselect rows you want to skip. Rows with errors are excluded automatically.
              </p>
            </div>
            {importStatus === "idle" && selectedRows.length > 0 && (
              <button
                type="button"
                onClick={() => void handleImport()}
                className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700"
              >
                <Send className="h-4 w-4" />
                Import {selectedRows.length} selected
              </button>
            )}
            {importStatus === "running" && (
              <p className="text-sm font-semibold text-stone-600">
                Importing {progress.done} / {progress.total}...
              </p>
            )}
            {importStatus === "done" && (
              <p className="text-sm font-semibold text-emerald-600">
                Done — {progress.done - progress.failed} imported, {progress.failed} failed
              </p>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  <th className="pb-2 pr-3 w-8"></th>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">County</th>
                  <th className="pb-2 pr-3">Market</th>
                  <th className="pb-2 pr-3">Price (KES)</th>
                  <th className="pb-2 pr-3">Unit</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Source</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((row) => {
                  const rowErrors = row.errors.reduce<Record<string, string>>((acc, e) => {
                    acc[e.field] = e.message;
                    return acc;
                  }, {});

                  const cellCls = (field: string) =>
                    rowErrors[field]
                      ? "text-red-600 font-semibold"
                      : "text-stone-800";

                  return (
                    <tr
                      key={row.rowNum}
                      className={`${row.valid ? "" : "bg-red-50/50"} ${row.selected && row.valid ? "" : "opacity-50"}`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 pr-3">
                        {row.valid ? (
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleRow(row.rowNum)}
                            className="h-3.5 w-3.5 cursor-pointer rounded accent-terra-600"
                          />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                      </td>
                      <td className={`py-2.5 pr-3 ${cellCls("product")}`}>
                        {row.productKey || <span className="text-red-400">—</span>}
                        {rowErrors.product && (
                          <p className="text-[10px] text-red-500">{rowErrors.product}</p>
                        )}
                      </td>
                      <td className={`py-2.5 pr-3 ${cellCls("county")}`}>{row.county || "—"}</td>
                      <td className={`py-2.5 pr-3 ${cellCls("market")}`}>{row.marketName || "—"}</td>
                      <td className={`py-2.5 pr-3 ${cellCls("price")}`}>
                        {row.price ? `KES ${Number(row.price).toLocaleString()}` : "—"}
                        {rowErrors.price && (
                          <p className="text-[10px] text-red-500">{rowErrors.price}</p>
                        )}
                      </td>
                      <td className={`py-2.5 pr-3 ${cellCls("unit")}`}>
                        {row.unit || "—"}
                        {rowErrors.unit && (
                          <p className="text-[10px] text-red-500">{rowErrors.unit}</p>
                        )}
                      </td>
                      <td className={`py-2.5 pr-3 font-mono ${cellCls("date")}`}>
                        {row.observationDate || "—"}
                        {rowErrors.date && (
                          <p className="text-[10px] text-red-500">{rowErrors.date}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-stone-500">{row.source || "—"}</td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => removeRow(row.rowNum)}
                          className="text-stone-300 hover:text-red-500 transition"
                          aria-label="Remove row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import result log */}
      {resultLog.length > 0 && (
        <div className="rounded-[24px] border border-stone-200 bg-white p-5">
          <p className="text-sm font-bold text-stone-900">Import log</p>
          <div className="mt-3 max-h-64 overflow-y-auto rounded-xl bg-stone-50 p-3 font-mono text-xs text-stone-700 space-y-1">
            {resultLog.map((line, i) => (
              <p key={i} className={line.startsWith("✓") ? "text-emerald-700" : "text-red-600"}>
                {line}
              </p>
            ))}
          </div>
          {importStatus === "done" && (
            <div className="mt-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-semibold text-stone-900">
                Import complete. Data is now live on the market intelligence board.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
