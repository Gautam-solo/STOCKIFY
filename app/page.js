'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  TrendingUp, TrendingDown, Search, Star, StarOff, Plus, Minus,
  MessageSquare, Send, Bot, User, BarChart3, Briefcase, Bell,
  Menu, X, RefreshCw, ExternalLink, ChevronRight, Sparkles,
  DollarSign, Activity, PieChart, AlertTriangle, Clock, Zap,
  LogOut, Settings, Eye, EyeOff, Mail, Lock, UserPlus, LogIn,
  CandlestickChart, LineChart, ArrowUpRight, ArrowDownRight,
  Filter, Target, Newspaper, Globe, Building2, Percent, Hash,
  Sun, Moon, Download, Play, Pause, Crosshair, Brain, Radar,
  TrendingUpIcon, Wallet, ShoppingCart, Receipt, Award, Gem
} from 'lucide-react'

// Currency symbols
const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹',
  CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥', SGD: 'S$'
}

// ============================================
// AUTH PAGE
// ============================================
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email, password } : { name, email, password }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      if (response.ok && data.user) {
        localStorage.setItem('stockify_user', JSON.stringify(data.user))
        toast.success(isLogin ? 'Welcome back!' : 'Account created!')
        onLogin(data.user)
      } else {
        toast.error(data.error || 'Authentication failed')
      }
    } catch (error) {
      toast.error('Connection error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <CandlestickChart className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-3xl font-bold gradient-text">Stockify</span>
              <p className="text-xs text-muted-foreground">Oracle Mode Enabled</p>
            </div>
          </div>
          <p className="text-muted-foreground">Powered by JENNIE AI Trading Intelligence</p>
        </div>

        <Card className="glass-strong border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>{isLogin ? 'Access your trading dashboard' : 'Start with $100,000 paper trading'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required={!isLogin} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : isLogin ? <><LogIn className="h-4 w-4 mr-2" />Sign In</> : <><UserPlus className="h-4 w-4 mr-2" />Create Account</>}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-primary hover:underline font-medium">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Brain, label: 'Oracle AI' },
            { icon: CandlestickChart, label: 'Live Charts' },
            { icon: Wallet, label: 'Paper Trade' }
          ].map((f, i) => (
            <div key={i} className="glass rounded-lg p-3">
              <f.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// STOCK CHART WITH INDICATORS
// ============================================
const StockChart = ({ symbol, onClose }) => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const [candles, setCandles] = useState([])
  const [indicators, setIndicators] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [quote, setQuote] = useState(null)
  const [showIndicators, setShowIndicators] = useState({ sma: true, bollinger: false, volume: true })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [candleRes, quoteRes] = await Promise.all([
          fetch(`/api/stocks/candles/${symbol}?days=100`),
          fetch(`/api/stocks/quote/${symbol}`)
        ])
        const candleData = await candleRes.json()
        const quoteData = await quoteRes.json()
        setCandles(candleData.candles || [])
        setIndicators(candleData.indicators || {})
        setQuote(quoteData)
      } catch (error) {
        console.error('Chart error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [symbol])

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    const loadChart = async () => {
      try {
        const { createChart, ColorType } = await import('lightweight-charts')
        if (chartRef.current) chartRef.current.remove()

        const chart = createChart(chartContainerRef.current, {
          layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#9ca3af' },
          grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
          width: chartContainerRef.current.clientWidth,
          height: 350,
          crosshair: { mode: 1, vertLine: { color: 'rgba(59,130,246,0.5)' }, horzLine: { color: 'rgba(59,130,246,0.5)' } },
          timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true },
          rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' }
        })

        const candleSeries = chart.addCandlestickSeries({
          upColor: '#22c55e', downColor: '#ef4444',
          borderUpColor: '#22c55e', borderDownColor: '#ef4444',
          wickUpColor: '#22c55e', wickDownColor: '#ef4444'
        })
        candleSeries.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })))

        // SMA lines
        if (showIndicators.sma && indicators.sma20) {
          const sma20Series = chart.addLineSeries({ color: '#3b82f6', lineWidth: 1 })
          const smaData = candles.slice(-20).map((c, i, arr) => {
            const sum = arr.slice(0, i + 1).reduce((a, b) => a + b.close, 0)
            return { time: c.time, value: sum / (i + 1) }
          })
          if (smaData.length > 0) sma20Series.setData(smaData)
        }

        // Volume
        if (showIndicators.volume) {
          const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            scaleMargins: { top: 0.85, bottom: 0 }
          })
          volumeSeries.setData(candles.map(c => ({
            time: c.time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
          })))
        }

        chart.timeScale().fitContent()
        chartRef.current = chart

        const handleResize = () => {
          if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      } catch (error) {
        console.error('Chart render error:', error)
      }
    }
    loadChart()
    return () => { if (chartRef.current) { chartRef.current.remove(); chartRef.current = null } }
  }, [candles, showIndicators])

  const isPositive = quote?.changePercent >= 0

  return (
    <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
      <div className="p-4 border-b border-border bg-gradient-to-r from-background to-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{symbol}</h2>
                <Badge variant={isPositive ? 'default' : 'destructive'} className={isPositive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {isPositive ? '+' : ''}{quote?.changePercent?.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{quote?.profile?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${quote?.currentPrice?.toFixed(2)}</p>
            <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${quote?.change?.toFixed(2)} today
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Indicator toggles */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={showIndicators.sma} onCheckedChange={(v) => setShowIndicators(p => ({ ...p, sma: v }))} />
            <span>SMA 20</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={showIndicators.volume} onCheckedChange={(v) => setShowIndicators(p => ({ ...p, volume: v }))} />
            <span>Volume</span>
          </label>
        </div>

        {/* Chart */}
        <div className="chart-container rounded-lg overflow-hidden border border-border/50">
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div ref={chartContainerRef} />
          )}
        </div>

        {/* Technical Indicators Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">RSI (14)</p>
            <p className={`text-lg font-bold ${indicators.rsi > 70 ? 'text-red-400' : indicators.rsi < 30 ? 'text-green-400' : ''}`}>
              {indicators.rsi?.toFixed(1) || 'N/A'}
            </p>
            <p className="text-[10px] text-muted-foreground">{indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">MACD</p>
            <p className={`text-lg font-bold ${indicators.macd?.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {indicators.macd?.macdLine?.toFixed(2) || 'N/A'}
            </p>
            <p className="text-[10px] text-muted-foreground">{indicators.macd?.histogram > 0 ? 'Bullish' : 'Bearish'}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">SMA 20</p>
            <p className="text-lg font-bold">${indicators.sma20?.toFixed(2) || 'N/A'}</p>
            <p className="text-[10px] text-muted-foreground">{quote?.currentPrice > indicators.sma20 ? 'Above' : 'Below'}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">SMA 50</p>
            <p className="text-lg font-bold">${indicators.sma50?.toFixed(2) || 'N/A'}</p>
            <p className="text-[10px] text-muted-foreground">{quote?.currentPrice > indicators.sma50 ? 'Above' : 'Below'}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Bollinger</p>
            <p className="text-lg font-bold">${indicators.bollinger?.middle?.toFixed(2) || 'N/A'}</p>
            <p className="text-[10px] text-muted-foreground">Mid Band</p>
          </div>
        </div>

        {/* Price stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="font-semibold">${quote?.open?.toFixed(2)}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">High</p>
            <p className="font-semibold text-green-400">${quote?.high?.toFixed(2)}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="font-semibold text-red-400">${quote?.low?.toFixed(2)}</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Prev Close</p>
            <p className="font-semibold">${quote?.previousClose?.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

// ============================================
// ORACLE MODE PANEL
// ============================================
const OraclePanel = ({ isOpen, onClose, userId }) => {
  const [symbol, setSymbol] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState('analyze')

  const runOracleAnalysis = async () => {
    if (!symbol) { toast.error('Enter a symbol'); return }
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/oracle/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symbol })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
      toast.success('Oracle analysis complete!')
    } catch (error) {
      toast.error('Oracle analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const runMarketScan = async () => {
    setIsScanning(true)
    try {
      const res = await fetch('/api/oracle/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      setOpportunities(data.opportunities || [])
      toast.success(`Found ${data.opportunities?.length || 0} opportunities!`)
    } catch (error) {
      toast.error('Market scan failed')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 md:inset-10 bg-background border border-primary/30 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl shadow-purple-500/20"
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-pink-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold gradient-text">Oracle Mode</h2>
                  <p className="text-xs text-muted-foreground">AI-Powered Trading Intelligence</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-4 grid grid-cols-2">
              <TabsTrigger value="analyze"><Crosshair className="h-4 w-4 mr-2" />Stock Analysis</TabsTrigger>
              <TabsTrigger value="scan"><Radar className="h-4 w-4 mr-2" />Market Scanner</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="flex-1 overflow-auto p-4">
              <div className="flex gap-2 mb-4">
                <Input placeholder="Enter symbol (e.g., AAPL)" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="flex-1" />
                <Button onClick={runOracleAnalysis} disabled={isAnalyzing} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Brain className="h-4 w-4 mr-2" />Analyze</>}
                </Button>
              </div>

              {analysis && (
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <Card className="glass">
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-bold">${analysis.price?.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="glass">
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">RSI</p>
                        <p className={`text-lg font-bold ${analysis.indicators?.rsi > 70 ? 'text-red-400' : analysis.indicators?.rsi < 30 ? 'text-green-400' : ''}`}>
                          {analysis.indicators?.rsi?.toFixed(1)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="glass">
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">MACD</p>
                        <p className={`text-lg font-bold ${analysis.indicators?.macd?.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {analysis.indicators?.macd?.histogram > 0 ? 'Bullish' : 'Bearish'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="glass">
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">Change</p>
                        <p className={`text-lg font-bold ${analysis.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {analysis.changePercent >= 0 ? '+' : ''}{analysis.changePercent?.toFixed(2)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Oracle Analysis */}
                  <Card className="glass border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Gem className="h-4 w-4 text-purple-400" />Oracle Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[400px]">
                          {analysis.oracleAnalysis}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scan" className="flex-1 overflow-auto p-4">
              <div className="mb-4">
                <Button onClick={runMarketScan} disabled={isScanning} className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                  {isScanning ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Scanning Markets...</> : <><Radar className="h-4 w-4 mr-2" />Scan for Opportunities</>}
                </Button>
              </div>

              {opportunities.length > 0 && (
                <div className="space-y-3">
                  {opportunities.map((opp, i) => (
                    <Card key={i} className={`glass ${opp.signal.includes('BUY') ? 'border-green-500/30' : opp.signal.includes('SELL') ? 'border-red-500/30' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${opp.signal.includes('BUY') ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                              {opp.signal.includes('BUY') ? <TrendingUp className="h-5 w-5 text-green-400" /> : <TrendingDown className="h-5 w-5 text-red-400" />}
                            </div>
                            <div>
                              <p className="font-bold">{opp.symbol}</p>
                              <p className="text-xs text-muted-foreground">${opp.price?.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={opp.signal.includes('BUY') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {opp.signal}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Strength: {opp.strength}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{opp.reason}</p>
                        <Progress value={opp.strength} className="mt-2 h-1" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// PAPER TRADING PANEL
// ============================================
const PaperTradingPanel = ({ userId }) => {
  const [balance, setBalance] = useState({ cashBalance: 100000, holdingsValue: 0, totalValue: 100000 })
  const [holdings, setHoldings] = useState([])
  const [trades, setTrades] = useState([])
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isTrading, setIsTrading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, portRes, histRes] = await Promise.all([
          fetch(`/api/paper-trading/balance/${userId}`),
          fetch(`/api/paper-trading/portfolio/${userId}`),
          fetch(`/api/paper-trading/history/${userId}`)
        ])
        const [balData, portData, histData] = await Promise.all([balRes.json(), portRes.json(), histRes.json()])
        setBalance(balData)
        setHoldings(portData.holdings || [])
        setTrades(histData.trades || [])
      } catch (error) {
        console.error('Paper trading fetch error:', error)
      }
    }
    fetchData()
  }, [userId])

  const executeTrade = async (action) => {
    if (!symbol || !quantity) { toast.error('Enter symbol and quantity'); return }
    setIsTrading(true)
    try {
      const res = await fetch('/api/paper-trading/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symbol, quantity, action })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`${action.toUpperCase()} order executed at $${data.price.toFixed(2)}`)
      // Refresh data
      const [balRes, portRes] = await Promise.all([
        fetch(`/api/paper-trading/balance/${userId}`),
        fetch(`/api/paper-trading/portfolio/${userId}`)
      ])
      setBalance(await balRes.json())
      setHoldings((await portRes.json()).holdings || [])
      setSymbol('')
      setQuantity('')
    } catch (error) {
      toast.error(error.message || 'Trade failed')
    } finally {
      setIsTrading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Play className="h-6 w-6 text-green-400" />Paper Trading
        </h1>
        <Badge variant="outline" className="text-green-400 border-green-400/30">Simulation Mode</Badge>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass border-green-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cash Balance</p>
            <p className="text-2xl font-bold text-green-400">${balance.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="glass border-blue-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Holdings Value</p>
            <p className="text-2xl font-bold text-blue-400">${balance.holdingsValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card className="glass border-purple-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Portfolio</p>
            <p className="text-2xl font-bold text-purple-400">${balance.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trade Form */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Execute Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="flex-1" />
            <Input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-32" />
            <Button onClick={() => executeTrade('buy')} disabled={isTrading} className="bg-green-600 hover:bg-green-700">
              <ShoppingCart className="h-4 w-4 mr-1" />Buy
            </Button>
            <Button onClick={() => executeTrade('sell')} disabled={isTrading} variant="destructive">
              <Receipt className="h-4 w-4 mr-1" />Sell
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Holdings */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Paper Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length > 0 ? (
            <div className="space-y-2">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium">{h.symbol}</p>
                    <p className="text-xs text-muted-foreground">{h.quantity} shares @ ${h.avgPrice?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${h.currentValue?.toFixed(2)}</p>
                    <p className={`text-xs ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {h.pnl >= 0 ? '+' : ''}{h.pnlPercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No paper holdings yet. Start trading!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// SETTINGS PANEL
// ============================================
const SettingsPanel = ({ user, onUpdate, onLogout }) => {
  const [settings, setSettings] = useState(user?.settings || { theme: 'dark', currency: 'USD', notifications: true })
  const [isSaving, setIsSaving] = useState(false)

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, settings })
      })
      onUpdate({ ...user, settings })
      toast.success('Settings saved!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const exportPortfolio = async () => {
    try {
      const res = await fetch(`/api/portfolio/export/${user.id}`)
      const data = await res.json()
      const blob = new Blob([data.csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stockify_portfolio_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast.success('Portfolio exported!')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6" />Settings
      </h1>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>Dark Mode</span>
            </div>
            <Switch checked={settings.theme === 'dark'} onCheckedChange={(v) => setSettings(s => ({ ...s, theme: v ? 'dark' : 'light' }))} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={settings.currency} onValueChange={(v) => setSettings(s => ({ ...s, currency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                <SelectItem key={code} value={code}>{sym} {code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Price Alerts</span>
            <Switch checked={settings.notifications} onCheckedChange={(v) => setSettings(s => ({ ...s, notifications: v }))} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={exportPortfolio} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />Export Portfolio to CSV
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={saveSettings} disabled={isSaving} className="flex-1">
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Settings'}
        </Button>
        <Button onClick={onLogout} variant="destructive">
          <LogOut className="h-4 w-4 mr-2" />Logout
        </Button>
      </div>
    </div>
  )
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [user, setUser] = useState(null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isOracleOpen, setIsOracleOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [trendingStocks, setTrendingStocks] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [portfolio, setPortfolio] = useState({ holdings: [], totalValue: 0, totalPnL: 0 })
  const [news, setNews] = useState([])
  const [movers, setMovers] = useState({ gainers: [], losers: [] })
  const [sectors, setSectors] = useState([])
  const [indices, setIndices] = useState([])
  const [chartSymbol, setChartSymbol] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [currencyRates, setCurrencyRates] = useState({})

  useEffect(() => {
    const savedUser = localStorage.getItem('stockify_user')
    if (savedUser) setUser(JSON.parse(savedUser))
    setIsAuthChecked(true)
    fetch('/api/currency/rates').then(r => r.json()).then(d => setCurrencyRates(d.rates || {})).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.settings?.currency) setCurrency(user.settings.currency)
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [trendingRes, watchlistRes, portfolioRes, newsRes, moversRes, sectorsRes, indicesRes, alertsRes] = await Promise.all([
          fetch('/api/stocks/trending'),
          fetch(`/api/watchlist/${user.id}`),
          fetch(`/api/portfolio/${user.id}`),
          fetch('/api/stocks/news'),
          fetch('/api/market/movers'),
          fetch('/api/market/sectors'),
          fetch('/api/market/indices'),
          fetch(`/api/alerts/${user.id}`)
        ])
        const [trending, watchlistData, portfolioData, newsData, moversData, sectorsData, indicesData, alertsData] = await Promise.all([
          trendingRes.json(), watchlistRes.json(), portfolioRes.json(), newsRes.json(), moversRes.json(), sectorsRes.json(), indicesRes.json(), alertsRes.json()
        ])
        setTrendingStocks(trending.stocks || [])
        setWatchlist(watchlistData.stocks || [])
        setPortfolio(portfolioData)
        setNews(newsData.news || [])
        setMovers(moversData)
        setSectors(sectorsData.sectors || [])
        setIndices(indicesData.indices || [])
        setAlerts(alertsData.alerts || [])
      } catch (error) { console.error('Fetch error:', error) }
      finally { setIsLoading(false) }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleSearch = useCallback(async (query) => {
    if (!query) { setSearchResults([]); return }
    try {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (error) { console.error('Search error:', error) }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => handleSearch(searchQuery), 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, handleSearch])

  const convertCurrency = (usdAmount) => {
    const rate = currencyRates[currency] || 1
    return (usdAmount * rate).toFixed(2)
  }

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$'

  const addToWatchlist = async (symbol) => {
    await fetch('/api/watchlist/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, symbol }) })
    toast.success(`${symbol} added`)
    const res = await fetch(`/api/watchlist/${user.id}`)
    setWatchlist((await res.json()).stocks || [])
  }

  const removeFromWatchlist = async (symbol) => {
    await fetch('/api/watchlist/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, symbol }) })
    toast.success(`${symbol} removed`)
    setWatchlist(prev => prev.filter(s => s.symbol !== symbol))
  }

  const addToPortfolio = async (symbol, quantity, avgPrice) => {
    await fetch('/api/portfolio/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, symbol, quantity, avgPrice }) })
    toast.success(`${symbol} added to portfolio`)
    const res = await fetch(`/api/portfolio/${user.id}`)
    setPortfolio(await res.json())
  }

  const removeFromPortfolio = async (holdingId) => {
    await fetch('/api/portfolio/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, holdingId }) })
    toast.success('Removed')
    const res = await fetch(`/api/portfolio/${user.id}`)
    setPortfolio(await res.json())
  }

  const handleLogout = () => {
    localStorage.removeItem('stockify_user')
    setUser(null)
    toast.success('Logged out')
  }

  const isWatched = (symbol) => watchlist.some(s => s.symbol === symbol)

  if (!isAuthChecked) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
  if (!user) return <AuthPage onLogin={setUser} />

  return (
    <div className={`min-h-screen bg-background ${user?.settings?.theme === 'light' ? 'light' : ''}`}>
      {/* Market Ticker */}
      <div className="glass-strong border-b border-border py-2 px-4 overflow-x-auto">
        <div className="flex items-center gap-6 min-w-max">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />Markets</span>
          {indices.map((idx) => (
            <div key={idx.symbol} className="flex items-center gap-2">
              <span className="text-sm font-medium">{idx.name}</span>
              <span className="text-sm">{currencySymbol}{convertCurrency(idx.price)}</span>
              <span className={`text-xs ${idx.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-5 w-5" /></Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <CandlestickChart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text hidden sm:inline">Stockify</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search stocks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50" />
            {searchResults.length > 0 && searchQuery && (
              <Card className="absolute top-full mt-2 w-full z-50 glass">
                <ScrollArea className="max-h-64">
                  {searchResults.map((result) => (
                    <div key={result.symbol} className="p-3 hover:bg-secondary cursor-pointer border-b border-border/50 last:border-0 flex items-center justify-between" onClick={() => { setChartSymbol(result.symbol); setSearchQuery(''); setSearchResults([]) }}>
                      <div>
                        <p className="font-medium">{result.symbol}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{result.description}</p>
                      </div>
                      <CandlestickChart className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </ScrollArea>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsOracleOpen(true)} className="relative">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full animate-pulse" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(true)}><MessageSquare className="h-5 w-5" /></Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-[88px] left-0 h-[calc(100vh-88px)] w-60 bg-background border-r border-border z-30 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
              { id: 'watchlist', icon: Star, label: 'Watchlist' },
              { id: 'paper-trading', icon: Play, label: 'Paper Trading', badge: 'NEW' },
              { id: 'screener', icon: Filter, label: 'Screener' },
              { id: 'news', icon: Newspaper, label: 'News' },
              { id: 'alerts', icon: Bell, label: 'Alerts' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <Button key={item.id} variant={activeTab === item.id ? 'secondary' : 'ghost'} className="w-full justify-start h-10" onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}>
                <item.icon className="h-4 w-4 mr-3" />{item.label}
                {item.badge && <Badge className="ml-auto text-[10px] bg-gradient-to-r from-purple-500 to-pink-500">{item.badge}</Badge>}
              </Button>
            ))}
          </nav>

          <div className="p-3 mt-2">
            <Card className="glass border-purple-500/30 cursor-pointer card-hover" onClick={() => setIsOracleOpen(true)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <span className="font-bold text-sm gradient-text">Oracle Mode</span>
                </div>
                <p className="text-xs text-muted-foreground">AI-powered trade signals</p>
              </CardContent>
            </Card>
          </div>

          <div className="p-3">
            <Card className="glass">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Portfolio ({currency})</p>
                <p className="text-xl font-bold">{currencySymbol}{convertCurrency(portfolio.totalValue || 0)}</p>
                <div className={`flex items-center gap-1 mt-1 ${portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio.totalPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-sm font-medium">{portfolio.totalPnL >= 0 ? '+' : ''}{currencySymbol}{convertCurrency(portfolio.totalPnL || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-88px)]">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'Trader'}</h1>
                  <p className="text-muted-foreground text-sm">Real-time market data • Currency: {currency}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full pulse-dot"></span>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass card-hover">
                  <CardContent className="p-4">
                    <DollarSign className="h-5 w-5 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold">{currencySymbol}{convertCurrency(portfolio.totalValue || 0)}</p>
                    <p className="text-xs text-muted-foreground">Portfolio Value</p>
                  </CardContent>
                </Card>
                <Card className="glass card-hover">
                  <CardContent className="p-4">
                    <Activity className={`h-5 w-5 mb-2 ${portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                    <p className={`text-2xl font-bold ${portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolio.totalPnL >= 0 ? '+' : ''}{currencySymbol}{convertCurrency(portfolio.totalPnL || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total P&L</p>
                  </CardContent>
                </Card>
                <Card className="glass card-hover">
                  <CardContent className="p-4">
                    <PieChart className="h-5 w-5 text-purple-400 mb-2" />
                    <p className="text-2xl font-bold">{portfolio.holdings?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Holdings</p>
                  </CardContent>
                </Card>
                <Card className="glass card-hover">
                  <CardContent className="p-4">
                    <Star className="h-5 w-5 text-yellow-400 mb-2" />
                    <p className="text-2xl font-bold">{watchlist.length}</p>
                    <p className="text-xs text-muted-foreground">Watchlist</p>
                  </CardContent>
                </Card>
              </div>

              {/* Market Movers */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-400" />Top Gainers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {movers.gainers?.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer" onClick={() => setChartSymbol(stock.symbol)}>
                        <span className="font-medium">{stock.symbol}</span>
                        <div className="text-right">
                          <span className="font-medium">{currencySymbol}{convertCurrency(stock.price)}</span>
                          <span className="text-green-400 text-sm ml-2">+{stock.changePercent?.toFixed(2)}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-400" />Top Losers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {movers.losers?.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer" onClick={() => setChartSymbol(stock.symbol)}>
                        <span className="font-medium">{stock.symbol}</span>
                        <div className="text-right">
                          <span className="font-medium">{currencySymbol}{convertCurrency(stock.price)}</span>
                          <span className="text-red-400 text-sm ml-2">{stock.changePercent?.toFixed(2)}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sectors */}
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Sector Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {sectors.slice(0, 6).map((sector) => (
                      <div key={sector.symbol} className="p-3 rounded-lg bg-secondary/30 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{sector.name}</p>
                        <p className={`font-semibold ${sector.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent?.toFixed(2)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-400" />Popular Stocks</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isLoading ? Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="glass"><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-24" /><Skeleton className="h-4 w-12" /></CardContent></Card>
                  )) : trendingStocks.map((stock) => (
                    <Card key={stock.symbol} className="glass card-hover cursor-pointer" onClick={() => setChartSymbol(stock.symbol)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{stock.symbol}</h3>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); isWatched(stock.symbol) ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol) }}>
                            {isWatched(stock.symbol) ? <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-3 w-3" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                        <p className="text-xl font-bold mt-2">{currencySymbol}{convertCurrency(stock.currentPrice)}</p>
                        <div className={`flex items-center gap-1 mt-1 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span className="text-sm font-medium">{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Your Portfolio</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass col-span-2">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Value ({currency})</p>
                    <p className="text-4xl font-bold mt-1">{currencySymbol}{convertCurrency(portfolio.totalValue || 0)}</p>
                    <div className={`flex items-center gap-2 mt-2 ${portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolio.totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      <span className="text-lg font-medium">
                        {portfolio.totalPnL >= 0 ? '+' : ''}{currencySymbol}{convertCurrency(portfolio.totalPnL || 0)} ({portfolio.totalPnLPercent?.toFixed(2)}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Invested</p><p className="text-2xl font-bold mt-1">{currencySymbol}{convertCurrency(portfolio.totalInvested || 0)}</p></CardContent></Card>
                <Card className="glass"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Day P&L</p><p className={`text-2xl font-bold mt-1 ${portfolio.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{portfolio.dayPnL >= 0 ? '+' : ''}{currencySymbol}{convertCurrency(portfolio.dayPnL || 0)}</p></CardContent></Card>
              </div>
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Holdings</CardTitle>
                  <Button variant="outline" size="sm" onClick={async () => {
                    const res = await fetch(`/api/portfolio/export/${user.id}`)
                    const data = await res.json()
                    const blob = new Blob([data.csv], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'portfolio.csv'; a.click()
                    toast.success('Exported!')
                  }}>
                    <Download className="h-4 w-4 mr-2" />Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {portfolio.holdings?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-left text-sm text-muted-foreground"><th className="py-3 px-2">Symbol</th><th className="py-3 px-2 text-right">Qty</th><th className="py-3 px-2 text-right">Avg</th><th className="py-3 px-2 text-right">Current</th><th className="py-3 px-2 text-right">Value</th><th className="py-3 px-2 text-right">P&L</th><th className="py-3 px-2"></th></tr></thead>
                        <tbody>
                          {portfolio.holdings.map((h) => (
                            <tr key={h.id} className="border-b border-border/50 hover:bg-secondary/30">
                              <td className="py-3 px-2"><button onClick={() => setChartSymbol(h.symbol)} className="font-medium hover:text-primary">{h.symbol}</button></td>
                              <td className="py-3 px-2 text-right">{h.quantity}</td>
                              <td className="py-3 px-2 text-right">{currencySymbol}{convertCurrency(h.avgPrice)}</td>
                              <td className="py-3 px-2 text-right">{currencySymbol}{convertCurrency(h.currentPrice)}</td>
                              <td className="py-3 px-2 text-right font-medium">{currencySymbol}{convertCurrency(h.currentValue)}</td>
                              <td className={`py-3 px-2 text-right ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                <div>{h.pnl >= 0 ? '+' : ''}{currencySymbol}{convertCurrency(h.pnl)}</div>
                                <div className="text-xs">({h.pnlPercent?.toFixed(2)}%)</div>
                              </td>
                              <td className="py-3 px-2 text-right"><Button variant="ghost" size="sm" onClick={() => removeFromPortfolio(h.id)}><Minus className="h-4 w-4" /></Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12"><Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No holdings. Search for stocks to add.</p></div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Watchlist</h1>
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {watchlist.map((stock) => (
                    <Card key={stock.symbol} className="glass card-hover cursor-pointer" onClick={() => setChartSymbol(stock.symbol)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{stock.symbol}</h3>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeFromWatchlist(stock.symbol) }}>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </Button>
                        </div>
                        <p className="text-xl font-bold">{currencySymbol}{convertCurrency(stock.currentPrice)}</p>
                        <div className={`flex items-center gap-1 mt-1 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span className="text-sm">{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass"><CardContent className="text-center py-12"><Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Empty watchlist. Click star on stocks to add.</p></CardContent></Card>
              )}
            </div>
          )}

          {activeTab === 'paper-trading' && <PaperTradingPanel userId={user.id} />}

          {activeTab === 'screener' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Stock Screener</h1>
              <ScreenerPanel onSelectStock={setChartSymbol} currency={currency} convertCurrency={convertCurrency} currencySymbol={currencySymbol} />
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Market News</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {news.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                    <Card className="glass card-hover h-full">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {item.image && <img src={item.image} alt="" className="w-24 h-24 object-cover rounded-lg" />}
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-2 mb-2">{item.headline}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.summary}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{item.source}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(item.datetime * 1000).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Price Alerts</h1>
                <Dialog>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Alert</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Price Alert</DialogTitle></DialogHeader>
                    <CreateAlertForm userId={user.id} onSuccess={async () => { toast.success('Created'); const res = await fetch(`/api/alerts/${user.id}`); setAlerts((await res.json()).alerts || []) }} />
                  </DialogContent>
                </Dialog>
              </div>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="glass">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><Target className="h-5 w-5" /></div>
                          <div>
                            <p className="font-medium">{alert.symbol}</p>
                            <p className="text-sm text-muted-foreground">Alert when price goes {alert.condition} {currencySymbol}{convertCurrency(alert.targetPrice)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={async () => { await fetch('/api/alerts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alertId: alert.id }) }); setAlerts(p => p.filter(a => a.id !== alert.id)); toast.success('Deleted') }}><X className="h-4 w-4" /></Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass"><CardContent className="text-center py-12"><Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No alerts. Create one to get notified.</p></CardContent></Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && <SettingsPanel user={user} onUpdate={(u) => { setUser(u); localStorage.setItem('stockify_user', JSON.stringify(u)) }} onLogout={handleLogout} />}
        </main>
      </div>

      {/* Oracle Panel */}
      <OraclePanel isOpen={isOracleOpen} onClose={() => setIsOracleOpen(false)} userId={user?.id} />

      {/* AI Chat */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userId={user?.id} />

      {/* Chat FAB */}
      {!isChatOpen && !isOracleOpen && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg flex items-center justify-center z-50">
          <Bot className="h-6 w-6 text-white" />
        </motion.button>
      )}

      {/* Chart Modal */}
      <Dialog open={!!chartSymbol} onOpenChange={(open) => !open && setChartSymbol(null)}>
        {chartSymbol && <StockChart symbol={chartSymbol} onClose={() => setChartSymbol(null)} />}
      </Dialog>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

// ============================================
// AI CHAT PANEL - JENNIE
// ============================================
function AIChatPanel({ isOpen, onClose, userId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          message: userMessage, 
          userId,
          conversationHistory: messages.slice(-6) // Send last 6 messages for context
        }) 
      })
      const data = await res.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'I apologize, I encountered an error. Please try again! 💫' 
      }])
      if (!data.response) toast.error('JENNIE is temporarily unavailable')
    } catch { 
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having connection issues. Please check your internet and try again! 🔄" 
      }]) 
      toast.error('Connection error')
    }
    finally { setIsLoading(false) }
  }

  const suggestedQuestions = [
    '📊 Analyze TSLA for me',
    '🔥 What are the top gainers today?',
    '💼 Review my portfolio performance',
    '🎯 Best stocks to watch this week?',
    '📚 Explain RSI indicator',
    '💡 Give me a trading strategy'
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-border glass-strong">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse-slow">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background pulse-dot"></span>
                </div>
                <div>
                  <h3 className="font-bold text-lg gradient-text">JENNIE</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="h-2 w-2 bg-green-500 rounded-full pulse-dot"></span>
                    Always here for you
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">Your personal AI trading companion 💎</p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/30">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h4 className="font-bold text-xl mb-2 gradient-text">Hey there! I'm JENNIE 👋</h4>
                <p className="text-sm text-muted-foreground mb-6 px-4">Your AI trading companion with ChatGPT-level intelligence. Ask me anything about stocks, markets, or your portfolio!</p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-left hover:bg-primary/10 transition-all"
                      onClick={() => setInput(q.replace(/^[📊🔥💼🎯📚💡]\s*/, ''))}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{q}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0 shadow-lg">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-secondary/80 backdrop-blur'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center ml-2 flex-shrink-0 shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 shadow-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-secondary/80 backdrop-blur rounded-2xl p-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => <span key={d} className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">JENNIE is thinking...</p>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border glass-strong">
            <div className="flex gap-2">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask JENNIE anything..." 
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} 
                className="flex-1 bg-secondary/50"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">JENNIE provides educational guidance, not financial advice</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// SCREENER PANEL
// ============================================
function ScreenerPanel({ onSelectStock, currency, convertCurrency, currencySymbol }) {
  const [filters, setFilters] = useState({})
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const runScreener = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/screener', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters) })
      setResults((await res.json()).stocks || [])
    } catch { toast.error('Screener failed') }
    finally { setIsLoading(false) }
  }

  return (
    <div className="space-y-4">
      <Card className="glass">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><Label className="text-xs">Min Price ({currency})</Label><Input type="number" placeholder="0" onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))} /></div>
            <div><Label className="text-xs">Max Price ({currency})</Label><Input type="number" placeholder="1000" onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))} /></div>
            <div><Label className="text-xs">Min Change %</Label><Input type="number" placeholder="-10" onChange={(e) => setFilters(f => ({ ...f, minChange: e.target.value }))} /></div>
            <div><Label className="text-xs">Max Change %</Label><Input type="number" placeholder="10" onChange={(e) => setFilters(f => ({ ...f, maxChange: e.target.value }))} /></div>
            <div><Label className="text-xs">RSI Range</Label><div className="flex gap-1"><Input type="number" placeholder="0" onChange={(e) => setFilters(f => ({ ...f, minRSI: e.target.value }))} /><Input type="number" placeholder="100" onChange={(e) => setFilters(f => ({ ...f, maxRSI: e.target.value }))} /></div></div>
          </div>
          <Button className="w-full mt-4" onClick={runScreener} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Filter className="h-4 w-4 mr-2" />}Run Screener
          </Button>
        </CardContent>
      </Card>
      {results.length > 0 && (
        <Card className="glass">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-sm"><th className="py-2 px-2 text-left">Symbol</th><th className="py-2 px-2 text-left">Name</th><th className="py-2 px-2 text-right">Price</th><th className="py-2 px-2 text-right">Change</th><th className="py-2 px-2 text-right">RSI</th></tr></thead>
                <tbody>
                  {results.map((stock) => (
                    <tr key={stock.symbol} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer" onClick={() => onSelectStock(stock.symbol)}>
                      <td className="py-2 px-2 font-medium">{stock.symbol}</td>
                      <td className="py-2 px-2 text-sm text-muted-foreground truncate max-w-[150px]">{stock.name}</td>
                      <td className="py-2 px-2 text-right">{currencySymbol}{convertCurrency(stock.price)}</td>
                      <td className={`py-2 px-2 text-right ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%</td>
                      <td className={`py-2 px-2 text-right ${stock.rsi > 70 ? 'text-red-400' : stock.rsi < 30 ? 'text-green-400' : ''}`}>{stock.rsi?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// CREATE ALERT FORM
// ============================================
function CreateAlertForm({ userId, onSuccess }) {
  const [symbol, setSymbol] = useState('')
  const [condition, setCondition] = useState('above')
  const [targetPrice, setTargetPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!symbol || !targetPrice) { toast.error('Fill all fields'); return }
    setIsLoading(true)
    try {
      await fetch('/api/alerts/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, symbol, condition, targetPrice }) })
      onSuccess()
    } catch { toast.error('Failed') }
    finally { setIsLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div><Label>Symbol</Label><Input placeholder="AAPL" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} /></div>
      <div><Label>Condition</Label><Select value={condition} onValueChange={setCondition}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="above">Price goes above</SelectItem><SelectItem value="below">Price goes below</SelectItem></SelectContent></Select></div>
      <div><Label>Target Price ($)</Label><Input type="number" step="0.01" placeholder="150.00" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} /></div>
      <DialogFooter><Button onClick={handleSubmit} disabled={isLoading} className="w-full">{isLoading ? 'Creating...' : 'Create Alert'}</Button></DialogFooter>
    </div>
  )
}
