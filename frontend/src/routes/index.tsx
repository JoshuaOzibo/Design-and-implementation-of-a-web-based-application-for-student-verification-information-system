import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/svis/Logo";
import {
  ShieldCheck, ScanLine, Database, Lock, Users, FileCheck2, ArrowRight,
  Building2, GraduationCap, BookOpen, BadgeCheck, Mail, Phone, MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SVIS — Student Verification Information System" },
      { name: "description", content: "Secure university platform to verify student identity and academic records in real time." },
      { property: "og:title", content: "SVIS — Student Verification Information System" },
      { property: "og:description", content: "Secure university platform to verify student identity and academic records in real time." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/login">Staff Login</Link></Button>
            <Button asChild className="text-xs sm:text-sm"><Link to="/app/verify">Verify Student</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Official University Verification Platform
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Secure Student Verification Made Simple
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Verify student identity and academic information instantly through a centralized digital platform built for university administrators, faculty, and security personnel.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto justify-center"><Link to="/app/verify">Verify Student <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto justify-center"><Link to="/login">Staff Login</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> End-to-end encrypted</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> ISO 27001 aligned</div>
              <div className="flex items-center gap-2"><Database className="h-4 w-4" /> Single source of record</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <div className="border-b border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">Live verification preview</div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-primary/10 text-primary text-2xl font-semibold">AO</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">Adaeze Okafor</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/10 px-2 py-0.5 text-[11px] font-semibold text-[color:var(--success)]">
                        ✓ VERIFIED
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">UNI/2022/1234 · 300L · Computer Science</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <Detail label="Faculty" value="Engineering" />
                      <Detail label="Session" value="2024/2025" />
                      <Detail label="Status" value="Active" />
                      <Detail label="Verified" value="Just now" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionTitle eyebrow="Purpose" title="Why verification matters" subtitle="Manual checks slow down administration, expose institutions to identity fraud, and create poor experiences for students." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { i: GraduationCap, t: "Protect academic integrity", d: "Confirm enrollment, level, and session before granting access to examinations or records." },
              { i: Building2, t: "Streamline campus access", d: "Validate identity at hostels, libraries, and restricted facilities in seconds." },
              { i: FileCheck2, t: "Trustworthy records", d: "A single, auditable source of truth across departments and units." },
            ].map((f) => (
              <Card key={f.t} className="border-border/80">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><f.i className="h-5 w-5" /></div>
                  <div className="font-semibold">{f.t}</div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionTitle eyebrow="Capabilities" title="System features" subtitle="A complete toolset for verification, record management, and reporting." />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { i: ScanLine, t: "QR Identity Cards", d: "Generate and verify student QR identities issued by the institution." },
              { i: Users, t: "Student Records", d: "Manage enrollment, departmental data, and student status centrally." },
              { i: ShieldCheck, t: "Real-time Verification", d: "Confirm a student in seconds via matric, ID, or QR scan." },
              { i: FileCheck2, t: "Verification Logs", d: "Every verification is timestamped and attributed to a staff account." },
              { i: BookOpen, t: "Reports & Analytics", d: "Faculty-level insights, trends, and exportable summaries." },
              { i: Lock, t: "Role-based Access", d: "Granular permissions for examination, library, hostel and security staff." },
            ].map((f) => (
              <div key={f.t} className="rounded-lg border border-border bg-card p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent"><f.i className="h-5 w-5" /></div>
                <div className="font-semibold">{f.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <SectionTitle eyebrow="Security" title="Built for institutional trust" subtitle="SVIS is engineered with the controls expected of a university ICT system." align="left" />
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "TLS 1.3 in transit, AES-256 at rest",
                "Single sign-on and multi-factor authentication",
                "Role-based access control with full audit logging",
                "Tamper-evident QR identities issued by the registry",
                "Automatic session timeout & device binding",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-border/80">
            <CardContent className="p-6">
              <div className="text-sm font-semibold">Audit snapshot · last 24h</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Metric value="1,213" label="Verifications" />
                <Metric value="99.4%" label="Success rate" />
                <Metric value="7" label="Flagged events" />
                <Metric value="0" label="Outages" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionTitle eyebrow="Workflow" title="How it works" subtitle="Three steps from arrival to verified record." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", t: "Search or scan", d: "Enter a matric or student ID, or scan a QR identity card." },
              { n: "02", t: "Match record", d: "SVIS retrieves the official student record from the registry." },
              { n: "03", t: "Confirm identity", d: "Compare photo and status, then approve or flag the entry." },
            ].map((s) => (
              <Card key={s.n} className="border-border/80">
                <CardContent className="p-6">
                  <div className="text-xs font-semibold text-primary">{s.n}</div>
                  <div className="mt-2 text-base font-semibold">{s.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <SectionTitle eyebrow="Help" title="Frequently asked questions" />
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionTitle eyebrow="Support" title="Contact the ICT Directorate" subtitle="For verification access requests and technical support." />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <ContactCard icon={Mail} title="Email" value="ict-support@university.edu" />
            <ContactCard icon={Phone} title="Phone" value="+234 800 000 0000" />
            <ContactCard icon={MapPin} title="Office" value="ICT Directorate, Senate Building, Room 204" />
          </div>
        </div>
      </section>

      <footer className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span>© {new Date().getFullYear()} University ICT Directorate. All rights reserved.</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Acceptable Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const faqs = [
  { q: "Who can access SVIS?", a: "Authorised university staff including administrators, examination officers, library and hostel staff, and security personnel. Access is granted by the ICT Directorate." },
  { q: "Is the student data secure?", a: "Yes. All data is encrypted in transit and at rest. Every verification is logged with the staff member's identity, time and location." },
  { q: "How are QR identities issued?", a: "QR codes are generated by the registry against verified student records and are tamper-evident. Lost cards can be revoked and reissued by ICT." },
  { q: "Can SVIS work offline?", a: "Verification requires connectivity to the central registry to ensure records are always current. A short-lived offline cache is available for field staff." },
];

function SectionTitle({ eyebrow, title, subtitle, align = "center" }: { eyebrow?: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p className={`mt-3 text-muted-foreground ${align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{subtitle}</p>}
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>);
}
function Metric({ value, label }: { value: string; label: string }) {
  return (<div className="rounded-md border border-border bg-muted/30 p-4"><div className="text-2xl font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>);
}
function ContactCard({ icon: Icon, title, value }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string }) {
  return (
    <Card className="border-border/80"><CardContent className="flex items-start gap-3 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div><div className="text-sm font-semibold">{title}</div><div className="text-sm text-muted-foreground">{value}</div></div>
    </CardContent></Card>
  );
}
