import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './styles/global.css'
import { useAuthStore } from './store/useAuthStore'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import EditorPage from './pages/editor/EditorPage'
import ChatsPage from './pages/bot/ChatsPage'
import BroadcastsPage from './pages/bot/BroadcastsPage'
import AnalyticsPage from './pages/bot/AnalyticsPage'
import BotSettingsPage from './pages/bot/BotSettingsPage'
import ContactsPage from './pages/bot/ContactsPage'
import WebhooksPage from './pages/bot/WebhooksPage'

// Layout
import AppLayout from './components/layout/AppLayout'

const ProtectedRoute = () => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App (authenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bot/:botId" element={<AppLayout />}>
            <Route index element={<Navigate to="editor" replace />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="chats" element={<ChatsPage />} />
            <Route path="broadcasts" element={<BroadcastsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="webhooks" element={<WebhooksPage />} />
            <Route path="settings" element={<BotSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
