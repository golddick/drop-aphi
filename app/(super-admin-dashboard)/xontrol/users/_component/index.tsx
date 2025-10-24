"use client"

import UsersTable from "./users-table"


export default function AdminUsersPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} /> */}

      <section className="py-8 px-4 md:px-8">
        <div className="w-full">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Platform <span className="text-red-600">Users</span>
            </h1>
            <p className="text-lg text-gray-600">Manage all users on the DropAphi platform</p>
          </div>

          <UsersTable />
        </div>
      </section>

      {/* <Footer /> */}
    </main>
  )
}
