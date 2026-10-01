import { NextRequest, NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";
import { maintenanceTypeLabel } from "@/lib/fleetMaintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 48;
const RIGHT = 48;
const TOP = 48;
const BOTTOM = 48;

function clean(value: unknown): string {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string | null): string {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Madrid",
  }).format(date);
}

function formatKm(value: unknown): string {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0 km";
  }

  return `${number.toLocaleString("en-GB")} km`;
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = clean(text).split(" ").filter(Boolean);

  if (!words.length) {
    return [""];
  }

  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) {
        lines.push(line);
      }

      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { code } = await context.params;

    const normalizedCode = normalizeVehicleCode(code);
    const vehicle = findVehicleByCodigo(normalizedCode);

    if (!vehicle) {
      return NextResponse.json(
        {
          ok: false,
          error: "Vehicle not found.",
        },
        {
          status: 404,
        }
      );
    }

    const [
      stateResult,
      maintenanceResult,
      inspectionsResult,
      issuesResult,
      activityResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .maybeSingle(),

      supabaseAdmin
        .from("nexa_fleet_maintenance_records")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("performed_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("nexa_fleet_inspections")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("inspected_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("nexa_fleet_issues")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("opened_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("nexa_fleet_activity_log")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (stateResult.error) {
      throw stateResult.error;
    }

    if (maintenanceResult.error) {
      throw maintenanceResult.error;
    }

    if (inspectionsResult.error) {
      throw inspectionsResult.error;
    }

    if (issuesResult.error) {
      throw issuesResult.error;
    }

    if (activityResult.error) {
      throw activityResult.error;
    }

    const state = stateResult.data;
    const maintenance = maintenanceResult.data ?? [];
    const inspections = inspectionsResult.data ?? [];
    const issues = issuesResult.data ?? [];
    const activity = activityResult.data ?? [];

    const inspectionIds = inspections
      .map((inspection) => inspection.id)
      .filter(Boolean);

    let inspectionItems: any[] = [];

    if (inspectionIds.length > 0) {
      const result = await supabaseAdmin
        .from("nexa_fleet_inspection_items")
        .select("*")
        .in("inspection_id", inspectionIds)
        .order("created_at", {
          ascending: true,
        });

      if (result.error) {
        throw result.error;
      }

      inspectionItems = result.data ?? [];
    }

    const pdf = await PDFDocument.create();

    const regular = await pdf.embedFont(
      StandardFonts.Helvetica
    );

    const bold = await pdf.embedFont(
      StandardFonts.HelveticaBold
    );

    let page: PDFPage = pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

    let y = PAGE_HEIGHT - TOP;

    function addPage() {
      page = pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

      y = PAGE_HEIGHT - TOP;

      page.drawText("NEXA RENTALS", {
        x: LEFT,
        y,
        size: 10,
        font: bold,
        color: rgb(0.95, 0.42, 0.08),
      });

      y -= 28;
    }

    function ensureSpace(height: number) {
      if (y - height < BOTTOM) {
        addPage();
      }
    }

    function heading(text: string) {
      ensureSpace(45);

      y -= 10;

      page.drawText(clean(text).toUpperCase(), {
        x: LEFT,
        y,
        size: 12,
        font: bold,
        color: rgb(0.95, 0.42, 0.08),
      });

      y -= 9;

      page.drawLine({
        start: {
          x: LEFT,
          y,
        },
        end: {
          x: PAGE_WIDTH - RIGHT,
          y,
        },
        thickness: 0.7,
        color: rgb(0.82, 0.82, 0.82),
      });

      y -= 20;
    }

    function textLine(
      label: string,
      value: unknown
    ) {
      ensureSpace(20);

      page.drawText(`${clean(label)}:`, {
        x: LEFT,
        y,
        size: 9,
        font: bold,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(clean(value), {
        x: LEFT + 120,
        y,
        size: 9,
        font: regular,
        color: rgb(0.1, 0.1, 0.1),
      });

      y -= 17;
    }

    function paragraph(text: string) {
      const lines = wrapText(
        text,
        regular,
        8.5,
        PAGE_WIDTH - LEFT - RIGHT
      );

      ensureSpace(lines.length * 12 + 8);

      for (const line of lines) {
        page.drawText(line, {
          x: LEFT,
          y,
          size: 8.5,
          font: regular,
          color: rgb(0.2, 0.2, 0.2),
        });

        y -= 12;
      }

      y -= 5;
    }

    function record(
      title: string,
      subtitle: string,
      details: string[] = []
    ) {
      const allLines = details.flatMap((detail) =>
        wrapText(
          detail,
          regular,
          8,
          PAGE_WIDTH - LEFT - RIGHT - 24
        )
      );

      const height = 46 + allLines.length * 11;

      ensureSpace(height + 10);

      page.drawRectangle({
        x: LEFT,
        y: y - height + 10,
        width: PAGE_WIDTH - LEFT - RIGHT,
        height,
        borderWidth: 0.7,
        borderColor: rgb(0.85, 0.85, 0.85),
        color: rgb(0.98, 0.98, 0.98),
      });

      let innerY = y - 7;

      page.drawText(clean(title), {
        x: LEFT + 12,
        y: innerY,
        size: 10,
        font: bold,
        color: rgb(0.08, 0.08, 0.08),
      });

      innerY -= 16;

      page.drawText(clean(subtitle), {
        x: LEFT + 12,
        y: innerY,
        size: 8,
        font: regular,
        color: rgb(0.42, 0.42, 0.42),
      });

      innerY -= 17;

      for (const line of allLines) {
        page.drawText(line, {
          x: LEFT + 12,
          y: innerY,
          size: 8,
          font: regular,
          color: rgb(0.18, 0.18, 0.18),
        });

        innerY -= 11;
      }

      y -= height + 10;
    }

    // HEADER
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 165,
      width: PAGE_WIDTH,
      height: 165,
      color: rgb(0.06, 0.06, 0.07),
    });

    page.drawText("NEXA RENTALS", {
      x: LEFT,
      y: PAGE_HEIGHT - 55,
      size: 12,
      font: bold,
      color: rgb(0.95, 0.42, 0.08),
    });

    page.drawText("VEHICLE MAINTENANCE HISTORY", {
      x: LEFT,
      y: PAGE_HEIGHT - 87,
      size: 21,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText(
      vehicle.codigo + " - " + vehicle.matricula,
      {
        x: LEFT,
        y: PAGE_HEIGHT - 119,
        size: 15,
        font: bold,
        color: rgb(1, 1, 1),
      }
    );

    page.drawText(
      clean(vehicle.marca + " " + vehicle.modelo),
      {
        x: LEFT,
        y: PAGE_HEIGHT - 142,
        size: 10,
        font: regular,
        color: rgb(0.75, 0.75, 0.75),
      }
    );

    y = PAGE_HEIGHT - 200;

    heading("Vehicle Overview");

    textLine(
      "Vehicle code",
      vehicle.codigo
    );

    textLine(
      "Registration",
      vehicle.matricula
    );

    textLine(
      "Make / Model",
      vehicle.marca + " " + vehicle.modelo
    );

    textLine(
      "Year",
      vehicle.ano ?? "Not recorded"
    );

    textLine(
      "VIN / Chassis",
      vehicle.bastidor ?? "Not recorded"
    );

    textLine(
      "Current mileage",
      formatKm(state?.current_km)
    );

    textLine(
      "Road ready",
      state?.road_ready ? "YES" : "NO"
    );

    textLine(
      "Internal status",
      clean(
        state?.internal_status ?? "healthy"
      ).replaceAll("_", " ")
    );

    textLine(
      "Last inspection",
      formatDate(state?.last_inspection_at)
    );

    textLine(
      "Last service",
      formatDate(state?.last_service_at)
    );

    heading("Service History");

    if (maintenance.length === 0) {
      paragraph(
        "No maintenance records have been recorded yet."
      );
    }

    for (const item of maintenance) {
      const details: string[] = [];

      if (
        item.next_due_km !== null &&
        item.next_due_km !== undefined
      ) {
        details.push(
          "Next due: " +
            formatKm(item.next_due_km)
        );
      }

      if (item.notes) {
        details.push(
          "Notes: " + clean(item.notes)
        );
      }

      if (
        item.cost !== null &&
        item.cost !== undefined
      ) {
        details.push(
          "Cost: " +
            Number(item.cost).toFixed(2) +
            " EUR"
        );
      }

      if (item.performed_by) {
        details.push(
          "Performed by: " +
            clean(item.performed_by)
        );
      }

      record(
        maintenanceTypeLabel(
          item.maintenance_type
        ),
        formatDate(item.performed_at) +
          " - " +
          formatKm(item.performed_km),
        details
      );
    }

    heading("Technical Inspections");

    if (inspections.length === 0) {
      paragraph(
        "No technical inspections have been recorded yet."
      );
    }

    for (const inspection of inspections) {
      const details: string[] = [];

      details.push(
        "Result: " +
          clean(
            inspection.result
          ).toUpperCase()
      );

      if (inspection.inspected_by) {
        details.push(
          "Inspector: " +
            clean(
              inspection.inspected_by
            )
        );
      }

      if (inspection.internal_notes) {
        details.push(
          "Notes: " +
            clean(
              inspection.internal_notes
            )
        );
      }

      const items = inspectionItems.filter(
        (item) =>
          item.inspection_id ===
          inspection.id
      );

      for (const item of items) {
        let detail =
          clean(item.item_label) +
          ": " +
          clean(item.status).toUpperCase();

        if (
          item.value_number !== null &&
          item.value_number !== undefined
        ) {
          detail +=
            " - " +
            item.value_number +
            (item.unit
              ? " " + clean(item.unit)
              : "");
        }

        if (item.value_text) {
          detail +=
            " - " +
            clean(item.value_text);
        }

        if (item.internal_note) {
          detail +=
            " - " +
            clean(item.internal_note);
        }

        details.push(detail);
      }

      record(
        "Technical Inspection",
        formatDate(
          inspection.inspected_at
        ) +
          " - " +
          formatKm(
            inspection.odometer_km
          ),
        details
      );
    }

    heading("Issues and Repairs");

    if (issues.length === 0) {
      paragraph(
        "No issues have been recorded for this vehicle."
      );
    }

    for (const issue of issues) {
      const details: string[] = [];

      details.push(
        "Severity: " +
          clean(
            issue.severity
          ).replaceAll("_", " ")
      );

      details.push(
        "Status: " +
          clean(
            issue.status
          ).replaceAll("_", " ")
      );

      details.push(
        "Description: " +
          clean(issue.description)
      );

      if (issue.reported_by) {
        details.push(
          "Reported by: " +
            clean(issue.reported_by)
        );
      }

      if (issue.resolved_at) {
        details.push(
          "Resolved: " +
            formatDate(
              issue.resolved_at
            )
        );
      }

      if (issue.resolution_notes) {
        details.push(
          "Resolution: " +
            clean(
              issue.resolution_notes
            )
        );
      }

      record(
        clean(
          issue.category
        ).replaceAll("_", " ") +
          " issue",
        formatDate(issue.opened_at),
        details
      );
    }

    heading("Activity History");

    if (activity.length === 0) {
      paragraph(
        "No system activity has been recorded yet."
      );
    }

    for (const item of activity) {
      const details: string[] = [];

      if (item.entity_type) {
        details.push(
          "Record type: " +
            clean(
              item.entity_type
            ).replaceAll("_", " ")
        );
      }

      if (item.performed_by) {
        details.push(
          "Performed by: " +
            clean(
              item.performed_by
            )
        );
      }

      if (
        item.old_value?.current_km !== undefined &&
        item.new_value?.current_km !== undefined &&
        item.old_value.current_km !==
          item.new_value.current_km
      ) {
        details.push(
          "Mileage: " +
            item.old_value.current_km +
            " km -> " +
            item.new_value.current_km +
            " km"
        );
      }

      if (
        item.old_value?.road_ready !== undefined &&
        item.new_value?.road_ready !== undefined &&
        item.old_value.road_ready !==
          item.new_value.road_ready
      ) {
        details.push(
          "Road ready: " +
            (item.old_value.road_ready
              ? "YES"
              : "NO") +
            " -> " +
            (item.new_value.road_ready
              ? "YES"
              : "NO")
        );
      }

      record(
        clean(
          item.action_type ?? "Activity"
        ).replaceAll("_", " "),
        formatDate(item.created_at),
        details
      );
    }

    heading("Record Statement");

    paragraph(
      "This PDF was generated from the NEXA Rentals fleet maintenance database and contains the stored service, inspection, issue and activity history for this vehicle."
    );

    paragraph(
      "Customer QR scan analytics are not included in the mechanical maintenance history."
    );

    const pages = pdf.getPages();

    pages.forEach(
      (currentPage, index) => {
        currentPage.drawLine({
          start: {
            x: LEFT,
            y: 31,
          },
          end: {
            x: PAGE_WIDTH - RIGHT,
            y: 31,
          },
          thickness: 0.5,
          color: rgb(0.82, 0.82, 0.82),
        });

        currentPage.drawText(
          "NEXA Rentals - Fleet Maintenance Record",
          {
            x: LEFT,
            y: 17,
            size: 7,
            font: regular,
            color: rgb(0.45, 0.45, 0.45),
          }
        );

        currentPage.drawText(
          "Page " + (index + 1),
          {
            x: PAGE_WIDTH - RIGHT - 35,
            y: 17,
            size: 7,
            font: regular,
            color: rgb(0.45, 0.45, 0.45),
          }
        );
      }
    );

    const pdfBytes = await pdf.save();

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const filename =
      "NEXA-" +
      vehicle.codigo +
      "-Maintenance-History-" +
      today +
      ".pdf";

    return new NextResponse(
      new Uint8Array(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'attachment; filename="' +
            filename +
            '"',

          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Fleet PDF history error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate maintenance PDF.",
      },
      {
        status: 500,
      }
    );
  }
}