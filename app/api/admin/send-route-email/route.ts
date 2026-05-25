import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getNexaRouteById } from "@/lib/nexaRoutes";

export const runtime = "nodejs";

type SendRouteEmailBody = {
  customerName?: string;
  customerEmail?: string;
  routeId?: string;
  routeIds?: string[];
  contractNumber?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropoffDate?: string;
  dropoffTime?: string;
};

type NexaEmailRoute = NonNullable<ReturnType<typeof getNexaRouteById>>;

const NEXA_LOGO_URL = "https://www.nexarentals.es/images/reallogo.png";

function escapeHtml(value?: string | null) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeRouteIds(body: SendRouteEmailBody) {
  const idsFromArray = Array.isArray(body.routeIds)
    ? body.routeIds
        .map((routeId) => String(routeId || "").trim())
        .filter(Boolean)
    : [];

  const ids =
    idsFromArray.length > 0 ? idsFromArray : [String(body.routeId || "").trim()];

  return Array.from(new Set(ids.filter(Boolean)));
}

function buildRouteCards(routes: NexaEmailRoute[]) {
  return routes
    .map((route, index) => {
      const safeRouteName = escapeHtml(route.name);
      const safeDescription = escapeHtml(route.description);
      const safeDistance = escapeHtml(route.distance || "Flexible route");
      const safeDuration = escapeHtml(route.duration || "Flexible duration");
      const safeMapUrl = escapeHtml(route.mapUrl);

      return `
        <tr>
          <td style="padding:${index === 0 ? "0" : "14px 0 0"};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,rgba(249,115,22,0.18),rgba(255,255,255,0.045));border:1px solid rgba(249,115,22,0.22);border-radius:24px;overflow:hidden;">
              <tr>
                <td style="padding:22px;">
                  <p style="margin:0;color:#fb923c;font-size:11px;font-weight:900;letter-spacing:2.4px;text-transform:uppercase;">
                    Selected Route ${index + 1}
                  </p>

                  <h2 style="margin:8px 0 8px;color:#ffffff;font-size:22px;line-height:1.2;">
                    ${safeRouteName}
                  </h2>

                  <p style="margin:0;color:rgba(255,255,255,0.70);font-size:14px;line-height:1.7;">
                    ${safeDescription}
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                    <tr>
                      <td style="padding:10px 12px;background:rgba(255,255,255,0.06);border-radius:14px;color:rgba(255,255,255,0.78);font-size:13px;line-height:1.4;">
                        <strong style="color:#fff;">Distance:</strong> ${safeDistance}
                      </td>
                    </tr>
                    <tr><td style="height:8px;"></td></tr>
                    <tr>
                      <td style="padding:10px 12px;background:rgba(255,255,255,0.06);border-radius:14px;color:rgba(255,255,255,0.78);font-size:13px;line-height:1.4;">
                        <strong style="color:#fff;">Duration:</strong> ${safeDuration}
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:18px;">
                    <a href="${safeMapUrl}" target="_blank" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:14px 20px;border-radius:16px;box-shadow:0 14px 34px rgba(249,115,22,0.26);">
                      Open Route in Google Maps
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");
}

function buildRouteEmailHtml({
  customerName,
  contractNumber,
  pickupDate,
  pickupTime,
  dropoffDate,
  dropoffTime,
  routes,
}: {
  customerName: string;
  contractNumber: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  routes: NexaEmailRoute[];
}) {
  const safeName = escapeHtml(customerName || "there");
  const safeContract = escapeHtml(contractNumber);
  const safePickup = escapeHtml(
    `${pickupDate || "--"} ${pickupTime || ""}`.trim()
  );
  const safeDropoff = escapeHtml(
    `${dropoffDate || "--"} ${dropoffTime || ""}`.trim()
  );
  const safeLogoUrl = escapeHtml(NEXA_LOGO_URL);
  const selectedRoutesTitle =
    routes.length === 1 ? "Your selected route" : "Your selected routes";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#07080D;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07080D;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#11131A;border:1px solid rgba(255,255,255,0.10);border-radius:30px;overflow:hidden;box-shadow:0 28px 90px rgba(0,0,0,0.45);">
            <tr>
              <td style="padding:28px 28px 18px;background:linear-gradient(135deg,rgba(249,115,22,0.18),rgba(17,19,26,0.96) 48%,rgba(14,165,233,0.10));">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="left">
                      <img src="${safeLogoUrl}" alt="NEXA Rentals" style="display:block;width:118px;max-width:118px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;border:1px solid rgba(249,115,22,0.30);background:rgba(249,115,22,0.12);color:#fed7aa;border-radius:999px;padding:8px 12px;font-size:10px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;">
                        Premium Scooter Routes
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 8px;color:#fb923c;font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">
                  NEXA Rentals Mallorca
                </p>

                <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.12;letter-spacing:-0.4px;">
                  ${selectedRoutesTitle} for your ride
                </h1>

                <p style="margin:16px 0 0;color:rgba(255,255,255,0.74);font-size:15px;line-height:1.75;">
                  Hi ${safeName}, thank you for choosing NEXA Rentals. We have prepared your selected route${routes.length === 1 ? "" : "s"} for your scooter rental.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px 8px;">
                <p style="margin:0 0 14px;color:#ffffff;font-size:16px;font-weight:900;">
                  ${selectedRoutesTitle}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${buildRouteCards(routes)}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 26px;">
                <div style="border:1px solid rgba(255,255,255,0.10);border-radius:22px;padding:18px;background:rgba(255,255,255,0.035);">
                  <p style="margin:0 0 10px;color:#fb923c;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
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

                <p style="margin:18px 0 0;color:#ffffff;font-size:14px;font-weight:900;line-height:1.6;">
                  See you soon,<br />
                  NEXA Rentals Team
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:16px 0 0;color:rgba(255,255,255,0.35);font-size:11px;line-height:1.6;">
            NEXA Rentals · Magaluf, Mallorca
          </p>
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
      process.env.NEXA_ROUTE_EMAIL_FROM ||
      "NEXA Rentals <onboarding@resend.dev>";
    const replyTo = process.env.NEXA_ROUTE_REPLY_TO || undefined;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY env variable." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SendRouteEmailBody;

    const customerEmail = String(body.customerEmail || "").trim();
    const routeIds = normalizeRouteIds(body);

    if (!customerEmail) {
      return NextResponse.json(
        { ok: false, error: "Missing customer email." },
        { status: 400 }
      );
    }

    if (routeIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Missing routeIds." },
        { status: 400 }
      );
    }

    const routes = routeIds
      .map((routeId) => getNexaRouteById(routeId))
      .filter(Boolean) as NexaEmailRoute[];

    if (routes.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Selected routes were not found." },
        { status: 404 }
      );
    }

    const routeWithoutMap = routes.find(
      (route) => !route.mapUrl || route.mapUrl.includes("PASTE_GOOGLE_MAPS")
    );

    if (routeWithoutMap) {
      return NextResponse.json(
        {
          ok: false,
          error: `${routeWithoutMap.name} does not have a real Google Maps link yet. Update lib/nexaRoutes.ts.`,
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
      subject:
        routes.length === 1
          ? `Your NEXA Rentals route is ready — ${routes[0].shortName}`
          : `Your NEXA Rentals routes are ready — ${routes.length} routes`,
      html: buildRouteEmailHtml({
        customerName,
        contractNumber,
        pickupDate: String(body.pickupDate || ""),
        pickupTime: String(body.pickupTime || ""),
        dropoffDate: String(body.dropoffDate || ""),
        dropoffTime: String(body.dropoffTime || ""),
        routes,
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
      routeIds: routes.map((route) => route.id),
      routeNames: routes.map((route) => route.name),
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