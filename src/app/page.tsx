import Link from "next/link";
import StartTrialButton from "./components/StartTrialButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 text-white">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">We Prioritize People.</h1>
        <p className="text-xl max-w-2xl mb-8">
          We support growing startups by building a solid HR & People foundation—from friends-and-family round, to unicorn, and beyond.
        </p>
        <StartTrialButton />
      </header>

      {/* What We Do Section */}
      <section className="bg-white text-blue-900 py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">What We Do</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Plug-and-Play People Team</h3>
            <p>Our fractional, external HR team provides customized, scalable support ranging from foundational HR work to strategic leadership.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Hiring & Recruiting</h3>
            <p>We serve as external recruiters and fill roles for your team while optimizing your hiring practices and onboarding experiences.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Compensation</h3>
            <p>Our compensation experts help design equitable and effective reward structures to drive your company's growth and performance.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Learning & Development</h3>
            <p>We offer management training and customized learning modules to close skill gaps and empower leaders with essential skills.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Diversity, Equity, Inclusion & Belonging</h3>
            <p>We help organizations foster inclusive environments and build strategies for inclusive hiring and DEI&B infrastructure.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-100 text-blue-900 py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Testimonials</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow flex flex-col gap-2">
            <p className="mb-2">"What makes People Function truly unique is their team-based approach. You're not just hiring a consultant—you're accessing a group of specialists who can be plugged in where and when you need them, from junior support to senior-level strategy. It's been a huge advantage for us."</p>
            <span className="font-semibold">— Megan Sufka, CPO at OnBelay</span>
          </div>
          <div className="bg-white rounded-lg p-6 shadow flex flex-col gap-2">
            <p className="mb-2">"People Function didn't just roll out generic workflows—they truly got to know our business and tailored solutions to meet our unique needs. Working with them feels like we have dedicated HR experts on our payroll."</p>
            <span className="font-semibold">— Jack Perkins, COO at Northstar Sourcing</span>
          </div>
          <div className="bg-white rounded-lg p-6 shadow flex flex-col gap-2">
            <p className="mb-2">"What sets People Function apart is their commitment to seeing your teams and business succeed holistically. They examine every detail within the broader context of your company's goals, setting you up for long-term success."</p>
            <span className="font-semibold">— Danica Terrett, COO at Chess at Three</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/services" className="hover:underline">Services</Link>
            <Link href="/resources" className="hover:underline">Resources</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <span className="text-xs text-blue-200">&copy; {new Date().getFullYear()} People Function. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}
