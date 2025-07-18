import Link from "next/link";
import StartTrialButton from "../components/StartTrialButton";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 text-white">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Choose Your HR Journey</h1>
        <p className="text-xl max-w-2xl mb-8">
          From templates to full implementation, we have the perfect solution for your company's HR needs.
        </p>
      </header>

      {/* Pricing Tiers */}
      <section className="bg-white text-blue-900 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Free Tier */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-lg border-2 border-blue-100">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-sm text-gray-600 mb-4">Perfect for founders just getting started</p>
            <div className="text-3xl font-bold mb-6">$0</div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                3 Core HR Templates
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Template Download
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Basic Customization
              </li>
              <li className="flex items-center text-gray-500">
                <span className="text-gray-400 mr-2">✗</span>
                AI Agent Access
              </li>
              <li className="flex items-center text-gray-500">
                <span className="text-gray-400 mr-2">✗</span>
                File Upload
              </li>
            </ul>
            <StartTrialButton />
          </div>

          {/* Paid Tier */}
          <div className="bg-blue-600 text-white rounded-lg p-6 shadow-lg border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">Most Popular</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Self-Serve Platform</h3>
            <p className="text-sm text-blue-100 mb-4">AI-powered HR guidance that scales with your team</p>
            <div className="text-3xl font-bold mb-6">$99<span className="text-lg">/month</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                20+ HR Templates
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Full AI Agent Access
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                File Upload & Processing
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Personalized Recommendations
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Email Support
              </li>
            </ul>
            <button className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50 transition">
              Start Free Trial
            </button>
          </div>

          {/* Hybrid Tier */}
          <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-lg p-6 shadow-lg border-2 border-yellow-200">
            <h3 className="text-xl font-bold mb-2">Expert Consultation</h3>
            <p className="text-sm text-gray-600 mb-4">When you need expert guidance alongside powerful tools</p>
            <div className="text-3xl font-bold mb-6">$2,000</div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Everything in Self-Serve
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                5 Hours Live Consultation
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Custom HR Strategy
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Compliance Review
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority Support
              </li>
            </ul>
            <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition">
              Contact Sales
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-lg p-6 shadow-lg border-2 border-blue-800">
            <h3 className="text-xl font-bold mb-2">End-to-End Implementation</h3>
            <p className="text-sm text-blue-100 mb-4">Complete HR infrastructure built specifically for your company</p>
            <div className="text-3xl font-bold mb-6">$5,000</div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Everything in Expert
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Custom Onboarding Design
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Team Training & Workshops
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                HRIS Integration Support
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Dedicated Success Manager
              </li>
            </ul>
            <button className="w-full bg-white text-blue-900 font-bold py-3 px-4 rounded-lg hover:bg-blue-50 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-900">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold text-blue-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-blue-900">Free</th>
                  <th className="text-center p-4 font-semibold text-blue-900">Self-Serve</th>
                  <th className="text-center p-4 font-semibold text-blue-900">Expert</th>
                  <th className="text-center p-4 font-semibold text-blue-900">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">HR Templates</td>
                  <td className="text-center p-4">3</td>
                  <td className="text-center p-4">20+</td>
                  <td className="text-center p-4">20+</td>
                  <td className="text-center p-4">20+</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">AI Agent Access</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">File Upload</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Live Consultation</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">5 hours</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Custom Implementation</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4">✅</td>
                </tr>
                <tr>
                  <td className="p-4">Support</td>
                  <td className="text-center p-4">Community</td>
                  <td className="text-center p-4">Email</td>
                  <td className="text-center p-4">Priority</td>
                  <td className="text-center p-4">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-900">Can I upgrade my plan at any time?</h3>
              <p className="text-gray-600">Yes! You can upgrade from Free to any paid plan at any time. For Expert and Premium tiers, we'll schedule a consultation to understand your needs.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-900">What's included in the live consultation?</h3>
              <p className="text-gray-600">Our certified HR experts will help with strategic planning, compliance reviews, custom HR processes, and implementation guidance tailored to your company.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-900">How does the Premium implementation work?</h3>
              <p className="text-gray-600">We'll work closely with your team to design custom onboarding processes, provide training workshops, integrate with your existing systems, and ensure everything is set up for success.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-900">Is there a free trial for paid plans?</h3>
              <p className="text-gray-600">Yes! Start with our Free tier to explore templates, then upgrade to Self-Serve for a 14-day free trial of the full platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your HR?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join hundreds of startups that trust People Function for their HR needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <StartTrialButton />
          <Link href="/contact" className="inline-block bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-blue-900 transition">
            Contact Sales
          </Link>
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