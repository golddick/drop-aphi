import { Bell, Menu, Newspaper, Search } from 'lucide-react'
import React from 'react'
import SuperToolbar from './superAdminTopUserar'

const AdminTopBar = () => {
  return (
    <nav className="bg-black text-white p-4 fixed w-full z-10">
        <div className=" flex justify-between items-center"> 
          <div className="flex items-center space-x-2">
            <Newspaper className="text-gold-700" />
            <span className="font-bold text-xl hidden md:block">Drop-Aphi Super Admin</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-800 rounded-full py-1 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400 w-48"
              />
              <Search size={16} className="absolute right-3 top-1.5 text-gray-400" />
            </div>
            <button className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-gold-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
            </button>
            {/* <div className="w-8 h-8 bg-gold-300 rounded-full flex items-center justify-center text-black font-bold">
              A
            </div> */}
            <SuperToolbar/>
          </div>
          
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </nav>
  )
}

export default AdminTopBar
