const { prisma } = require('../prismaClient');
const { getStockPrice } = require('../utils/stockData');

const getAllStocks = async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { symbol: 'asc' }
    });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const buyStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const userId = req.user.id;

    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const total = stock.currentPrice * quantity;

    // Check if user has enough balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.balance < total) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: user.balance - total }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          stockId,
          type: 'BUY',
          quantity,
          price: stock.currentPrice,
          total
        }
      });

      // Update or create portfolio entry
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: {
          userId_stockId: { userId, stockId }
        }
      });

      if (existingPortfolio) {
        const newQuantity = existingPortfolio.quantity + quantity;
        const newAvgPrice = ((existingPortfolio.avgPrice * existingPortfolio.quantity) + total) / newQuantity;
        
        await prisma.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            quantity: newQuantity,
            avgPrice: newAvgPrice
          }
        });
      } else {
        await prisma.portfolio.create({
          data: {
            userId,
            stockId,
            quantity,
            avgPrice: stock.currentPrice
          }
        });
      }

      return transaction;
    });

    res.json({ message: 'Stock purchased successfully', transaction: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const sellStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const userId = req.user.id;

    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_stockId: { userId, stockId }
      }
    });

    if (!portfolio || portfolio.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stocks to sell' });
    }

    const total = stock.currentPrice * quantity;

    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update user balance
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { balance: user.balance + total }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          stockId,
          type: 'SELL',
          quantity,
          price: stock.currentPrice,
          total
        }
      });

      // Update portfolio
      const newQuantity = portfolio.quantity - quantity;
      if (newQuantity === 0) {
        await prisma.portfolio.delete({ where: { id: portfolio.id } });
      } else {
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { quantity: newQuantity }
        });
      }

      return transaction;
    });

    res.json({ message: 'Stock sold successfully', transaction: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllStocks, buyStock, sellStock };