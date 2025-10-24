"use client"

import SubscribersTable from "./subscribers-table"


export default function AdminSubscribersPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} /> */}

      <section className="py-8 px-4 md:px-8">
        <div className="w-full">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Newsletter <span className="text-red-600">Subscribers</span>
            </h1>
            <p className="text-lg text-gray-600">View and manage all newsletter subscribers across the platform</p>
          </div>

          <SubscribersTable />
        </div>
      </section>

      {/* <Footer /> */}
    </main>
  )
}
