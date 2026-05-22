import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import ToastContainer from './components/ui/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <ToastContainer />
    </BrowserRouter>
  )
}
