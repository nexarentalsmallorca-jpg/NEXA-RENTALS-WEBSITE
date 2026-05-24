import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getNexaRouteById } from "@/lib/nexaRoutes";

export const runtime = "nodejs";

type SendRouteEmailBody = {
  customerName?: string;
  customerEmail?: string;
  routeId?: string;
  contractNumber?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropoffDate?: string;
  dropoffTime?: string;
};

function escapeHtml(value?: string | null) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildRouteEmailHtml({
  customerName,
  contractNumber,
  pickupDate,
  pickupTime,
  dropoffDate,
  dropoffTime,
  route,
}: {
  customerName: string;
  contractNumber: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  route: NonNullable<ReturnType<typeof getNexaRouteById>>;
}) {
  const safeName = escapeHtml(customerName || "there");
  const safeContract = escapeHtml(contractNumber);
  const safeRouteName = escapeHtml(route.name);
  const safeDescription = escapeHtml(route.description);
  const safeDistance = escapeHtml(route.distance || "Flexible route");
  const safeDuration = escapeHtml(route.duration || "Flexible duration");
  const safePickup = escapeHtml(`${pickupDate || "--"} ${pickupTime || ""}`.trim());
  const safeDropoff = escapeHtml(`${dropoffDate || "--"} ${dropoffTime || ""}`.trim());
  const safeMapUrl = escapeHtml(route.mapUrl);

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#080A10;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080A10;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#11131A;border:1px solid rgba(255,255,255,0.10);border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 10px;">
                <p style="margin:0 0 8px;color:#f59e0b;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">
                  NEXA RENTALS
                </p>
                <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;">
                  Your custom Mallorca route is ready 🛵
                </h1>
                <p style="margin:16px 0 0;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
                  Hi ${safeName}, thank you for choosing Nexa Rentals. We have prepared your selected route for your scooter rental.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px;">
                <div style="background:linear-gradient(135deg,rgba(249,115,22,0.18),rgba(14,165,233,0.14));border:1px solid rgba(255,255,255,0.12);border-radius:22px;padding:22px;">
                  <p style="margin:0;color:#fbbf24;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                    Selected Route
                  </p>
                  <h2 style="margin:8px 0 8px;color:#ffffff;font-size:24px;">
                    ${safeRouteName}
                  </h2>
                  <p style="margin:0;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
                    ${safeDescription}
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                    <tr>
                      <td style="padding:10px;background:rgba(255,255,255,0.06);border-radius:14px;color:rgba(255,255,255,0.78);font-size:14px;">
                        <strong style="color:#fff;">Distance:</strong> ${safeDistance}
                      </td>
                    </tr>
                    <tr>
                      <td style="height:8px;"></td>
                    </tr>
                    <tr>
                      <td style="padding:10px;background:rgba(255,255,255,0.06);border-radius:14px;color:rgba(255,255,255,0.78);font-size:14px;">
                        <strong style="color:#fff;">Duration:</strong> ${safeDuration}
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:22px;">
                    <a href="${safeMapUrl}" target="_blank" style="display:inline-block;background:#ffffff;color:#080A10;text-decoration:none;font-size:15px;font-weight:900;padding:15px 22px;border-radius:16px;">
                      Open route in Google Maps
                    </a>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 24px;">
                <div style="border:1px solid rgba(255,255,255,0.10);border-radius:20px;padding:18px;background:rgba(255,255,255,0.035);">
                  <p style="margin:0 0 10px;color:#f59e0b;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                    Booking details
                  </p>
                  <p style="margin:0 0 8px;color:rgba(255,255,255,0.72);font-size:14px;">
                    <strong style="color:#fff;">Contract:</strong> ${safeContract || "--"}
                  </p>
                  <p style="margin:0 0 8px;color:rgba(255,255,255,0.72);font-size:14px;">
                    <strong style="color:#fff;">Pickup:</strong> ${safePickup}
                  </p>
                  <p style="margin:0;color:rgba(255,255,255,0.72);font-size:14px;">
                    <strong style="color:#fff;">Return:</strong> ${safeDropoff}
                  </p>
                </div>

                <p style="margin:18px 0 0;color:rgba(255,255,255,0.55);font-size:13px;line-height:1.7;">
                  Please ride safely, respect local traffic rules, wear your helmet, and park only where scooters are allowed.
                </p>

                <p style="margin:18px 0 0;color:#ffffff;font-size:14px;font-weight:800;">
                  See you soon,<br />
                  NEXA Rentals Team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.NEXA_ROUTE_EMAIL_FROM || "NEXA Rentals <onboarding@resend.dev>";
    const replyTo = process.env.NEXA_ROUTE_REPLY_TO || undefined;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY env variable." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SendRouteEmailBody;

    const customerEmail = String(body.customerEmail || "").trim();
    const routeId = String(body.routeId || "").trim();

    if (!customerEmail) {
      return NextResponse.json(
        { ok: false, error: "Missing customer email." },
        { status: 400 }
      );
    }

    if (!routeId) {
      return NextResponse.json(
        { ok: false, error: "Missing routeId." },
        { status: 400 }
      );
    }

    const route = getNexaRouteById(routeId);

    if (!route) {
      return NextResponse.json(
        { ok: false, error: "Selected route was not found." },
        { status: 404 }
      );
    }

    if (!route.mapUrl || route.mapUrl.includes("PASTE_GOOGLE_MAPS")) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This route does not have a real Google Maps link yet. Update lib/nexaRoutes.ts.",
        },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const customerName = String(body.customerName || "there").trim();
    const contractNumber = String(body.contractNumber || "").trim();

    const result = await resend.emails.send({
      from: fromEmail,
      to: [customerEmail],
      replyTo,
      subject: `Your Nexa Rentals route is ready — ${route.shortName}`,
      html: buildRouteEmailHtml({
        customerName,
        contractNumber,
        pickupDate: String(body.pickupDate || ""),
        pickupTime: String(body.pickupTime || ""),
        dropoffDate: String(body.dropoffDate || ""),
        dropoffTime: String(body.dropoffTime || ""),
        route,
      }),
    });

    if (result.error) {
      return NextResponse.json(
        { ok: false, error: result.error.message, result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      emailId: result.data?.id,
      routeId: route.id,
      routeName: route.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown route email error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}