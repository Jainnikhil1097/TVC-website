import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { getGiftCity } from "@/lib/cms";
import { formatDate } from "@/lib/utils";

type Disclosures = NonNullable<Awaited<ReturnType<typeof getGiftCity>>["disclosures"]>;

/** Indian mobile/landline numbers written as 10 digits become "+91 98299 99540" with a tel: link. */
function Phone({ value }: { value: string }) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return <>{value || "–"}</>;
  return (
    <a href={`tel:+91${digits}`} className="underline decoration-ink/20 underline-offset-4 hover:text-teal-ink">
      {`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`}
    </a>
  );
}

function Email({ value }: { value: string }) {
  if (!/@/.test(value)) return <>{value || "–"}</>;
  return (
    <a href={`mailto:${value}`} className="break-all underline decoration-ink/20 underline-offset-4 hover:text-teal-ink">
      {value}
    </a>
  );
}

/** "Address / email" cells: an email address becomes a link; anything else is plain text. */
const addressOrEmail = (value: string) => (/^\S+@\S+\.\S+$/.test(value) ? <Email value={value} /> : value || "–");

function Block({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-ink/10 pt-8 first:border-t-0 first:pt-0" aria-labelledby={`ifsca-${n}`}>
      <h3 id={`ifsca-${n}`} className="font-display text-xl font-bold text-ink">
        <span className="text-teal-ink">{n}.</span> {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Two-column "Particular / Details" table. */
function Pairs({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-ink/10 border-y border-ink/10 text-[0.95rem]">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,17rem)_1fr] sm:gap-6">
          <dt className="text-ink/60">{label}</dt>
          <dd className="text-ink">{value || "–"}</dd>
        </div>
      ))}
    </dl>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[36rem] border-y border-ink/10 text-left text-[0.95rem]">
        <thead>
          <tr className="border-b border-ink/10 text-ink/60">
            {head.map((h) => (
              <th key={h} scope="col" className="py-3 pr-6 font-normal last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10 align-top text-ink">
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((c, j) => (
                <td key={j} className="py-3 pr-6 last:pr-0">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The GIFT City fund manager's IFSCA disclosures (Annexure 1), in its eight numbered
 * parts. Everything comes from CMS → GIFT City page → IFSCA disclosures, including the
 * quarterly complaints table, so compliance can keep it current without a developer.
 */
export function IfscaDisclosures({ d }: { d: Disclosures }) {
  const complaintsHead = ["Quarter ended", "Pending at start of quarter", "Received during quarter", "Disposed of during quarter", "Pending at end of quarter"];
  return (
    <section id="disclosures" aria-labelledby="disclosures-title" className="container-site mt-16 scroll-mt-24 sm:mt-24">
      <div className="rounded-3xl bg-white p-6 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-teal-ink">Regulatory disclosures</p>
            <h2 id="disclosures-title" className="display mt-4 text-3xl sm:text-4xl">
              IFSCA disclosures
            </h2>
          </div>
          {d.asOf && <p className="text-sm text-ink/55">Last updated {formatDate(d.asOf.slice(0, 10))}</p>}
        </div>

        <div className="mt-10 space-y-10">
          <Block n="1" title="FME profile">
            <Pairs
              rows={[
                ["Name of the FME", d.fme.name],
                ["Legal form", d.fme.legalForm],
                ["Category of registration", d.fme.category],
                ["IFSCA registration number", d.fme.registrationNumber],
                ["Date of registration", d.fme.registrationDate],
              ]}
            />
          </Block>

          <Block n="2" title="Contact details">
            <Pairs
              rows={[
                ["Registered office address in the IFSC", d.contact.registeredOffice],
                ["Correspondence address", d.contact.correspondence],
                ["Telephone number", <Phone key="t" value={d.contact.telephone} />],
                ["Email address", <Email key="e" value={d.contact.email} />],
              ]}
            />
          </Block>

          {d.funds.length > 0 && (
            <Block n="3" title={d.funds.length > 1 ? "Funds managed from the IFSC" : "Fund managed from the IFSC"}>
              <div className="space-y-6">
                {d.funds.map((f) => (
                  <Pairs
                    key={f.name}
                    rows={[
                      ["Name of the fund", f.name],
                      ["IFSCA registration number", f.registrationNumber],
                      ["Category / type", f.category],
                    ]}
                  />
                ))}
              </div>
            </Block>
          )}

          {d.serviceProviders.length > 0 && (
            <Block n="4" title="Service providers">
              <Table
                head={["Role", "Name", "Address / Email", "Telephone"]}
                rows={d.serviceProviders.map((p) => [
                  <span key="r" className="text-ink/60">{p.role}</span>,
                  p.name || "–",
                  addressOrEmail(p.address),
                  <Phone key="t" value={p.telephone} />,
                ])}
              />
            </Block>
          )}

          <Block n="5" title="Investor grievance redressal">
            {d.grievance.text && <p className="max-w-3xl leading-relaxed text-ink/75">{d.grievance.text}</p>}
            {d.grievance.policyUrl && (
              <a
                href={d.grievance.policyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold text-ink hover:text-teal-ink"
              >
                Policy on Complaint Handling and Grievance Redressal (PDF) <ArrowUpRight className="size-4" aria-hidden />
              </a>
            )}
            <h4 className="mt-8 text-base font-bold text-ink">5.1 Status of investor complaints</h4>
            <div className="mt-4">
              <Table
                head={complaintsHead}
                rows={
                  d.grievance.complaints.length
                    ? d.grievance.complaints.map((c) => [c.quarterEnded, c.pendingStart || "0", c.received || "0", c.disposed || "0", c.pendingEnd || "0"])
                    : [[d.grievance.complaintsNote, "–", "–", "–", "–"]]
                }
              />
            </div>
          </Block>

          {d.officers.length > 0 && (
            <Block n="6" title="Key personnel for IFSC operations">
              <div className="grid gap-6 md:grid-cols-2">
                {d.officers.map((o, i) => (
                  <div key={o.designation + o.name}>
                    <h4 className="text-base font-bold text-ink">
                      6.{i + 1} {o.designation}
                    </h4>
                    <div className="mt-3">
                      <Pairs
                        rows={[
                          ["Name", o.name],
                          ["Designation", o.designation],
                          ["Email", <Email key="e" value={o.email} />],
                          ["Telephone", <Phone key="t" value={o.telephone} />],
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          <Block n="7" title="Material regulatory / enforcement actions in the preceding three years">
            <Pairs
              rows={[
                ["Action against FME or KMPs in relation to IFSC operations", d.actions.action],
                ["Current status", d.actions.status],
              ]}
            />
          </Block>

          {d.disclaimer && (
            <Block n="8" title="Disclaimer">
              <p className="max-w-3xl text-sm leading-relaxed text-ink/70">{d.disclaimer}</p>
            </Block>
          )}
        </div>
      </div>
    </section>
  );
}
