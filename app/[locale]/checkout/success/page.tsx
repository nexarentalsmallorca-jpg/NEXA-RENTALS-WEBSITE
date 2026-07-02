import Link from "next/link";

type SearchValue = string | string[] | undefined;

type RawSearchParams = Promise<
  Record<string, SearchValue> & {
    paid?: SearchValue;
    amountPaid?: SearchValue;
    payNow?: SearchValue;
    total?: SearchValue;
    totalAmount?: SearchValue;
    rentalTotal?: SearchValue;
    pickupDate?: SearchValue;
    pickupTime?: SearchValue;
    dropoffDate?: SearchValue;
    dropoffTime?: SearchValue;
    customerName?: SearchValue;
    vehicleName?: SearchValue;
    assignedVehicleName?: SearchValue;
    vehicle?: SearchValue;
    plan?: SearchValue;
  }
>;

type RawParams = Promise<{
  locale?: string;
}>;

const MAPS_LINK = "https://maps.app.goo.gl/GhkgjNk72jRC1vus8";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getValue(value?: SearchValue) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getFirstValue(params: Record<string, SearchValue>, keys: string[]) {
  for (const key of keys) {
    const value = getValue(params[key]).trim();
    if (value) return value;
  }

  return "";
}

function getValueByKeySearch(
  params: Record<string, SearchValue>,
  mustInclude: string[],
  valueType: "date" | "time"
) {
  for (const [key, rawValue] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    const value = getValue(rawValue).trim();

    if (!value) continue;
    if (!mustInclude.every((part) => lowerKey.includes(part))) continue;

    if (valueType === "date" && extractDate(value)) return value;
    if (valueType === "time" && extractTime(value)) return value;
  }

  return "";
}

function formatMoney(value?: string) {
  const cleanValue = value?.replace("€", "").replace(",", ".").trim() || "";
  const num = Number(cleanValue);

  if (!cleanValue || Number.isNaN(num)) return "";
  return `€${num.toFixed(2)}`;
}

function extractDate(value?: string) {
  if (!value) return "";

  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    if (year && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day} ${MONTHS[month - 1]} ${year}`;
    }
  }

  const slashMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = slashMatch[3];

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day} ${MONTHS[month - 1]} ${year}`;
    }
  }

  return "";
}

function extractTime(value?: string) {
  if (!value) return "";

  const timeMatch = value.match(/(\d{1,2}):(\d{2})(?:\s?(AM|PM|am|pm))?/);
  if (!timeMatch) return "";

  const hour = timeMatch[1];
  const minute = timeMatch[2];
  const suffix = timeMatch[3];

  return suffix ? `${hour}:${minute} ${suffix.toUpperCase()}` : `${hour}:${minute}`;
}

function joinDateTime(date?: string, time?: string) {
  if (date && time) return `${date} · ${time}`;
  if (date) return date;
  if (time) return time;
  return "";
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 border-b border-black/10 py-2 last:border-b-0 sm:grid-cols-[104px_1fr]">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/38">
        {label}
      </p>
      <p className="text-[12px] font-black leading-5 text-black sm:text-[13px]">
        {value}
      </p>
    </div>
  );
}

