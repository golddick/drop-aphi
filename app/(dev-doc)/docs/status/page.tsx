"use client"

import { Activity, CheckCircle } from "lucide-react"

export default function StatusPage() {
  const services = [
    {
      name: "Newsletter API",
      status: "operational",
      uptime: "99.99%",
      lastIncident: "30 days ago",
    },
    {
      name: "OTP API",
      status: "operational",
      uptime: "99.98%",
      lastIncident: "45 days ago",
    },
    {
      name: "Blog API",
      status: "operational",
      uptime: "99.99%",
      lastIncident: "20 days ago",
    },
    {
      name: "Webhooks",
      status: "operational",
      uptime: "99.97%",
      lastIncident: "60 days ago",
    },
  ]

  const incidents = [
    {
      date: "2024-01-10",
      service: "Newsletter API",
      duration: "15 minutes",
      impact: "Email delivery delayed",
      status: "resolved",
    },
    {
      date: "2024-01-05",
      service: "OTP API",
      duration: "8 minutes",
      impact: "OTP verification slow",
      status: "resolved",
    },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">API Status</h1>
        <p className="text-lg text-muted-foreground">Real-time status of DropAphi services.</p>
      </div>

      {/* Overall Status */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">All Systems Operational</h2>
        </div>
        <p className="text-muted-foreground">Last updated: 2 minutes ago</p>
      </div>

      {/* Service Status */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Service Status</h2>
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">{service.name}</h3>
                </div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Uptime</span>
                  <p className="font-semibold">{service.uptime}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Incident</span>
                  <p className="font-semibold">{service.lastIncident}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Incidents</h2>
        <div className="space-y-3">
          {incidents.map((incident, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{incident.service}</h3>
                  <p className="text-sm text-muted-foreground">{incident.date}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Resolved</span>
              </div>
              <p className="text-sm mb-2">{incident.impact}</p>
              <p className="text-xs text-muted-foreground">Duration: {incident.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Avg Response Time", value: "45ms" },
            { label: "Requests/sec", value: "10,000+" },
            { label: "Error Rate", value: "0.01%" },
          ].map((metric, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary text-center">
              <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribe to Updates */}
      <div className="p-6 rounded-lg border border-gold bg-card">
        <h3 className="font-semibold mb-3 text-gold">Subscribe to Status Updates</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get notified about service incidents and maintenance windows.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-sm"
          />
          <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}
