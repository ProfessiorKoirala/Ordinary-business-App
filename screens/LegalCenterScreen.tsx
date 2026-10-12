
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  FileText, 
  UserCheck, 
  AlertCircle, 
  Scale, 
  Briefcase, 
  ChevronRight, 
  ArrowLeft,
  Home,
  CheckCircle2,
  ExternalLink,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

interface LegalDoc {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const LegalCenterScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeDocId, setActiveDocId] = useState('privacy');

  const docs: LegalDoc[] = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>
          
          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg">
            <h3 className="font-bold text-purple-900 uppercase tracking-wider text-sm">Our Core Commitment</h3>
            <p className="text-purple-800 mt-1">
              OB Pro is built on one foundational principle: your data belongs to you, and only you. We do not collect, transmit, store, sell, rent, or analyze any business data you create within OB Pro.
            </p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Who We Are</h3>
            <p className="text-gray-600 leading-relaxed">
              Ordinary Business is the developer and publisher of OB Pro, a free business management application at <span className="text-purple-600">obpro.netlify.app</span>. Our main website is <span className="text-purple-600">ordinarybusiness.netlify.app</span>. This Privacy Policy describes our practices regarding information in connection with OB Pro. By using the App, you agree to the practices described here.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. Information We Do Not Collect</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "We do not collect your business data (sales, expenses, inventory, customers, etc.)",
                "We do not track your usage behavior or run analytics.",
                "We do not use cookies for tracking or advertising.",
                "We do not run ads or share data with advertisers.",
                "We do not have access to your Google Drive files.",
                "We do not use third-party analytics services.",
                "We do not maintain user accounts or identity records."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. How Your Business Data is Stored</h3>
            <p className="text-gray-600">All data you enter into OB Pro is stored exclusively in locations under your direct control:</p>
            <div className="space-y-2 pl-4 border-l-2 border-gray-100">
              <p className="text-gray-600"><span className="font-medium text-gray-800">— Your device's browser storage (localStorage / IndexedDB)</span> — controlled by you, developer has zero access.</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">— Your Google Drive (optional sync)</span> — controlled by you via Google, developer has zero access.</p>
              <p className="text-gray-600"><span className="font-medium text-gray-800">— Exported Excel (.xlsx) files on your device</span> — stored wherever you save them, developer has zero access.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. The LLEO AI Assistant</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro includes an AI assistant named LLEO. LLEO operates entirely on-device — it runs locally using your device's own processing power.
            </p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>LLEO does not send your data to any external server.</li>
              <li>LLEO does not connect to the internet to process queries.</li>
              <li>All AI inference happens locally on your device.</li>
              <li>No conversation you have with LLEO is ever transmitted to Ordinary Business or any third party.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. Google Drive Integration</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro offers an optional Google Drive sync feature. When you use it:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Data is transferred securely between your device and your personal Google Drive using OAuth 2.0 authorization.</li>
              <li>Ordinary Business does not act as an intermediary — the connection is directly between your device and Google's servers.</li>
              <li>We do not store your Google credentials or OAuth tokens on our servers.</li>
              <li>Your use of Google Drive is governed by Google's Privacy Policy.</li>
              <li>You can revoke OB Pro's access to your Google Drive at any time through your Google Account settings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Data You Share When Contacting Us</h3>
            <p className="text-gray-600 leading-relaxed">
              If you contact us for support or business inquiries, you may provide your name, email address, and a description of your issue. We use this solely to respond to your inquiry and do not add it to any marketing list or share it with third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">7. Children's Privacy</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro is intended for adults operating businesses. We do not knowingly collect personal information from individuals under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">8. International Users</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro is available globally. Because your data is stored on your own device and/or Google Drive, the data residency is determined by your hardware and Google's infrastructure — not by us.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">9. Changes to this Policy</h3>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. The "Last Updated" date at the top reflects any changes. Continued use of OB Pro after a change constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">10. Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-bold text-gray-800">Ordinary Business</p>
                <p className="text-sm text-gray-600">Developer & Founder: Sandesh Koirala</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>sandeshkoirala009@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>+977-9825953166</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>ordinarybusiness.netlify.app</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-6 text-center italic">We aim to respond to privacy requests within 30 days.</p>
          </section>
        </div>
      )
    },
    {
      id: 'health',
      title: 'Health Data Policy',
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Consumer Health Data Privacy Policy</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
            <h3 className="font-bold text-blue-900 uppercase tracking-wider text-sm">Summary</h3>
            <p className="text-blue-800 mt-1">
              OB Pro is a business management application. It does not collect, process, or store any health or medical data of any kind.
            </p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Scope</h3>
            <p className="text-gray-600 leading-relaxed">
              This policy is provided in the interest of full transparency, particularly for users in jurisdictions that require specific health data disclosure (such as Washington State's My Health MY Data Act or similar legislation).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. Health Data — Not Applicable</h3>
            <p className="text-gray-600">OB Pro is a business productivity application for managing sales, inventory, expenses, and customer records. The App:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Does not collect any health, medical, fitness, or biometric data.</li>
              <li>Does not request access to health APIs (e.g., Apple HealthKit, Google Fit).</li>
              <li>Does not infer health conditions from user behavior.</li>
              <li>Does not share health data with third parties (because none exists).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. If You Voluntarily Enter Health-Related Business Data</h3>
            <p className="text-gray-600 leading-relaxed">
              Some businesses (e.g., pharmacies, wellness shops) may use OB Pro to manage health-related product inventory. Any such data is treated identically to all other business data — it is stored locally on your device and never accessed by Ordinary Business.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">4. Contact</h3>
            <p className="text-gray-600">Questions about this policy? Contact us at <span className="text-purple-600 font-medium">sandeshkoirala009@gmail.com</span>.</p>
          </section>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security Policy',
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Data Security Policy</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Security Philosophy: Privacy by Architecture</h3>
            <p className="text-gray-600 leading-relaxed">
              The most secure data is data that was never transmitted in the first place. OB Pro's architecture is designed so that your sensitive business data never leaves your control. This is our primary security guarantee.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. Application-Level Security</h3>
            <ul className="space-y-4">
              <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-bold text-gray-800">HTTPS Enforcement</p>
                <p className="text-sm text-gray-600 mt-1">OB Pro is served exclusively over HTTPS (TLS 1.2+), encrypting all data in transit between your browser and our hosting servers.</p>
              </li>
              <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-bold text-gray-800">Content Security Policy (CSP)</p>
                <p className="text-sm text-gray-600 mt-1">The App implements strict CSP headers to prevent cross-site scripting (XSS) attacks.</p>
              </li>
              <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-bold text-gray-800">No Server-Side Data Storage</p>
                <p className="text-sm text-gray-600 mt-1">We operate a static application with no back-end database, eliminating the risk of a server-side data breach entirely.</p>
              </li>
              <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-bold text-gray-800">Dependency Management</p>
                <p className="text-sm text-gray-600 mt-1">We regularly review and update third-party libraries to patch known vulnerabilities.</p>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Your Device Security</h3>
            <p className="text-gray-600">Because your data lives on your device, its security depends in part on your device's security. We recommend:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Using a device with an up-to-date operating system and browser.</li>
              <li>Enabling device-level encryption (available on all modern smartphones and computers).</li>
              <li>Using a strong password or biometric lock on your device.</li>
              <li>Regularly exporting and backing up your data to a secure location.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. Google Drive Sync Security</h3>
            <p className="text-gray-600">When you use the optional Google Drive sync:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Authorization uses OAuth 2.0 — we never see or store your Google password.</li>
              <li>Data is encrypted in transit using TLS.</li>
              <li>Data is encrypted at rest within Google Drive per Google's own security standards.</li>
              <li>Access tokens are stored only in your browser's session storage and are not transmitted to our servers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. LLEO AI Security</h3>
            <p className="text-gray-600">As LLEO operates entirely on-device:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>No conversation data is transmitted over the network.</li>
              <li>LLEO model files are cached locally after initial download.</li>
              <li>There is no remote LLEO server that could be breached.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Incident Response</h3>
            <p className="text-gray-600 leading-relaxed">
              In the unlikely event we discover a vulnerability in OB Pro's code, we commit to:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Deploying a patch within 72 hours of confirming the vulnerability.</li>
              <li>Notifying users through the App within 7 days of discovery.</li>
              <li>Publishing a transparent post-mortem for significant incidents.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">7. Hosting Security</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro is hosted on Netlify, which provides global CDN with DDoS protection, automatic HTTPS with Let's Encrypt certificates, and atomic deploys with branch isolation.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">8. Reporting a Security Issue</h3>
            <p className="text-gray-600">Please refer to our <span className="text-purple-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveDocId('disclosure')}>Responsible Disclosure Policy</span> for instructions on reporting security vulnerabilities.</p>
          </section>
        </div>
      )
    },
    {
      id: 'disclosure',
      title: 'Responsible Disclosure',
      icon: <AlertCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Responsible Disclosure Policy</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <p className="text-gray-600 italic">We appreciate the security research community's efforts to keep OB Pro safe. If you discover a vulnerability, please follow the process below.</p>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Scope</h3>
            <p className="text-gray-600">This policy applies to security vulnerabilities found in:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>OB Pro web application at <span className="text-purple-600">obpro.netlify.app</span></li>
              <li>Ordinary Business website at <span className="text-purple-600">ordinarybusiness.netlify.app</span></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. What Qualifies</h3>
            <p className="text-gray-600">We are interested in reports relating to: cross-site scripting (XSS), unauthorized access to user data, authentication or authorization bypass, injection attacks, sensitive data exposure, and logic flaws with security impact.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Out of Scope</h3>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Denial-of-service attacks.</li>
              <li>Social engineering of Ordinary Business staff.</li>
              <li>Physical attacks against hardware.</li>
              <li>Vulnerabilities in third-party services (Netlify, Google) — report those directly to the respective companies.</li>
              <li>Spam or phishing reports that don't involve a technical vulnerability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. Reporting Process</h3>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                <p className="text-gray-600">Email <span className="font-bold text-gray-800">sandeshkoirala009@gmail.com</span> with subject line: <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">[SECURITY] Brief description</span></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                <p className="text-gray-600">Include a clear description of the vulnerability and steps to reproduce it.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                <p className="text-gray-600">Provide your assessment of the potential impact.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                <p className="text-gray-600">Attach screenshots, proof-of-concept code, or videos if helpful.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. Our Commitments</h3>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>We will acknowledge receipt of your report within 3 business days.</li>
              <li>We will confirm whether the issue is reproducible within 10 business days.</li>
              <li>We will resolve confirmed vulnerabilities within 30 days (critical issues within 7 days).</li>
              <li>We will keep you updated on our progress.</li>
              <li>We will credit you in our acknowledgements (if you wish).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Safe Harbor</h3>
            <p className="text-gray-600 leading-relaxed">
              We will not pursue legal action against researchers who act in good faith, follow this policy, and do not exceed the minimum access necessary to demonstrate a vulnerability. Do not access, modify, or delete user data as part of testing.
            </p>
          </section>

          <section className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-bold text-purple-900 mb-2">7. Bug Bounty</h3>
            <p className="text-purple-800">OB Pro is a free, independently developed application. We do not currently offer monetary bug bounties. However, we deeply appreciate and will publicly acknowledge responsible disclosures that help improve security for our users.</p>
          </section>
        </div>
      )
    },
    {
      id: 'tos-comm',
      title: 'ToS: Commercial',
      icon: <Briefcase className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Terms of Service: Commercial</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Introduction</h3>
            <p className="text-gray-600 leading-relaxed">
              These Commercial Terms of Service govern the use of OB Pro by businesses, organizations, entrepreneurs, and individuals using OB Pro for commercial or professional purposes. By using OB Pro in any commercial capacity, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. License Grant</h3>
            <p className="text-gray-600">Ordinary Business grants you a non-exclusive, non-transferable, revocable, royalty-free license to access and use OB Pro for your internal business operations. This license does not include the right to:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Sublicense or resell access to OB Pro.</li>
              <li>White-label or rebrand OB Pro as your own product.</li>
              <li>Reverse-engineer, decompile, or extract source code from OB Pro.</li>
              <li>Create derivative products that compete with OB Pro without written consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Permitted Commercial Use</h3>
            <p className="text-gray-600">You may freely use OB Pro to:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Manage sales, inventory, expenses, and customers for your business.</li>
              <li>Generate and download reports and Excel files for business analysis.</li>
              <li>Train employees on how to use OB Pro.</li>
              <li>Integrate OB Pro into your business workflow.</li>
              <li>Use LLEO AI to assist with business decision-making.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. Prohibited Activities</h3>
            <p className="text-gray-600">You may not use OB Pro to:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Conduct illegal business activities.</li>
              <li>Process data for money laundering or fraud.</li>
              <li>Circumvent any technical protection measures in the App.</li>
              <li>Attempt to gain unauthorized access to other users' data.</li>
              <li>Use automated scripts or bots to interact with the App abnormally.</li>
              <li>Interfere with or disrupt the App's infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. Data Ownership and Responsibility</h3>
            <p className="text-gray-600 leading-relaxed">
              You retain full ownership of all business data you enter into OB Pro. You are solely responsible for the accuracy and legality of the data you manage, ensuring your use complies with applicable laws in your jurisdiction (including data protection, consumer protection, and tax laws), maintaining backups of your business data, and the security of your own devices and Google Drive account.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Custom Development Services</h3>
            <p className="text-gray-600 leading-relaxed">
              Ordinary Business offers custom website and software development services. Such engagements are governed by separate written agreements and are not subject to these Terms unless expressly incorporated.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">7. Disclaimer of Warranties</h3>
            <p className="text-gray-600 leading-relaxed italic">
              OB PRO IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. ORDINARY BUSINESS EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OB PRO WILL BE ERROR-FREE OR UNINTERRUPTED.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">8. Limitation of Liability</h3>
            <p className="text-gray-600 leading-relaxed italic">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ORDINARY BUSINESS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS GOODWILL. OUR TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED ZERO DOLLARS (USD $0), REFLECTING THAT OB PRO IS PROVIDED ENTIRELY FREE OF CHARGE.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">9. Indemnification</h3>
            <p className="text-gray-600 leading-relaxed">
              You agree to defend, indemnify, and hold harmless Ordinary Business and its owner from and against any claims, damages, or liabilities arising from your use of OB Pro in violation of these Terms or any applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">10. Governing Law</h3>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of Nepal. Disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be subject to the jurisdiction of courts in Nepal.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">11. Modifications</h3>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of OB Pro after modifications constitutes acceptance. We will provide notice of material changes through the App.
            </p>
          </section>
        </div>
      )
    },
    {
      id: 'tos-cons',
      title: 'ToS: Consumer',
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Terms of Service: Consumer</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Agreement</h3>
            <p className="text-gray-600 leading-relaxed">
              Welcome to OB Pro. These Terms of Service form a legally binding agreement between you and Ordinary Business regarding your use of OB Pro. By accessing or using OB Pro, you confirm that you are at least 13 years of age and agree to be bound by these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. The Service</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro is a free, browser-based business management application. It allows you to record and manage sales, expenses, inventory, and customer data; sync data with your personal Google Drive; export data as Excel (.xlsx) files; and use the LLEO AI assistant, which runs locally on your device.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Free Service</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro is completely free of charge. There are no subscription fees, hidden charges, or premium tiers. We do not run advertisements. The service is provided as a public good by Ordinary Business.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. Your Data</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro does not require you to create an account. Your data is stored locally on your device or in your personal Google Drive. You are responsible for maintaining access to your own device and Google account.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-amber-800 font-medium">Important:</p>
              <p className="text-amber-700 text-sm mt-1">Clearing your browser's local storage or uninstalling the app will delete your locally stored data. Always export your data regularly as an Excel backup.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. Intellectual Property</h3>
            <p className="text-gray-600 leading-relaxed">
              The OB Pro application, its design, code, branding, and the LLEO AI model are the intellectual property of Ordinary Business. You are granted a limited license to use the App as described in Section 2. Nothing in these Terms transfers ownership of any intellectual property to you.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Third-Party Services</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro integrates with Google Drive. Your use of Google Drive is subject to Google's Terms of Service and Privacy Policy. Ordinary Business is not responsible for the availability, security, or conduct of Google or any other third-party service.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">7. Availability and Updates</h3>
            <p className="text-gray-600 leading-relaxed">
              We strive to keep OB Pro available continuously but do not guarantee uninterrupted access. We may update, modify, or temporarily take down the App for maintenance and will attempt to provide advance notice for planned downtime.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">8. Feedback</h3>
            <p className="text-gray-600 leading-relaxed">
              If you provide us with feedback, bug reports, or feature suggestions, you grant us a perpetual, irrevocable, royalty-free license to use that feedback to improve OB Pro without any obligation to you.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">9. Termination</h3>
            <p className="text-gray-600 leading-relaxed">
              You may stop using OB Pro at any time. We reserve the right to suspend or terminate access for users who violate these Terms or engage in abusive behavior. Since your data is stored locally, termination does not result in data loss on your end.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">10. Disclaimer and Limitation of Liability</h3>
            <p className="text-gray-600 leading-relaxed italic">
              OB Pro is provided for organizational purposes only. It does not constitute financial, legal, tax, or accounting advice. You are responsible for verifying the accuracy of all data and reports before relying on them for business decisions. TO THE MAXIMUM EXTENT PERMITTED BY LAW, ORDINARY BUSINESS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE OB PRO.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">11. Governing Law</h3>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of Nepal. If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">12. Contact</h3>
            <p className="text-gray-600">Questions? Email us at <span className="text-purple-600 font-medium">sandeshkoirala009@gmail.com</span>.</p>
          </section>
        </div>
      )
    },
    {
      id: 'usage',
      title: 'Usage Policy',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Usage Policy</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Purpose</h3>
            <p className="text-gray-600 leading-relaxed">
              This Usage Policy clarifies the acceptable and unacceptable ways to use OB Pro and the LLEO AI assistant. It applies to all users.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. Acceptable Use</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Business tracking (sales, inventory, expenses, customers)",
                "Data export and Excel file downloads",
                "Using LLEO AI for business insights",
                "Google Drive sync for personal backup",
                "Employee training on the app"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Prohibited Use</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Reselling data entered by other users",
                "Using the app for illegal activities",
                "Reverse-engineering or extracting code",
                "Automated scraping, bots, or scripts",
                "Impersonating Ordinary Business",
                "Distributing or rebranding OB Pro"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. LLEO AI Usage</h3>
            <p className="text-gray-600">You agree not to:</p>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li>Attempt to manipulate LLEO into generating harmful, illegal, or deceptive content.</li>
              <li>Use LLEO-generated outputs as certified financial, legal, or medical advice without independent verification.</li>
              <li>Attempt to extract, copy, or reproduce LLEO's underlying model weights or architecture.</li>
              <li>Use LLEO to generate misinformation intended to deceive third parties.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. Data Accuracy Responsibility</h3>
            <p className="text-gray-600 leading-relaxed">
              You are solely responsible for the accuracy of data entered into OB Pro. Ordinary Business is not liable for business decisions made based on incorrect data or financial losses arising from inaccurate input.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Fair Use</h3>
            <p className="text-gray-600 leading-relaxed">
              OB Pro is a passion project provided at no cost. We ask that you use it fairly and do not attempt to abuse or exploit the service in ways that could harm the application or its infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">7. Violations</h3>
            <p className="text-gray-600 leading-relaxed">
              Violations of this Usage Policy may result in suspension of your access to OB Pro and, where applicable, reporting to relevant legal authorities.
            </p>
          </section>
        </div>
      )
    },
    {
      id: 'choices',
      title: 'Privacy Choices',
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <header className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Privacy Choices</h2>
            <p className="text-sm text-gray-500 mt-1">Last Updated: 12 April 2026 | Version 1.0</p>
          </header>

          <p className="text-gray-600 italic leading-relaxed">Because OB Pro stores your data on your own device, you have maximum control over your data at all times.</p>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Your Privacy Rights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <p className="font-bold text-gray-800">Right to Access</p>
                <p className="text-sm text-gray-600 mt-1">We hold almost no data about you. For contact inquiry data, email us and we will tell you what we have.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <p className="font-bold text-gray-800">Right to Deletion</p>
                <p className="text-sm text-gray-600 mt-1">Clear your browser storage in your browser settings. Delete Drive files in your Google Drive. Delete any exported Excel files from your device.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <p className="font-bold text-gray-800">Right to Portability</p>
                <p className="text-sm text-gray-600 mt-1">Use the built-in Export feature to download your data as an Excel file at any time.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <p className="font-bold text-gray-800">Right to Correction</p>
                <p className="text-sm text-gray-600 mt-1">Edit your data directly within OB Pro at any time.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. Controlling Your Data</h3>
            <ul className="space-y-2 pl-4 list-disc text-gray-600">
              <li><span className="font-bold text-gray-800">Local data</span> — Clear your browser's localStorage/IndexedDB to wipe all local app data.</li>
              <li><span className="font-bold text-gray-800">Google Drive data</span> — Delete the OB Pro sync files directly from your Google Drive.</li>
              <li><span className="font-bold text-gray-800">Exported files</span> — Delete Excel files from your device as you would any other file.</li>
              <li><span className="font-bold text-gray-800">LLEO conversations</span> — LLEO has no memory between sessions. Each session starts completely fresh.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Do Not Track</h3>
            <p className="text-gray-600 leading-relaxed">OB Pro does not track you across websites and does not use tracking cookies. "Do Not Track" browser signals do not affect our practices because we do not track users in the first place.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. Cookies</h3>
            <p className="text-gray-600 leading-relaxed">OB Pro uses only essential technical storage required for the App to function. We do not use analytics cookies, advertising cookies, social media tracking pixels, or any cross-site tracking of any kind.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">5. Marketing Communications</h3>
            <p className="text-gray-600 leading-relaxed">We do not send marketing emails. We do not maintain a mailing list. If you contacted us for support and wish us to delete your contact information, email <span className="text-purple-600 font-medium">sandeshkoirala009@gmail.com</span> with the subject line: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Delete My Contact Info</span>.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">6. Google Drive Privacy Controls</h3>
            <p className="text-gray-600 leading-relaxed">If you use Google Drive sync, you can manage access through: Google Account → Data & Privacy → Third-party apps & services. You can revoke OB Pro's access at any time without affecting your locally stored data.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">7. Region-Specific Rights</h3>
            <div className="space-y-2 pl-4">
              <p className="text-gray-600"><span className="font-bold text-gray-800">EU / EEA (GDPR)</span> — Right to lodge a complaint with your local supervisory authority.</p>
              <p className="text-gray-600"><span className="font-bold text-gray-800">California (CCPA)</span> — Right to know, delete, and opt-out of sale. Note: we do not sell data.</p>
              <p className="text-gray-600"><span className="font-bold text-gray-800">Nepal</span> — Rights under the Individual Privacy Act, 2075.</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-center">To exercise any of these rights, contact us at <span className="text-purple-600 font-bold">sandeshkoirala009@gmail.com</span>. We will respond within 30 days.</p>
          </section>
        </div>
      )
    }
  ];

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Legal & Privacy Center</h1>
              <p className="text-xs text-gray-500">Ordinary Business — OB Pro</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            <span>Privacy First Architecture</span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 p-4 md:p-6">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Documents</h3>
            </div>
            <nav className="p-2 space-y-1">
              {docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    activeDocId === doc.id 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={activeDocId === doc.id ? 'text-white' : 'text-gray-400'}>
                    {doc.icon}
                  </span>
                  <span className="text-sm font-medium flex-1">{doc.title}</span>
                  {activeDocId === doc.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-sm text-purple-100 mb-4 leading-relaxed">Our legal team is here to clarify any questions regarding our policies.</p>
            <a 
              href="mailto:sandeshkoirala009@gmail.com"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-bold backdrop-blur-sm border border-white/20"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDocId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeDoc.content}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 Ordinary Business. All Rights Reserved.</p>
            <div className="flex items-center gap-6">
              <button className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                Home
              </button>
              <button className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                Website
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default LegalCenterScreen;
