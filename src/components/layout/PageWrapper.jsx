import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function PageWrapper({ title, crumbs, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} crumbs={crumbs} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
