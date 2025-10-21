"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Briefcase, Users } from "lucide-react"

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
}

const jobPostings: JobPosting[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "We're looking for an experienced backend engineer to help build scalable APIs and infrastructure for DropAphi.",
    requirements: [
      "5+ years of backend development experience",
      "Proficiency in Node.js, Python, or Go",
      "Experience with database design and optimization",
      "Strong understanding of API design principles",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
    ],
  },
  {
    id: "2",
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Join our frontend team to build beautiful, responsive user interfaces for DropAphi's platform.",
    requirements: [
      "3+ years of frontend development experience",
      "Strong proficiency in React and TypeScript",
      "Experience with Tailwind CSS or similar frameworks",
      "Understanding of responsive design principles",
      "Experience with state management solutions",
    ],
  },
  {
    id: "3",
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description:
      "Help us build and maintain our infrastructure, ensuring reliability and scalability for our platform.",
    requirements: [
      "4+ years of DevOps experience",
      "Proficiency with Docker and Kubernetes",
      "Experience with CI/CD pipelines",
      "Strong knowledge of cloud platforms",
      "Experience with monitoring and logging tools",
    ],
  },
  {
    id: "4",
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    description: "Lead product strategy and development for DropAphi's communication APIs.",
    requirements: [
      "5+ years of product management experience",
      "Experience with developer-focused products",
      "Strong analytical and communication skills",
      "Experience with API products",
      "Track record of successful product launches",
    ],
  },
  {
    id: "5",
    title: "Developer Advocate",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Help developers succeed with DropAphi through documentation, tutorials, and community engagement.",
    requirements: [
      "3+ years of developer relations or technical marketing experience",
      "Strong technical background",
      "Excellent communication and presentation skills",
      "Experience with API documentation",
      "Active presence in developer communities",
    ],
  },
  {
    id: "6",
    title: "Customer Success Manager",
    department: "Sales & Support",
    location: "Remote",
    type: "Full-time",
    description: "Build relationships with our customers and ensure they get maximum value from DropAphi.",
    requirements: [
      "3+ years of customer success or account management experience",
      "Strong communication and interpersonal skills",
      "Experience with SaaS products",
      "Problem-solving mindset",
      "Ability to manage multiple accounts",
    ],
  },
]

export default function CareersPage() {
  const [expandedJob, setExpandedJob] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl text-gray-300 mb-8">
            Help us build the future of communication APIs. We're looking for talented individuals who are passionate
            about solving real problems for developers and creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-5 h-5" />
              <span>Growing Team</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-5 h-5" />
              <span>100% Remote</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Briefcase className="w-5 h-5" />
              <span>Competitive Benefits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-12 text-center">Why Join DropAphi?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-black mb-3">Mission-Driven</h3>
              <p className="text-gray-600">
                Work on a product that solves real problems for developers and creators worldwide.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-black mb-3">Remote First</h3>
              <p className="text-gray-600">
                Work from anywhere in the world. We believe in flexibility and work-life balance.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-black mb-3">Growth Opportunities</h3>
              <p className="text-gray-600">
                Join a startup with significant growth potential and opportunities to expand your skills.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-black mb-3">Competitive Compensation</h3>
              <p className="text-gray-600">
                We offer competitive salaries, equity, and comprehensive benefits packages.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-black mb-3">Collaborative Culture</h3>
              <p className="text-gray-600">
                Work with talented individuals who are passionate about building great products.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-black mb-3">Learning & Development</h3>
              <p className="text-gray-600">
                We invest in your professional development with training and conference budgets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-12 text-center">Open Positions</h2>
          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-yellow-600 transition-colors"
              >
                <button
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 text-yellow-600 transition-transform ${
                        expandedJob === job.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {expandedJob === job.id && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <p className="text-gray-600 mb-6">{job.description}</p>
                    <h4 className="font-bold text-black mb-3">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-2 mb-6 text-gray-600">
                      {job.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                    <Link
                      href={`/careers/${job.id}`}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-600 text-black font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Don't see a role that fits?</h2>
          <p className="text-xl text-gray-300 mb-8">
            We're always looking for talented individuals. Send us your resume and let us know how you can contribute to
            DropAphi.
          </p>
          <Link
            href="mailto:careers@dropaphi.com"
            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-600 text-black font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Send Your Resume
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
