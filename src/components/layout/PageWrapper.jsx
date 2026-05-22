import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export default function PageWrapper({ title, crumbs, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} crumbs={crumbs} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="max-w-[1280px] mx-auto px-4 py-6 md:px-8 md:py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
