const { prisma } = require('../prismaClient');

const getUserPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const portfolio = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        stock: true
      }
    });

    const portfolioWithValue = portfolio.map(item => ({
      ...item,
      currentValue: item.quantity * item.stock.currentPrice,
      totalInvested: item.quantity * item.avgPrice,
      profitLoss: (item.quantity * item.stock.currentPrice) - (item.quantity * item.avgPrice)
    }));

    res.json(portfolioWithValue);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUserPortfolio };
