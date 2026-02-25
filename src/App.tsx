import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/admin/page'
import AdminLayout from './pages/admin/layout'
import Dashboard from './pages/Dashboard'
// NOTE: Vercel analytics removed for now or use standard React one: import { Analytics } from '@vercel/analytics/react'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />
            </Routes>
        </BrowserRouter>
    )
}