function PickupLine({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#f4f4f1] text-[10px] font-black text-black">
        {number}
      </div>

      <div>
        <p className="text-[12px] font-black leading-5 text-black">{title}</p>
        <p className="text-[11px] font-semibold leading-5 text-black/55">
          {text}
        </p>
      </div>
    </div>
  );
}

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: RawParams;
  searchParams: RawSearchParams;
}) {
  const routeParams = await params;
  const query = await searchParams;

  const locale = routeParams.locale || "en";

  const customerName = getFirstValue(query, ["customerName", "name"]);

  const vehicleName = getFirstValue(query, [
    "vehicleName",
    "assignedVehicleName",
    "vehicle",
    "scooter",
    "model",
  ]);

  const plan = getFirstValue(query, [
    "plan",
    "rentalPlan",
    "duration",
    "selectedPlan",
  ]);

  const amountPaid = formatMoney(
    getFirstValue(query, [
      "paid",
      "amountPaid",
      "payNow",
      "total",
      "totalAmount",
      "rentalTotal",
      "price",
      "fullAmount",
      "amount",
    ])
  );

  const pickupDate =
    extractDate(
      getFirstValue(query, [
        "pickupDate",
        "pickUpDate",
        "pickupdate",
        "pickup_date",
        "startDate",
        "start_date",
        "fromDate",
        "dateFrom",
      ])
    ) || extractDate(getValueByKeySearch(query, ["pickup", "date"], "date"));

  const pickupTime =
    extractTime(
      getFirstValue(query, [
        "pickupTime",
        "pickUpTime",
        "pickuptime",
        "pickup_time",
        "startTime",
        "start_time",
        "fromTime",
        "timeFrom",
      ])
    ) || extractTime(getValueByKeySearch(query, ["pickup", "time"], "time"));

  const dropoffDate =
    extractDate(
      getFirstValue(query, [
        "dropoffDate",
        "dropOffDate",
        "dropoffdate",
        "dropoff_date",
        "returnDate",
        "return_date",
        "endDate",
        "end_date",
        "toDate",
        "dateTo",
      ])
    ) || extractDate(getValueByKeySearch(query, ["drop", "date"], "date"));

  const dropoffTime =
    extractTime(
      getFirstValue(query, [
        "dropoffTime",
        "dropOffTime",
        "dropofftime",
        "dropoff_time",
        "returnTime",
        "return_time",
        "endTime",
        "end_time",
        "toTime",
        "timeTo",
      ])
    ) || extractTime(getValueByKeySearch(query, ["drop", "time"], "time"));

  const pickup = joinDateTime(pickupDate, pickupTime);
  const dropoff = joinDateTime(dropoffDate, dropoffTime);

  const hasAnyBookingDetail =
    customerName || vehicleName || pickup || dropoff || plan || amountPaid;

  return (
    <main className="min-h-screen bg-[#f4f4f1] px-4 py-6 font-sans text-black">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-3xl items-center justify-center">
        <div className="w-full max-w-[740px] rounded-[12px] border border-black/10 bg-white px-5 py-5 shadow-[0_24px_90px_rgba(0,0,0,0.12)] sm:px-7 sm:py-6">
          <div className="text-center">
            <div className="text-[52px] font-black leading-none text-[#149447] sm:text-[60px]">
              ✓
            </div>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.28em] text-black/40">
              Payment received
            </p>

            <h1 className="mt-2 font-sans text-3xl font-black leading-none tracking-[-0.055em] text-black sm:text-4xl">
              Booking confirmed
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-[12px] font-semibold leading-5 text-black/55 sm:text-[13px]">
              Your payment was received and your booking is now confirmed.
            </p>
          </div>

          <div className="my-4 h-px bg-black/10" />

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
                Booking details
              </p>

              <h2 className="mt-1 font-sans text-lg font-black tracking-[-0.035em] text-black">
                Your ride is reserved
              </h2>

              <div className="mt-3">
                {hasAnyBookingDetail ? (
                  <>
                    <DetailRow label="Vehicle" value={vehicleName} />
                    <DetailRow label="Customer" value={customerName} />
                    <DetailRow label="Pickup" value={pickup} />
                    <DetailRow label="Return" value={dropoff} />
                    <DetailRow label="Plan" value={plan} />
                    <DetailRow label="Paid" value={amountPaid} />
                  </>
                ) : (
                  <p className="rounded-[10px] border border-black/10 bg-[#fafafa] px-4 py-3 text-[12px] font-semibold leading-5 text-black/60">
                    Your booking is confirmed. The full booking details are saved with your confirmation email.
                  </p>
                )}
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
                  Pickup location
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] font-black leading-5 text-black">
                    NEXA Rentals, Magaluf
                  </p>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-[9px] bg-black px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#222]"
                  >
                    Open location
                  </a>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
                Bring these at pickup
              </p>

              <h2 className="mt-1 font-sans text-lg font-black tracking-[-0.035em] text-black">
                Pickup notes
              </h2>

              <div className="mt-3 space-y-3.5">
                <PickupLine
                  number="1"
                  title="Passport / ID"
                  text="Bring your original passport or national ID."
                />

                <PickupLine
                  number="2"
                  title="Valid driving licence"
                  text="A, A1, A2 or B licence held for 3+ years."
                />

                <PickupLine
                  number="3"
                  title="€150 refundable deposit"
                  text="Handled at pickup by cash or card."
                />
              </div>

              <p className="mt-4 rounded-[10px] border border-black/10 bg-[#fafafa] px-4 py-3 text-[11px] font-semibold leading-5 text-black/58">
                Please arrive at your pickup time so we can prepare your scooter and make the handover fast.
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-black/10 pt-3 text-center">
            <Link
              href={`/${locale}/home`}
              className="text-[11px] font-black uppercase tracking-[0.14em] text-black/40 transition hover:text-black"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}