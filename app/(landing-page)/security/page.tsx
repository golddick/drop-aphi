export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">Security</h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="mb-6">Last updated: January 2025</p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Security Overview</h2>
          <p className="mb-6">
            At DropAphi, security is our top priority. We implement industry-leading security practices to protect your
            data and ensure the integrity of our platform. This page outlines our security measures and commitments.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Data Encryption</h2>
          <p className="mb-6">
            All data transmitted between your application and DropAphi's servers is encrypted using TLS 1.2 or higher.
            We use 256-bit AES encryption for sensitive data at rest, including API keys, user credentials, and personal
            information.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. API Security</h2>
          <p className="mb-6">Our APIs are secured with industry-standard authentication mechanisms:</p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>API Key authentication with automatic rotation capabilities</li>
            <li>OAuth 2.0 support for third-party integrations</li>
            <li>Rate limiting to prevent abuse and DDoS attacks</li>
            <li>Request signing and verification for sensitive operations</li>
            <li>IP whitelisting options for enterprise customers</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Infrastructure Security</h2>
          <p className="mb-6">DropAphi's infrastructure is hosted on secure, redundant servers with:</p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Regular security audits and penetration testing</li>
            <li>Automated threat detection and response systems</li>
            <li>DDoS protection and mitigation</li>
            <li>Firewall and intrusion detection systems</li>
            <li>Regular backups with encrypted storage</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Compliance & Certifications</h2>
          <p className="mb-6">DropAphi complies with major data protection regulations and industry standards:</p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>GDPR (General Data Protection Regulation)</li>
            <li>CCPA (California Consumer Privacy Act)</li>
            <li>SOC 2 Type II compliance</li>
            <li>ISO 27001 information security management</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Vulnerability Disclosure</h2>
          <p className="mb-6">
            We take security vulnerabilities seriously. If you discover a security vulnerability in DropAphi, please
            report it responsibly to security@dropaphi.com. We will acknowledge receipt of your report within 24 hours
            and work with you to resolve the issue.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Security Best Practices</h2>
          <p className="mb-6">We recommend the following best practices when using DropAphi:</p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Keep your API keys confidential and never commit them to version control</li>
            <li>Rotate API keys regularly</li>
            <li>Use HTTPS for all API requests</li>
            <li>Implement proper authentication in your applications</li>
            <li>Monitor your API usage for suspicious activity</li>
            <li>Enable two-factor authentication on your account</li>
          </ul>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Incident Response</h2>
          <p className="mb-6">
            In the event of a security incident, DropAphi has a comprehensive incident response plan that includes
            immediate investigation, containment, and notification of affected users within 72 hours as required by law.
          </p>

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Contact Us</h2>
          <p className="mb-6">For security-related questions or concerns, please contact us at security@dropaphi.com</p>
        </div>
      </div>
    </main>
  )
}
