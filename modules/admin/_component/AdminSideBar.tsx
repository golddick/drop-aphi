import Image from 'next/image'
import React from 'react'
import AdminSidebarItems from './SidebarItems'

const AdminSideBar = () => {
  return (
    <div className=' min-h-screen  hidden lg:flex flex-col gap-2  p-4  lg:w-[230px] border-[#706A6A1A] border-r-2 fixed left-0 bg-black text-white '>
    <div className='w-full h-[30px]  flex  relative mb-6'>
    <Image src='/drop-logo,jpg' alt='logo' fill className='   object-cover  absolute'/>
    </div>
      <div className=' flex flex-col gap-2'>
      <AdminSidebarItems/>
      <AdminSidebarItems bottomContent={true}/>
      </div>
    </div>
  )
}

export default AdminSideBar
