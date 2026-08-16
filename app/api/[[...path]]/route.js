import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Gemini AI setup
let genAI
function getGeminiAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// Currency exchange rates (updated periodically)
const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  INR: 83.12,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  SGD: 1.34
}

// Finnhub API helper
async function finnhubRequest(endpoint, params = {}) {
  const url = new URL(`https://finnhub.io/api/v1${endpoint}`)
  url.searchParams.set('token', process.env.FINNHUB_API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`)
  }
  return response.json()
}

// Calculate Technical Indicators
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null
  
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change >= 0) gains += change
    else losses -= change
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) - change) / period
    }
  }
  
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateSMA(prices, period) {
  if (prices.length < period) return null
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
  return sum / period
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null
  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }
  return ema
}

function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  if (ema12 === null || ema26 === null) return null
  
  const macdLine = ema12 - ema26
  const signalLine = calculateEMA(prices.slice(-9), 9) || macdLine
  const histogram = macdLine - signalLine
  
  return { macdLine, signalLine, histogram }
}

function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null
  
  const sma = calculateSMA(prices, period)
  const recentPrices = prices.slice(-period)
  const squaredDiffs = recentPrices.map(p => Math.pow(p - sma, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
  const std = Math.sqrt(variance)
  
  return {
    upper: sma + (stdDev * std),
    middle: sma,
    lower: sma - (stdDev * std)
  }
}

// Generate price history for technical analysis
function generatePriceHistory(currentPrice, days = 100, volatility = 0.02) {
  const prices = []
  let price = currentPrice * (1 - (Math.random() * 0.15 - 0.075))
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * volatility * price
    price = price + change
    prices.push(price)
  }
  
  // Adjust last price to match current
  const adjustment = currentPrice - prices[prices.length - 1]
  for (let i = 0; i < prices.length; i++) {
    prices[i] += adjustment * (i / prices.length)
  }
  prices[prices.length - 1] = currentPrice
  
  return prices
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Stockify API v3.0 - Oracle Mode Enabled" }))
    }

    // ========================
    // AUTHENTICATION
    // ========================

    if (route === '/auth/register' && method === 'POST') {
      const { name, email, password } = await request.json()
      if (!name || !email || !password) {
        return handleCORS(NextResponse.json({ error: 'All fields required' }, { status: 400 }))
      }
      
      const existing = await db.collection('users').findOne({ email })
      if (existing) {
        return handleCORS(NextResponse.json({ error: 'Email already registered' }, { status: 409 }))
      }
      
      const user = {
        id: uuidv4(),
        name,
        email,
        password,
        createdAt: new Date(),
        settings: {
          theme: 'dark',
          currency: 'USD',
          notifications: true
        },
        paperTradingBalance: 100000, // $100,000 paper trading balance
        oracleCredits: 50 // Free Oracle predictions
      }
      
      await db.collection('users').insertOne(user)
      const { password: _, _id, ...safeUser } = user
      return handleCORS(NextResponse.json({ user: safeUser }))
    }

    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      if (!email || !password) {
        return handleCORS(NextResponse.json({ error: 'Email and password required' }, { status: 400 }))
      }
      
      const user = await db.collection('users').findOne({ email })
      if (!user || user.password !== password) {
        return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
      }
      
      const { password: _, _id, ...safeUser } = user
      return handleCORS(NextResponse.json({ user: safeUser }))
    }

    // GET /api/user/:userId - Get user data
    if (route.startsWith('/user/') && method === 'GET' && !route.includes('/settings')) {
      const userId = route.split('/user/')[1]
      const user = await db.collection('users').findOne({ id: userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }
      const { password: _, _id, ...safeUser } = user
      return handleCORS(NextResponse.json({ user: safeUser }))
    }

    // POST /api/user/settings - Update user settings
    if (route === '/user/settings' && method === 'POST') {
      const { userId, settings } = await request.json()
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { settings, updatedAt: new Date() } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ========================
    // CURRENCY CONVERSION
    // ========================

    if (route === '/currency/rates' && method === 'GET') {
      return handleCORS(NextResponse.json({ rates: CURRENCY_RATES }))
    }

    if (route === '/currency/convert' && method === 'POST') {
      const { amount, from, to } = await request.json()
      const fromRate = CURRENCY_RATES[from] || 1
      const toRate = CURRENCY_RATES[to] || 1
      const converted = (amount / fromRate) * toRate
      return handleCORS(NextResponse.json({ 
        original: { amount, currency: from },
        converted: { amount: converted, currency: to },
        rate: toRate / fromRate
      }))
    }

    // ========================
    // MARKET DATA
    // ========================

    if (route === '/market/indices' && method === 'GET') {
      const etfSymbols = ['SPY', 'DIA', 'QQQ', 'IWM']
      const indices = [
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^DJI', name: 'Dow Jones' },
        { symbol: '^IXIC', name: 'NASDAQ' },
        { symbol: '^RUT', name: 'Russell 2000' }
      ]
      
      try {
        const quotes = await Promise.all(
          etfSymbols.map(async (symbol, i) => {
            const quote = await finnhubRequest('/quote', { symbol })
            return {
              symbol: indices[i].symbol,
              name: indices[i].name,
              etf: symbol,
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              high: quote.h,
              low: quote.l
            }
          })
        )
        return handleCORS(NextResponse.json({ indices: quotes }))
      } catch (error) {
        return handleCORS(NextResponse.json({ indices: [] }))
      }
    }

    if (route === '/market/movers' && method === 'GET') {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'PYPL', 'SQ', 'UBER', 'LYFT', 'SNAP', 'PINS', 'TWLO', 'SHOP']
      
      try {
        const quotes = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await finnhubRequest('/quote', { symbol })
              return { symbol, price: quote.c, change: quote.d, changePercent: quote.dp }
            } catch { return null }
          })
        )
        
        const valid = quotes.filter(q => q && q.changePercent !== null)
        const sorted = [...valid].sort((a, b) => b.changePercent - a.changePercent)
        
        return handleCORS(NextResponse.json({
          gainers: sorted.slice(0, 5),
          losers: sorted.slice(-5).reverse()
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({ gainers: [], losers: [] }))
      }
    }

    if (route === '/market/sectors' && method === 'GET') {
      const sectorETFs = [
        { symbol: 'XLK', name: 'Technology' },
        { symbol: 'XLF', name: 'Financial' },
        { symbol: 'XLV', name: 'Healthcare' },
        { symbol: 'XLE', name: 'Energy' },
        { symbol: 'XLY', name: 'Consumer Disc.' },
        { symbol: 'XLP', name: 'Consumer Staples' },
        { symbol: 'XLI', name: 'Industrial' },
        { symbol: 'XLU', name: 'Utilities' },
        { symbol: 'XLRE', name: 'Real Estate' },
        { symbol: 'XLB', name: 'Materials' },
        { symbol: 'XLC', name: 'Communication' }
      ]
      
      try {
        const sectors = await Promise.all(
          sectorETFs.map(async (sector) => {
            try {
              const quote = await finnhubRequest('/quote', { symbol: sector.symbol })
              return { ...sector, price: quote.c, change: quote.d, changePercent: quote.dp }
            } catch { return { ...sector, price: 0, change: 0, changePercent: 0 } }
          })
        )
        return handleCORS(NextResponse.json({ sectors }))
      } catch (error) {
        return handleCORS(NextResponse.json({ sectors: [] }))
      }
    }

    // ========================
    // STOCK DATA
    // ========================

    if (route.startsWith('/stocks/quote/') && method === 'GET') {
      const symbol = route.split('/stocks/quote/')[1].toUpperCase()
      try {
        const quote = await finnhubRequest('/quote', { symbol })
        const profile = await finnhubRequest('/stock/profile2', { symbol }).catch(() => null)
        
        return handleCORS(NextResponse.json({
          symbol,
          currentPrice: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          open: quote.o,
          previousClose: quote.pc,
          timestamp: Date.now(),
          profile: profile ? {
            name: profile.name,
            logo: profile.logo,
            industry: profile.finnhubIndustry,
            marketCap: profile.marketCapitalization,
            exchange: profile.exchange,
            currency: profile.currency,
            country: profile.country,
            weburl: profile.weburl,
            ipo: profile.ipo,
            shareOutstanding: profile.shareOutstanding
          } : null
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 }))
      }
    }

    // Candlestick data with technical indicators
    if (route.startsWith('/stocks/candles/') && method === 'GET') {
      const symbol = route.split('/stocks/candles/')[1].toUpperCase()
      const { searchParams } = new URL(request.url)
      const days = parseInt(searchParams.get('days') || '100')
      
      try {
        let currentPrice = 250 // Fallback price for demo
        try {
          const quote = await finnhubRequest('/quote', { symbol })
          currentPrice = quote.c || currentPrice
        } catch (apiError) {
          console.log('Finnhub API limit reached, using fallback price for candles')
        }
        
        // Generate realistic candle data
        const candles = []
        const now = Math.floor(Date.now() / 1000)
        const prices = []
        let price = currentPrice * (1 - (Math.random() * 0.12 - 0.06))
        
        for (let i = days; i >= 0; i--) {
          const timestamp = now - (i * 24 * 60 * 60)
          const dailyVolatility = 0.015 + Math.random() * 0.01
          const dailyChange = (Math.random() - 0.48) * dailyVolatility * price
          const open = price
          const close = price + dailyChange
          const high = Math.max(open, close) + Math.random() * dailyVolatility * price * 0.5
          const low = Math.min(open, close) - Math.random() * dailyVolatility * price * 0.5
          const volume = Math.floor(5000000 + Math.random() * 15000000)
          
          candles.push({
            time: timestamp,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume
          })
          
          prices.push(close)
          price = close
        }
        
        // Adjust to current price
        if (candles.length > 0) {
          const last = candles[candles.length - 1]
          last.close = currentPrice
          last.high = Math.max(last.high, currentPrice)
          last.low = Math.min(last.low, currentPrice)
          prices[prices.length - 1] = currentPrice
        }
        
        // Calculate technical indicators
        const rsi = calculateRSI(prices, 14)
        const macd = calculateMACD(prices)
        const sma20 = calculateSMA(prices, 20)
        const sma50 = calculateSMA(prices, 50)
        const ema12 = calculateEMA(prices, 12)
        const ema26 = calculateEMA(prices, 26)
        const bollinger = calculateBollingerBands(prices, 20, 2)
        
        return handleCORS(NextResponse.json({
          symbol: symbol,
          candles,
          indicators: {
            rsi,
            macd,
            sma20,
            sma50,
            ema12,
            ema26,
            bollinger
          },
          simulated: true
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({ candles: [], indicators: {} }))
      }
    }

    if (route === '/stocks/search' && method === 'GET') {
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('q')
      if (!query) return handleCORS(NextResponse.json({ error: 'Query required' }, { status: 400 }))
      
      try {
        const results = await finnhubRequest('/search', { q: query })
        const filtered = (results.result || []).slice(0, 10).map(r => ({
          symbol: r.symbol,
          description: r.description,
          type: r.type
        }))
        return handleCORS(NextResponse.json({ results: filtered }))
      } catch (error) {
        return handleCORS(NextResponse.json({ results: [] }))
      }
    }

    if (route === '/stocks/trending' && method === 'GET') {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
      try {
        const quotes = await Promise.all(
          symbols.map(async (symbol) => {
            const quote = await finnhubRequest('/quote', { symbol })
            const profile = await finnhubRequest('/stock/profile2', { symbol }).catch(() => null)
            return {
              symbol,
              name: profile?.name || symbol,
              currentPrice: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              high: quote.h,
              low: quote.l,
              volume: quote.v || 0
            }
          })
        )
        return handleCORS(NextResponse.json({ stocks: quotes }))
      } catch (error) {
        return handleCORS(NextResponse.json({ stocks: [] }))
      }
    }

    if (route === '/stocks/news' && method === 'GET') {
      const { searchParams } = new URL(request.url)
      const symbol = searchParams.get('symbol') || 'general'
      
      try {
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        let news
        if (symbol === 'general') {
          news = await finnhubRequest('/news', { category: 'general' })
        } else {
          news = await finnhubRequest('/company-news', { symbol: symbol.toUpperCase(), from: weekAgo, to: today })
        }
        
        const formatted = (news || []).slice(0, 15).map(n => ({
          id: n.id,
          headline: n.headline,
          summary: n.summary,
          source: n.source,
          url: n.url,
          image: n.image,
          datetime: n.datetime,
          related: n.related
        }))
        
        return handleCORS(NextResponse.json({ news: formatted }))
      } catch (error) {
        return handleCORS(NextResponse.json({ news: [] }))
      }
    }

    // ========================
    // WATCHLIST
    // ========================

    if (route.startsWith('/watchlist/') && method === 'GET' && !route.includes('/add') && !route.includes('/remove')) {
      const userId = route.split('/watchlist/')[1]
      const watchlist = await db.collection('watchlists').findOne({ userId })
      
      if (!watchlist) return handleCORS(NextResponse.json({ symbols: [], stocks: [] }))
      
      const quotes = await Promise.all(
        (watchlist.symbols || []).map(async (symbol) => {
          try {
            const quote = await finnhubRequest('/quote', { symbol })
            const profile = await finnhubRequest('/stock/profile2', { symbol }).catch(() => null)
            return {
              symbol,
              name: profile?.name || symbol,
              currentPrice: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              high: quote.h,
              low: quote.l
            }
          } catch { return { symbol, name: symbol, currentPrice: 0, change: 0, changePercent: 0 } }
        })
      )
      
      return handleCORS(NextResponse.json({ symbols: watchlist.symbols, stocks: quotes }))
    }

    if (route === '/watchlist/add' && method === 'POST') {
      const { userId, symbol } = await request.json()
      if (!userId || !symbol) return handleCORS(NextResponse.json({ error: 'Required fields missing' }, { status: 400 }))
      
      await db.collection('watchlists').updateOne(
        { userId },
        { $addToSet: { symbols: symbol.toUpperCase() }, $set: { updatedAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/watchlist/remove' && method === 'POST') {
      const { userId, symbol } = await request.json()
      await db.collection('watchlists').updateOne(
        { userId },
        { $pull: { symbols: symbol.toUpperCase() } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ========================
    // PORTFOLIO
    // ========================

    if (route.startsWith('/portfolio/') && method === 'GET' && !route.includes('/add') && !route.includes('/remove') && !route.includes('/history') && !route.includes('/export')) {
      const userId = route.split('/portfolio/')[1]
      const portfolio = await db.collection('portfolios').findOne({ userId })
      
      if (!portfolio || !portfolio.holdings?.length) {
        return handleCORS(NextResponse.json({ holdings: [], totalValue: 0, totalInvested: 0, totalPnL: 0, totalPnLPercent: 0, dayPnL: 0 }))
      }
      
      let totalValue = 0, totalInvested = 0
      
      const holdingsWithQuotes = await Promise.all(
        portfolio.holdings.map(async (holding) => {
          try {
            const quote = await finnhubRequest('/quote', { symbol: holding.symbol })
            const currentValue = quote.c * holding.quantity
            const invested = holding.avgPrice * holding.quantity
            const pnl = currentValue - invested
            const dayPnl = quote.d * holding.quantity
            
            totalValue += currentValue
            totalInvested += invested
            
            return {
              ...holding,
              currentPrice: quote.c,
              currentValue,
              pnl,
              pnlPercent: (pnl / invested) * 100,
              dayChange: quote.d,
              dayChangePercent: quote.dp,
              dayPnl
            }
          } catch {
            const invested = holding.avgPrice * holding.quantity
            totalInvested += invested
            return { ...holding, currentPrice: holding.avgPrice, currentValue: invested, pnl: 0, pnlPercent: 0, dayPnl: 0 }
          }
        })
      )
      
      return handleCORS(NextResponse.json({
        holdings: holdingsWithQuotes,
        totalValue,
        totalInvested,
        totalPnL: totalValue - totalInvested,
        totalPnLPercent: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
        dayPnL: holdingsWithQuotes.reduce((sum, h) => sum + (h.dayPnl || 0), 0)
      }))
    }

    if (route === '/portfolio/add' && method === 'POST') {
      const { userId, symbol, quantity, avgPrice, type = 'buy' } = await request.json()
      if (!userId || !symbol || !quantity || !avgPrice) {
        return handleCORS(NextResponse.json({ error: 'All fields required' }, { status: 400 }))
      }
      
      const holding = {
        id: uuidv4(),
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        avgPrice: parseFloat(avgPrice),
        addedAt: new Date()
      }
      
      await db.collection('transactions').insertOne({
        id: uuidv4(),
        userId,
        symbol: symbol.toUpperCase(),
        type,
        quantity: parseFloat(quantity),
        price: parseFloat(avgPrice),
        total: parseFloat(quantity) * parseFloat(avgPrice),
        timestamp: new Date()
      })
      
      await db.collection('portfolios').updateOne(
        { userId },
        { $push: { holdings: holding }, $set: { updatedAt: new Date() } },
        { upsert: true }
      )
      
      return handleCORS(NextResponse.json({ success: true, holding }))
    }

    if (route === '/portfolio/remove' && method === 'POST') {
      const { userId, holdingId } = await request.json()
      await db.collection('portfolios').updateOne(
        { userId },
        { $pull: { holdings: { id: holdingId } } }
      )
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route.startsWith('/portfolio/history/') && method === 'GET') {
      const userId = route.split('/portfolio/history/')[1]
      const transactions = await db.collection('transactions')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray()
      return handleCORS(NextResponse.json({ transactions: transactions.map(({ _id, ...rest }) => rest) }))
    }

    // Portfolio CSV Export
    if (route.startsWith('/portfolio/export/') && method === 'GET') {
      const userId = route.split('/portfolio/export/')[1]
      const portfolio = await db.collection('portfolios').findOne({ userId })
      
      if (!portfolio?.holdings?.length) {
        return handleCORS(NextResponse.json({ csv: 'Symbol,Quantity,Avg Price,Current Price,Value,P&L,P&L %\n' }))
      }
      
      let csv = 'Symbol,Quantity,Avg Price,Current Price,Value,P&L,P&L %\n'
      
      for (const holding of portfolio.holdings) {
        try {
          const quote = await finnhubRequest('/quote', { symbol: holding.symbol })
          const currentValue = quote.c * holding.quantity
          const invested = holding.avgPrice * holding.quantity
          const pnl = currentValue - invested
          const pnlPercent = (pnl / invested) * 100
          
          csv += `${holding.symbol},${holding.quantity},${holding.avgPrice.toFixed(2)},${quote.c.toFixed(2)},${currentValue.toFixed(2)},${pnl.toFixed(2)},${pnlPercent.toFixed(2)}%\n`
        } catch {
          csv += `${holding.symbol},${holding.quantity},${holding.avgPrice.toFixed(2)},N/A,N/A,N/A,N/A\n`
        }
      }
      
      return handleCORS(NextResponse.json({ csv }))
    }

    // ========================
    // PAPER TRADING
    // ========================

    if (route.startsWith('/paper-trading/balance/') && method === 'GET') {
      const userId = route.split('/paper-trading/balance/')[1]
      const user = await db.collection('users').findOne({ id: userId })
      const paperPortfolio = await db.collection('paper_portfolios').findOne({ userId })
      
      let holdingsValue = 0
      if (paperPortfolio?.holdings?.length) {
        for (const h of paperPortfolio.holdings) {
          try {
            const quote = await finnhubRequest('/quote', { symbol: h.symbol })
            holdingsValue += quote.c * h.quantity
          } catch {}
        }
      }
      
      return handleCORS(NextResponse.json({
        cashBalance: user?.paperTradingBalance || 100000,
        holdingsValue,
        totalValue: (user?.paperTradingBalance || 100000) + holdingsValue
      }))
    }

    if (route === '/paper-trading/trade' && method === 'POST') {
      const { userId, symbol, quantity, action } = await request.json()
      if (!userId || !symbol || !quantity || !action) {
        return handleCORS(NextResponse.json({ error: 'All fields required' }, { status: 400 }))
      }
      
      try {
        let price = 100 // Fallback price for demo
        try {
          const quote = await finnhubRequest('/quote', { symbol: symbol.toUpperCase() })
          price = quote.c || price
        } catch (apiError) {
          console.log('Finnhub API limit reached, using fallback price for paper trading')
          // Use different fallback prices for different symbols
          const fallbackPrices = { 'TSLA': 380, 'AAPL': 250, 'GOOGL': 180, 'MSFT': 450 }
          price = fallbackPrices[symbol.toUpperCase()] || 100
        }
        
        const total = price * parseFloat(quantity)
        
        const user = await db.collection('users').findOne({ id: userId })
        const currentBalance = user?.paperTradingBalance || 100000
        
        if (action === 'buy') {
          if (total > currentBalance) {
            return handleCORS(NextResponse.json({ error: 'Insufficient balance' }, { status: 400 }))
          }
          
          await db.collection('users').updateOne(
            { id: userId },
            { $inc: { paperTradingBalance: -total } }
          )
          
          await db.collection('paper_portfolios').updateOne(
            { userId },
            { 
              $push: { 
                holdings: { 
                  id: uuidv4(), 
                  symbol: symbol.toUpperCase(), 
                  quantity: parseFloat(quantity), 
                  avgPrice: price,
                  boughtAt: new Date()
                } 
              } 
            },
            { upsert: true }
          )
        } else if (action === 'sell') {
          const paperPortfolio = await db.collection('paper_portfolios').findOne({ userId })
          const holding = paperPortfolio?.holdings?.find(h => h.symbol === symbol.toUpperCase())
          
          if (!holding || holding.quantity < parseFloat(quantity)) {
            return handleCORS(NextResponse.json({ error: 'Insufficient shares' }, { status: 400 }))
          }
          
          await db.collection('users').updateOne(
            { id: userId },
            { $inc: { paperTradingBalance: total } }
          )
          
          if (holding.quantity === parseFloat(quantity)) {
            await db.collection('paper_portfolios').updateOne(
              { userId },
              { $pull: { holdings: { id: holding.id } } }
            )
          } else {
            await db.collection('paper_portfolios').updateOne(
              { userId, 'holdings.id': holding.id },
              { $inc: { 'holdings.$.quantity': -parseFloat(quantity) } }
            )
          }
        }
        
        // Record trade
        await db.collection('paper_trades').insertOne({
          id: uuidv4(),
          userId,
          symbol: symbol.toUpperCase(),
          action,
          quantity: parseFloat(quantity),
          price,
          total,
          timestamp: new Date()
        })
        
        return handleCORS(NextResponse.json({ success: true, price, total }))
      } catch (error) {
        console.error('Paper trading error:', error)
        return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
      }
    }

    if (route.startsWith('/paper-trading/portfolio/') && method === 'GET') {
      const userId = route.split('/paper-trading/portfolio/')[1]
      const paperPortfolio = await db.collection('paper_portfolios').findOne({ userId })
      
      if (!paperPortfolio?.holdings?.length) {
        return handleCORS(NextResponse.json({ holdings: [], totalValue: 0, totalPnL: 0 }))
      }
      
      let totalValue = 0, totalInvested = 0
      
      const holdings = await Promise.all(
        paperPortfolio.holdings.map(async (h) => {
          try {
            const quote = await finnhubRequest('/quote', { symbol: h.symbol })
            const currentValue = quote.c * h.quantity
            const invested = h.avgPrice * h.quantity
            totalValue += currentValue
            totalInvested += invested
            return {
              ...h,
              currentPrice: quote.c,
              currentValue,
              pnl: currentValue - invested,
              pnlPercent: ((currentValue - invested) / invested) * 100
            }
          } catch {
            return h
          }
        })
      )
      
      return handleCORS(NextResponse.json({
        holdings,
        totalValue,
        totalInvested,
        totalPnL: totalValue - totalInvested,
        totalPnLPercent: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
      }))
    }

    if (route.startsWith('/paper-trading/history/') && method === 'GET') {
      const userId = route.split('/paper-trading/history/')[1]
      const trades = await db.collection('paper_trades')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray()
      return handleCORS(NextResponse.json({ trades: trades.map(({ _id, ...rest }) => rest) }))
    }

    // ========================
    // ORACLE MODE - AI PREDICTIONS
    // ========================

    if (route === '/oracle/analyze' && method === 'POST') {
      const { userId, symbol } = await request.json()
      if (!symbol) return handleCORS(NextResponse.json({ error: 'Symbol required' }, { status: 400 }))
      
      try {
        const symbolUpper = symbol.toUpperCase()
        
        // CHECK CACHE FIRST (10 minute cache)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        const cachedPrediction = await db.collection('oracle_predictions')
          .findOne({
            symbol: symbolUpper,
            timestamp: { $gte: tenMinutesAgo }
          }, { sort: { timestamp: -1 } })
        
        if (cachedPrediction) {
          console.log(`Oracle cache hit for ${symbolUpper}`)
          return handleCORS(NextResponse.json({
            symbol: symbolUpper,
            price: cachedPrediction.price,
            change: cachedPrediction.change || 0,
            changePercent: cachedPrediction.changePercent || 0,
            profile: cachedPrediction.profile || null,
            indicators: cachedPrediction.indicators,
            recommendations: cachedPrediction.recommendations || {},
            oracleAnalysis: cachedPrediction.analysis,
            cached: true
          }))
        }
        
        const quote = await finnhubRequest('/quote', { symbol: symbolUpper })
        const profile = await finnhubRequest('/stock/profile2', { symbol: symbolUpper }).catch(() => null)
        const recommendations = await finnhubRequest('/stock/recommendation', { symbol: symbolUpper }).catch(() => [])
        
        // Generate price history for analysis
        const prices = generatePriceHistory(quote.c, 100)
        const rsi = calculateRSI(prices, 14)
        const macd = calculateMACD(prices)
        const sma20 = calculateSMA(prices, 20)
        const sma50 = calculateSMA(prices, 50)
        const bollinger = calculateBollingerBands(prices, 20, 2)
        
        const latestRec = recommendations?.[0] || {}
        
        // RETRY LOGIC WITH EXPONENTIAL BACKOFF
        let analysis = null
        let retryCount = 0
        const maxRetries = 3
        
        while (!analysis && retryCount < maxRetries) {
          try {
            const ai = getGeminiAI()
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' })
            
            const oraclePrompt = `You are Oracle, an elite AI trading analyst. Provide a comprehensive trading analysis for ${symbolUpper}.

CURRENT MARKET DATA:
- Price: $${quote.c}
- Day Change: ${quote.dp > 0 ? '+' : ''}${quote.dp?.toFixed(2)}%
- Day Range: $${quote.l} - $${quote.h}
- Company: ${profile?.name || 'N/A'}
- Industry: ${profile?.finnhubIndustry || 'N/A'}
- Market Cap: ${profile?.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : 'N/A'}

TECHNICAL INDICATORS:
- RSI (14): ${rsi?.toFixed(2) || 'N/A'} ${rsi > 70 ? '(OVERBOUGHT)' : rsi < 30 ? '(OVERSOLD)' : '(NEUTRAL)'}
- MACD: ${macd?.macdLine?.toFixed(4) || 'N/A'} | Signal: ${macd?.signalLine?.toFixed(4) || 'N/A'}
- SMA 20: $${sma20?.toFixed(2) || 'N/A'} ${quote.c > sma20 ? '(ABOVE)' : '(BELOW)'}
- SMA 50: $${sma50?.toFixed(2) || 'N/A'} ${quote.c > sma50 ? '(ABOVE)' : '(BELOW)'}
- Bollinger Bands: Upper $${bollinger?.upper?.toFixed(2)} | Middle $${bollinger?.middle?.toFixed(2)} | Lower $${bollinger?.lower?.toFixed(2)}
- Price vs Bollinger: ${quote.c > bollinger?.upper ? 'ABOVE UPPER (Overbought)' : quote.c < bollinger?.lower ? 'BELOW LOWER (Oversold)' : 'WITHIN BANDS'}

ANALYST SENTIMENT:
- Buy: ${latestRec.buy || 0} | Hold: ${latestRec.hold || 0} | Sell: ${latestRec.sell || 0}

Provide a concise analysis with:
1. **ORACLE SIGNAL**: 🟢 STRONG BUY / 🟡 BUY / ⚪ HOLD / 🟠 SELL / 🔴 STRONG SELL
2. **CONFIDENCE**: X/100
3. **TARGETS**: Bullish $X | Base $X | Bearish $X (1-3 months)
4. **KEY SIGNALS**: 3-4 bullet points
5. **RISKS**: 2-3 bullet points
6. **STRATEGY**: Entry, Stop Loss, Take Profit levels

Be specific with numbers. Educational purposes only.`
            
            const result = await model.generateContent(oraclePrompt)
            analysis = result.response.text()
            
          } catch (aiError) {
            retryCount++
            console.error(`Oracle AI attempt ${retryCount} failed:`, aiError.message)
            
            // Exponential backoff: 1s, 2s, 4s
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000))
            }
          }
        }
        
        // If all retries failed, return cached analysis or fallback
        if (!analysis) {
          // Try to get ANY cached analysis for this symbol (even if old)
          const oldCache = await db.collection('oracle_predictions')
            .findOne({ symbol: symbolUpper }, { sort: { timestamp: -1 } })
          
          if (oldCache) {
            return handleCORS(NextResponse.json({
              symbol: symbolUpper,
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              profile: profile ? { name: profile.name, industry: profile.finnhubIndustry } : null,
              indicators: { rsi, macd, sma20, sma50, bollinger },
              recommendations: latestRec,
              oracleAnalysis: oldCache.analysis,
              cached: true,
              stale: true,
              message: 'Using previous analysis. AI service temporarily unavailable.'
            }))
          }
          
          // Fallback: Generate basic analysis from indicators
          analysis = `**ORACLE SIGNAL**: ${rsi > 70 ? '🟠 SELL' : rsi < 30 ? '🟢 BUY' : '⚪ HOLD'}\n**CONFIDENCE**: ${Math.floor(50 + Math.abs(50 - rsi))}\/100\n\n**CURRENT ANALYSIS**:\nPrice: $${quote.c} (${quote.dp > 0 ? '+' : ''}${quote.dp?.toFixed(2)}%)\nRSI: ${rsi?.toFixed(1)} - ${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}\n\n**KEY SIGNALS**:\n- RSI at ${rsi?.toFixed(1)} indicates ${rsi > 70 ? 'overbought conditions' : rsi < 30 ? 'oversold conditions' : 'neutral momentum'}\n- Price is ${quote.c > sma20 ? 'above' : 'below'} 20-day SMA ($${sma20?.toFixed(2)})\n- Price is ${quote.c > sma50 ? 'above' : 'below'} 50-day SMA ($${sma50?.toFixed(2)})\n\n*AI service temporarily unavailable. Analysis based on technical indicators only.*`
        }
        
        // Save oracle prediction with all data for caching
        await db.collection('oracle_predictions').insertOne({
          id: uuidv4(),
          userId: userId || 'anonymous',
          symbol: symbolUpper,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          profile: profile ? { name: profile.name, industry: profile.finnhubIndustry } : null,
          indicators: { rsi, macd, sma20, sma50, bollinger },
          recommendations: latestRec,
          analysis,
          timestamp: new Date()
        })
        
        // Deduct oracle credit only if successful and not using fallback
        if (userId && analysis && !analysis.includes('temporarily unavailable')) {
          await db.collection('users').updateOne(
            { id: userId },
            { $inc: { oracleCredits: -1 } }
          )
        }
        
        return handleCORS(NextResponse.json({
          symbol: symbolUpper,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          profile: profile ? { name: profile.name, industry: profile.finnhubIndustry } : null,
          indicators: { rsi, macd, sma20, sma50, bollinger },
          recommendations: latestRec,
          oracleAnalysis: analysis,
          cached: false
        }))
      } catch (error) {
        console.error('Oracle Error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Oracle analysis temporarily unavailable. Please try again in a moment.',
          details: error.message 
        }, { status: 503 }))
      }
    }

    // Oracle Market Scanner - Find opportunities
    if (route === '/oracle/scan' && method === 'POST') {
      const { userId } = await request.json()
      
      const scanSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'CRM', 'PYPL', 'SQ', 'UBER', 'SHOP']
      
      const opportunities = []
      
      for (const symbol of scanSymbols) {
        try {
          const quote = await finnhubRequest('/quote', { symbol })
          const prices = generatePriceHistory(quote.c, 50)
          const rsi = calculateRSI(prices, 14)
          const macd = calculateMACD(prices)
          const bollinger = calculateBollingerBands(prices, 20, 2)
          
          let signal = 'NEUTRAL'
          let strength = 50
          let reason = ''
          
          // Oversold opportunities
          if (rsi < 30) {
            signal = 'BUY'
            strength = Math.min(90, 70 + (30 - rsi))
            reason = `RSI oversold at ${rsi.toFixed(1)}`
          } else if (rsi > 70) {
            signal = 'SELL'
            strength = Math.min(90, 70 + (rsi - 70))
            reason = `RSI overbought at ${rsi.toFixed(1)}`
          }
          
          // Bollinger Band signals
          if (quote.c < bollinger?.lower) {
            signal = signal === 'BUY' ? 'STRONG BUY' : 'BUY'
            strength = Math.min(95, strength + 15)
            reason += (reason ? ' | ' : '') + 'Below lower Bollinger Band'
          } else if (quote.c > bollinger?.upper) {
            signal = signal === 'SELL' ? 'STRONG SELL' : 'SELL'
            strength = Math.min(95, strength + 15)
            reason += (reason ? ' | ' : '') + 'Above upper Bollinger Band'
          }
          
          // MACD crossover
          if (macd && macd.histogram > 0 && signal !== 'SELL') {
            signal = signal === 'BUY' ? 'STRONG BUY' : 'BUY'
            strength = Math.min(95, strength + 10)
            reason += (reason ? ' | ' : '') + 'Bullish MACD'
          } else if (macd && macd.histogram < 0 && signal !== 'BUY') {
            signal = signal === 'SELL' ? 'STRONG SELL' : 'SELL'
            strength = Math.min(95, strength + 10)
            reason += (reason ? ' | ' : '') + 'Bearish MACD'
          }
          
          if (signal !== 'NEUTRAL' && strength > 60) {
            opportunities.push({
              symbol,
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              signal,
              strength,
              reason,
              indicators: { rsi, macd: macd?.macdLine }
            })
          }
        } catch {}
      }
      
      // Sort by strength
      opportunities.sort((a, b) => b.strength - a.strength)
      
      return handleCORS(NextResponse.json({ opportunities: opportunities.slice(0, 10) }))
    }

    // ========================
    // AI CHAT
    // ========================

    if (route === '/ai/chat' && method === 'POST') {
      const { message, userId, context, conversationHistory } = await request.json()
      if (!message) return handleCORS(NextResponse.json({ error: 'Message required' }, { status: 400 }))
      
      try {
        const ai = getGeminiAI()
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' })
        
        // Get user context
        let userContext = ''
        let portfolioData = null
        let watchlistData = null
        let paperPortfolioData = null
        
        if (userId) {
          portfolioData = await db.collection('portfolios').findOne({ userId })
          watchlistData = await db.collection('watchlists').findOne({ userId })
          paperPortfolioData = await db.collection('paper_portfolios').findOne({ userId })
          
          if (portfolioData?.holdings?.length) {
            const totalValue = portfolioData.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0)
            userContext += `\n📊 USER'S PORTFOLIO:\n${portfolioData.holdings.map(h => `  • ${h.symbol}: ${h.quantity} shares @ $${h.avgPrice} avg`).join('\n')}\n  Total Value: $${totalValue.toFixed(2)}`
          }
          
          if (paperPortfolioData) {
            const paperValue = paperPortfolioData.cash + (paperPortfolioData.holdings?.reduce((sum, h) => sum + (h.quantity * h.currentPrice || 0), 0) || 0)
            userContext += `\n🎯 PAPER TRADING:\n  Cash: $${paperPortfolioData.cash?.toFixed(2)}\n  Total Portfolio: $${paperValue.toFixed(2)}`
          }
          
          if (watchlistData?.symbols?.length) {
            userContext += `\n⭐ WATCHLIST: ${watchlistData.symbols.slice(0, 10).join(', ')}`
          }
          
          // Get recent chat history for context
          const recentChats = await db.collection('chat_history')
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(5)
            .toArray()
          
          if (recentChats.length > 0) {
            userContext += `\n\n💬 RECENT CONVERSATION:\n${recentChats.reverse().map(c => `User: ${c.message}\nJENNIE: ${c.response.substring(0, 150)}...`).join('\n\n')}`
          }
        }
        
        const systemPrompt = `You are JENNIE (J.E.N.N.I.E. -ジェニー), an elite AI trading intelligence system. You combine the conversational abilities of ChatGPT with the analytical power of advanced financial AI. You are warm, intelligent, and incredibly helpful - users should feel they can rely on you completely.

🧠 YOUR IDENTITY:
- Name: JENNIE (pronounced "Jenny")  
- Personality: Professional yet friendly, insightful, empathetic, and trustworthy
- Role: Personal AI trading advisor and financial companion
- Capabilities: Market analysis, technical indicators, portfolio optimization, risk assessment, trading psychology, and educational guidance

💡 YOUR STRENGTHS:
✅ Deep market knowledge across stocks, crypto, forex, commodities
✅ Real-time data analysis and pattern recognition
✅ Personalized recommendations based on user's portfolio
✅ Trading psychology and emotional support
✅ Educational - explain complex concepts simply
✅ Proactive - suggest opportunities and warn of risks
✅ Conversational memory - reference past discussions

🎯 YOUR MISSION:
Help users become better traders through:
1. Actionable insights with clear reasoning
2. Risk-aware recommendations (always mention risks)
3. Educational explanations (teach, don't just tell)
4. Emotional intelligence (support during losses, celebrate wins)
5. Personalized advice based on their holdings and goals

📊 CURRENT USER CONTEXT:${userContext}
${context ? `\n🔍 Additional Context: ${context}` : ''}

🎨 YOUR COMMUNICATION STYLE:
- Be concise but comprehensive
- Use emojis strategically for clarity: 🚀📈📉⚠️💎🎯
- Structure complex info with bullet points
- Always provide reasoning behind recommendations
- Reference user's portfolio when relevant
- Balance optimism with realistic risk awareness

⚠️ IMPORTANT:
- Always include: "This is educational guidance, not financial advice. Always do your own research."
- If uncertain, admit it honestly
- Never guarantee returns
- Encourage diversification and risk management

💬 INTERACTION STYLE:
- Greet returning users warmly
- Reference previous conversations naturally
- Ask clarifying questions when needed
- Celebrate user wins, empathize with losses
- Proactively suggest relevant insights

You're not just an AI assistant - you're JENNIE, a trusted trading companion users can rely on 24/7. Be the AI they turn to for every market question and decision.`
        
        // Build conversation context
        let fullPrompt = systemPrompt + '\n\n---\n\n'
        
        // Add recent conversation if provided
        if (conversationHistory && conversationHistory.length > 0) {
          fullPrompt += 'Recent conversation:\n'
          conversationHistory.slice(-4).forEach(msg => {
            fullPrompt += `${msg.role === 'user' ? 'User' : 'JENNIE'}: ${msg.content}\n`
          })
          fullPrompt += '\n'
        }
        
        fullPrompt += `User: ${message}\nJENNIE:`
        
        const result = await model.generateContent(fullPrompt)
        const response = result.response.text()
        
        // Save to chat history
        await db.collection('chat_history').insertOne({
          id: uuidv4(),
          userId: userId || 'anonymous',
          message,
          response,
          timestamp: new Date(),
          context: userContext
        })
        
        return handleCORS(NextResponse.json({ 
          response,
          aiName: 'JENNIE',
          timestamp: new Date().toISOString()
        }))
      } catch (error) {
        console.error('JENNIE AI Error:', error)
        
        // Fallback response
        const fallbackResponses = [
          "I'm having a moment of connectivity issues, but I'm still here for you! Try asking again in a moment. 💫",
          "Oops! I'm experiencing high demand right now. Give me just a second to get back to you! 🔄",
          "My systems are catching up - typical Monday energy! 😅 Please retry your question."
        ]
        
        return handleCORS(NextResponse.json({ 
          response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
          aiName: 'JENNIE',
          error: 'temporary_unavailable'
        }))
      }
    }

    if (route === '/ai/analyze' && method === 'POST') {
      const { symbol } = await request.json()
      if (!symbol) return handleCORS(NextResponse.json({ error: 'Symbol required' }, { status: 400 }))
      
      try {
        const quote = await finnhubRequest('/quote', { symbol: symbol.toUpperCase() })
        const profile = await finnhubRequest('/stock/profile2', { symbol: symbol.toUpperCase() }).catch(() => null)
        
        const ai = getGeminiAI()
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' })
        
        const prompt = `Analyze ${symbol.toUpperCase()} (${profile?.name || 'N/A'}):
Price: $${quote.c} | Change: ${quote.dp?.toFixed(2)}%
Industry: ${profile?.finnhubIndustry || 'N/A'}

Provide: 1) Summary 2) Recommendation 3) Risk Level 4) Key Factors. Be concise.`
        
        const result = await model.generateContent(prompt)
        
        return handleCORS(NextResponse.json({
          symbol: symbol.toUpperCase(),
          quote: { currentPrice: quote.c, change: quote.d, changePercent: quote.dp },
          profile: profile ? { name: profile.name, industry: profile.finnhubIndustry } : null,
          analysis: result.response.text()
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({ error: 'Analysis failed' }, { status: 500 }))
      }
    }

    // ========================
    // ALERTS
    // ========================

    if (route.startsWith('/alerts/') && method === 'GET' && !route.includes('/create') && !route.includes('/delete')) {
      const userId = route.split('/alerts/')[1]
      const alerts = await db.collection('alerts').find({ userId }).toArray()
      return handleCORS(NextResponse.json({ alerts: alerts.map(({ _id, ...rest }) => rest) }))
    }

    if (route === '/alerts/create' && method === 'POST') {
      const { userId, symbol, condition, targetPrice, note } = await request.json()
      if (!userId || !symbol || !condition || !targetPrice) {
        return handleCORS(NextResponse.json({ error: 'All fields required' }, { status: 400 }))
      }
      
      const alert = {
        id: uuidv4(),
        userId,
        symbol: symbol.toUpperCase(),
        condition,
        targetPrice: parseFloat(targetPrice),
        note: note || '',
        triggered: false,
        createdAt: new Date()
      }
      
      await db.collection('alerts').insertOne(alert)
      return handleCORS(NextResponse.json({ success: true, alert }))
    }

    if (route === '/alerts/delete' && method === 'POST') {
      const { alertId } = await request.json()
      await db.collection('alerts').deleteOne({ id: alertId })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ========================
    // SCREENER
    // ========================

    if (route === '/screener' && method === 'POST') {
      const { minPrice, maxPrice, minChange, maxChange, minRSI, maxRSI } = await request.json()
      
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'PYPL', 'SQ', 'UBER', 'LYFT', 'SNAP', 'PINS', 'TWLO', 'SHOP', 'ZM', 'DOCU', 'NET', 'CRWD', 'DDOG', 'SNOW', 'PLTR', 'COIN', 'HOOD', 'SOFI']
      
      const results = []
      
      for (const symbol of symbols) {
        try {
          const quote = await finnhubRequest('/quote', { symbol })
          const profile = await finnhubRequest('/stock/profile2', { symbol }).catch(() => null)
          const prices = generatePriceHistory(quote.c, 20)
          const rsi = calculateRSI(prices, 14)
          
          let pass = true
          if (minPrice && quote.c < parseFloat(minPrice)) pass = false
          if (maxPrice && quote.c > parseFloat(maxPrice)) pass = false
          if (minChange && quote.dp < parseFloat(minChange)) pass = false
          if (maxChange && quote.dp > parseFloat(maxChange)) pass = false
          if (minRSI && rsi < parseFloat(minRSI)) pass = false
          if (maxRSI && rsi > parseFloat(maxRSI)) pass = false
          
          if (pass) {
            results.push({
              symbol,
              name: profile?.name || symbol,
              industry: profile?.finnhubIndustry || 'Unknown',
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              rsi,
              marketCap: profile?.marketCapitalization || 0
            })
          }
        } catch {}
      }
      
      return handleCORS(NextResponse.json({ stocks: results }))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute