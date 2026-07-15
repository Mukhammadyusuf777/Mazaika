import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Users, MessageSquare, MousePointerClick, TrendingUp } from 'lucide-react'
import { apiClient } from '../../api/apiClient'

export default function AnalyticsPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalContacts: 0,
    todayMessages: 0,
    chartData: []
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get(`/bots/${id}/analytics`)
        setStats(res.data)
      } catch (e) {
        console.error('Failed to fetch analytics', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [id])

  if (loading) {
    return <div style={{ padding: 'var(--space-8)' }}>Yuklanmoqda...</div>
  }

  return (
    <div style={{ padding: 'var(--space-8)', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>Analitika</h2>
        <p style={{ color: 'var(--text-muted)' }}>Bot statistikasi va foydalanuvchilar faolligi</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {[
          { icon: Users, label: 'Jami obunachilar', value: stats.totalContacts.toString(), color: 'var(--accent-blue)' },
          { icon: MessageSquare, label: 'Xabarlar (Bugun)', value: stats.todayMessages.toString(), color: 'var(--accent-aqua)' },
          { icon: MousePointerClick, label: 'Tugmalar bosilishi', value: '45.2%', color: '#a855f7' },
          { icon: TrendingUp, label: 'Konversiya', value: '12.8%', color: '#10d974' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${stat.color} 15%, transparent)`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 600 }}>Obunachilar o'sishi</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="users" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 600 }}>Faollik</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="msgs" stroke="var(--accent-aqua)" strokeWidth={3} dot={{ fill: 'var(--bg-primary)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
