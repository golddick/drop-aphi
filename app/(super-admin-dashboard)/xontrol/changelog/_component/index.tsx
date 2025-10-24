"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit2 } from "lucide-react"

interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  description: string
  changes: string[]
  type: "feature" | "bugfix" | "improvement" | "breaking"
}

export default function ChangelogManager() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([
    {
      id: "1",
      version: "2.1.0",
      date: "2025-01-20",
      title: "SMS API Launch",
      description: "Introducing SMS API for sending OTP and notifications via SMS",
      changes: ["Added SMS API endpoints", "Integrated Twilio provider", "Added SMS templates"],
      type: "feature",
    },
    {
      id: "2",
      version: "2.0.5",
      date: "2025-01-15",
      title: "Performance Improvements",
      description: "Optimized API response times and database queries",
      changes: ["Reduced API latency by 40%", "Optimized database indexes", "Improved caching"],
      type: "improvement",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    version: string
    title: string
    description: string
    changes: string
    type: ChangelogEntry["type"]
  }>({
    version: "",
    title: "",
    description: "",
    changes: "",
    type: "feature",
  })

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.version && formData.title && formData.description) {
      const newEntry: ChangelogEntry = {
        id: editingId || Date.now().toString(),
        version: formData.version,
        date: new Date().toISOString().split("T")[0],
        title: formData.title,
        description: formData.description,
        changes: formData.changes.split("\n").filter((c) => c.trim()),
        type: formData.type,
      }

      if (editingId) {
        setEntries((prev) => prev.map((entry) => (entry.id === editingId ? newEntry : entry)))
        setEditingId(null)
      } else {
        setEntries((prev) => [newEntry, ...prev])
      }

      setFormData({ version: "", title: "", description: "", changes: "", type: "feature" })
      setShowForm(false)
    }
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this changelog entry?")) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
    }
  }

  const handleEditEntry = (entry: ChangelogEntry) => {
    setFormData({
      version: entry.version,
      title: entry.title,
      description: entry.description,
      changes: entry.changes.join("\n"),
      type: entry.type,
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      feature: "bg-blue-100 text-blue-800",
      bugfix: "bg-red-100 text-red-800",
      improvement: "bg-green-100 text-green-800",
      breaking: "bg-yellow-100 text-yellow-800",
    }
    return colors[type as keyof typeof colors] || ""
  }

  return (
    <div className="space-y-8 mt-5">
      {/* Add Entry Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg animate-slide-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Add Changelog Entry</h2>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ version: "", title: "", description: "", changes: "", type: "feature" })
            }}
            className="bg-red-600 text-white hover:bg-black flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleAddEntry} className="space-y-4 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Version *</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g. 2.1.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ChangelogEntry["type"] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                >
                  <option value="feature">Feature</option>
                  <option value="bugfix">Bug Fix</option>
                  <option value="improvement">Improvement</option>
                  <option value="breaking">Breaking Change</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Changelog title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Changes (one per line)</label>
              <textarea
                value={formData.changes}
                onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                placeholder="Added new feature&#10;Fixed bug&#10;Improved performance"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-green-600 text-white hover:bg-green-700 flex-1">
                {editingId ? "Update Entry" : "Add Entry"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({ version: "", title: "", description: "", changes: "", type: "feature" })
                }}
                className="bg-gray-300 text-black hover:bg-gray-400 flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Changelog Entries */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all animate-slide-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-black">v{entry.version}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(entry.type)}`}>
                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{entry.date}</p>
                <h4 className="text-lg font-semibold text-black mb-2">{entry.title}</h4>
                <p className="text-gray-600 mb-4">{entry.description}</p>

                {entry.changes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-black mb-2">Changes:</p>
                    <ul className="space-y-1">
                      {entry.changes.map((change, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => handleEditEntry(entry)}
                  className="bg-blue-600 text-white hover:bg-blue-700 p-2 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="bg-red-600 text-white hover:bg-red-700 p-2 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
