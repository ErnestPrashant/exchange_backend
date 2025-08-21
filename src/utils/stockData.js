// Mock stock data - in production, you'd integrate with real stock APIs
const stockData = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 150.25 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 2800.50 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 300.75 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 3200.00 },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 850.30 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 220.40 },
  { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 320.15 },
  { symbol: 'NFLX', name: 'Netflix Inc.', currentPrice: 400.80 }
];

const getStockPrice = (symbol) => {
  const stock = stockData.find(s => s.symbol === symbol);
  return stock ? stock.currentPrice : null;
};

const seedStocks = async (prisma) => {
  for (const stock of stockData) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: { currentPrice: stock.currentPrice },
      create: stock
    });
  }
};

module.exports = { getStockPrice, seedStocks };