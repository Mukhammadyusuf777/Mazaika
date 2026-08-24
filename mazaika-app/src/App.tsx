import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './styles/global.css'
import { useAuthStore } from './store/useAuthStore'
import FloatingAICopilot from './components/ai/FloatingAICopilot'
import { ErrorBoundary } from './components/layout/ErrorBoundary'

// Pages
import LandingPage from './pages/LandingPage'
import LandingPage3D from './pages/LandingPage3D'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import EditorPage from './pages/editor/EditorPage'
import ChatsPage from './pages/bot/ChatsPage'
import BroadcastsPage from './pages/bot/BroadcastsPage'
import AnalyticsPage from './pages/bot/AnalyticsPage'
import BotSettingsPage from './pages/bot/BotSettingsPage'
import ContactsPage from './pages/bot/ContactsPage'
import WebhooksPage from './pages/bot/WebhooksPage'
import MiniAppsPage from './pages/bot/MiniAppsPage'
import WebAppViewer from './pages/bot/WebAppViewer'
import SiteBuilderPage from './pages/bot/SiteBuilderPage'
import SiteRendererPage from './pages/bot/SiteRendererPage'
import AiWorkspacePage from './pages/ai/AiWorkspacePage'
import NotFoundPage from './pages/NotFoundPage'

// Layout
import AppLayout from './components/layout/AppLayout'

const ProtectedRoute = () => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <FloatingAICopilot projectType="bot" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Public WebApp Viewer */}
            <Route path="/webapp/:botId/:appId" element={<WebAppViewer />} />

            {/* Public Custom Site Renderer */}
            <Route path="/site/:botId" element={<SiteRendererPage />} />

            {/* App (authenticated) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/ai-workspace" element={<AiWorkspacePage />} />
              <Route path="/bot/:botId" element={<AppLayout />}>
                <Route index element={<Navigate to="editor" replace />} />
                <Route path="editor" element={<EditorPage />} />
                <Route path="miniapps" element={<MiniAppsPage />} />
                <Route path="sitebuilder" element={<SiteBuilderPage />} />
                <Route path="chats" element={<ChatsPage />} />
                <Route path="broadcasts" element={<BroadcastsPage />} />
                <Route key="contacts" path="contacts" element={<ContactsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="webhooks" element={<WebhooksPage />} />
                <Route path="settings" element={<BotSettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

