import Link from 'next/link'
import Logo from './logo'
import NavItems from './nav.items'
import Toolbar from './toolbar'
import { MobileHeader } from './mobileHeader'

const Header = () => {
  return (
   <header className='w-full sticky top-0 left-0 z-[999] border-b border-b[#000] px-10 flex items-center justify-between h-[60px] bg-white text-black'>
       <div className=' hidden lg:block'>
         <Link href={"/"}> 
          <Logo />
        </Link>
       </div>
       <div className=' lg:hidden'>
        <MobileHeader/>
       </div> 
      <div>
            <NavItems />
        </div>
        <div className='flex items-center gap-3'>
          <Toolbar />
        </div>
   </header>
  )
}

export default Header