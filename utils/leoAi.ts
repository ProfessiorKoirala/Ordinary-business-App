import { AppDataBackup } from '../types';

export const askLeo = (query: string, data: AppDataBackup): string => {
    if (!data || !data.orders) {
        return "I'm sorry, I couldn't access your business records. Please make sure your data is loaded.";
    }
    const q = query.toLowerCase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (ts: number) => {
        const d = new Date(ts);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    };

    // --- Data Calculations ---
    
    // Sales
    const todayOrders = data.orders.filter(o => isToday(o.timestamp));
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalSales = data.orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Expenses
    const todayExpensesList = data.expenses.filter(e => isToday(new Date(e.date).getTime()));
    const todayExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Profit
    const todayProfit = todaySales - todayExpenses;
    const totalProfit = totalSales - totalExpenses;

    // Creditors (Outstanding Balance)
    const totalCreditSales = data.orders.filter(o => o.paymentMethod === 'Credit').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalCreditPaid = data.payments.filter(p => p.type === 'Credit Payment').reduce((sum, p) => sum + p.amount, 0);
    const totalCreditReturned = data.payments.filter(p => p.type === 'Advance Return').reduce((sum, p) => sum + p.amount, 0);
    const outstandingCredit = totalCreditSales - totalCreditPaid + totalCreditReturned;

    // Inventory
    const lowStockProducts = data.products.filter(p => p.trackStock && (p.stock || 0) <= 5);
    const totalProducts = data.products.length;
    const totalStockValue = data.products.reduce((sum, p) => sum + ((p.stock || 0) * p.price), 0);

    // Top Selling Product
    const productSales: { [key: string]: number } = {};
    data.orders.forEach(o => {
        o.items.forEach(item => {
            const name = item.product.name;
            productSales[name] = (productSales[name] || 0) + item.quantity;
        });
    });
    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];

    // Expense Categories
    const expenseCats: { [key: string]: number } = {};
    data.expenses.forEach(e => {
        expenseCats[e.category] = (expenseCats[e.category] || 0) + e.amount;
    });
    const topExpenseCat = Object.entries(expenseCats).sort((a, b) => b[1] - a[1])[0];

    // --- Keyword Matching ---

    // 1. Dashboard & General Health
    if (q.includes('summary') || q.includes('business health') || q.includes('how is the business') || q.includes('overall status')) {
        return `Sir, here is your 60-second business summary:
• Today's Sales: ₹${todaySales.toLocaleString()}
• Today's Expenses: ₹${todayExpenses.toLocaleString()}
• Today's Profit: ₹${todayProfit.toLocaleString()}
• Active Orders: ${todayOrders.length}
• Low Stock Items: ${lowStockProducts.length}
• Outstanding Credit: ₹${outstandingCredit.toLocaleString()}

${todayProfit > 0 ? "We are in the green today! 📈" : todayProfit < 0 ? "Expenses are currently higher than sales. ⚠️" : "We've just started the day. 🚀"}`;
    }

    // 2. Sales & Revenue
    if (q.includes('sale') || q.includes('revenue') || q.includes('earn') || q.includes('income')) {
        if (q.includes('target') || q.includes('goal')) {
            const target = data.settings.dailySalesTarget || 0;
            if (target === 0) return "You haven't set a daily sales target yet. You can set one in the settings!";
            const percent = Math.round((todaySales / target) * 100);
            return `Your daily target is ₹${target.toLocaleString()}. You've reached ₹${todaySales.toLocaleString()} (${percent}%). You need ₹${Math.max(0, target - todaySales).toLocaleString()} more.`;
        }
        if (q.includes('yesterday')) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0,0,0,0);
            const yOrders = data.orders.filter(o => {
                const d = new Date(o.timestamp);
                d.setHours(0,0,0,0);
                return d.getTime() === yesterday.getTime();
            });
            const ySales = yOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            return `Yesterday's total sales were ₹${ySales.toLocaleString()} from ${yOrders.length} orders.`;
        }
        if (q.includes('total') || q.includes('all time')) {
            return `Your all-time total revenue is ₹${totalSales.toLocaleString()} from ${data.orders.length} orders.`;
        }
        return `Today's sales are ₹${todaySales.toLocaleString()} from ${todayOrders.length} orders.`;
    }

    // 3. Expenses
    if (q.includes('expense') || q.includes('spend') || q.includes('cost')) {
        if (q.includes('highest') || q.includes('most') || q.includes('category')) {
            if (!topExpenseCat) return "No expenses recorded yet.";
            return `Your highest expense category is "${topExpenseCat[0]}" at ₹${topExpenseCat[1].toLocaleString()}.`;
        }
        if (q.includes('today')) {
            return `You've spent ₹${todayExpenses.toLocaleString()} today across ${todayExpensesList.length} items.`;
        }
        return `Total all-time expenses are ₹${totalExpenses.toLocaleString()}.`;
    }

    // 4. Inventory & Stock
    if (q.includes('stock') || q.includes('inventory') || q.includes('product')) {
        if (q.includes('low') || q.includes('restock') || q.includes('running out')) {
            if (lowStockProducts.length === 0) return "All products are well-stocked, sir!";
            const list = lowStockProducts.slice(0, 5).map(p => `${p.name} (${p.stock} left)`).join(', ');
            return `Heads up! ${lowStockProducts.length} items are low: ${list}${lowStockProducts.length > 5 ? ' and more...' : ''}.`;
        }
        if (q.includes('value') || q.includes('worth')) {
            return `The total value of your current stock is approximately ₹${totalStockValue.toLocaleString()}.`;
        }
        if (q.includes('best') || q.includes('top') || q.includes('selling')) {
            if (!topProduct) return "Not enough sales data yet.";
            return `Your top product is "${topProduct[0]}" with ${topProduct[1]} units sold.`;
        }
        return `You have ${totalProducts} products in your system. Total stock value: ₹${totalStockValue.toLocaleString()}.`;
    }

    // 5. Customers & Creditors
    if (q.includes('customer') || q.includes('creditor') || q.includes('owe') || q.includes('credit') || q.includes('debt')) {
        if (q.includes('total') || q.includes('count')) {
            return `You have ${data.customers.length} regular customers and ${data.creditors.length} creditors.`;
        }
        return `Customers currently owe you a total of ₹${outstandingCredit.toLocaleString()} in outstanding credit.`;
    }

    // 6. Staff
    if (q.includes('staff') || q.includes('employee') || q.includes('salary')) {
        const activeStaff = data.staff.filter(s => s.status === 'Active');
        return `You have ${activeStaff.length} active staff members. Total staff count: ${data.staff.length}.`;
    }

    // 7. Vendors
    if (q.includes('vendor') || q.includes('supplier') || q.includes('purchase')) {
        return `You have ${data.vendors.length} vendors registered. Total purchases recorded: ${data.purchases.length}.`;
    }

    // 8. Accounting & Profit
    if (q.includes('profit') || q.includes('margin') || q.includes('earn')) {
        if (q.includes('today')) {
            return `Today's net profit is ₹${todayProfit.toLocaleString()} (Sales: ₹${todaySales.toLocaleString()} - Expenses: ₹${todayExpenses.toLocaleString()}).`;
        }
        return `Your all-time total profit is ₹${totalProfit.toLocaleString()}.`;
    }

    // 9. KOT & Orders
    if (q.includes('kot') || q.includes('kitchen')) {
        const pendingKots = data.kots.filter(k => k.type === 'NEW');
        return `There are currently ${pendingKots.length} new KOTs in the system.`;
    }

    // 10. Recycle Bin
    if (q.includes('recycle bin') || q.includes('deleted')) {
        return `You have ${data.deletedItems.length} items in your recycle bin. You can restore them anytime!`;
    }

    // 11. Calculator & Tools
    if (q.includes('calculator') || q.includes('calculate')) {
        return "I have a built-in calculator you can use! Just open the Calculator screen from the menu.";
    }

    // 12. Calendar & Reminders
    if (q.includes('calendar') || q.includes('reminder') || q.includes('schedule')) {
        return `You have ${data.reminders.length} active reminders. Check your calendar for the full schedule!`;
    }

    // 13. Notes
    if (q.includes('note')) {
        return `You have ${data.notes.length} notes saved across ${data.noteCategories.length} categories.`;
    }

    // 14. Weather
    if (q.includes('weather')) {
        return "I can check the weather for you! Just head over to the Weather screen in the menu.";
    }

    // 15. General Greetings & Identity
    if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
        return "Hello! I'm Leo, your business assistant. How can I help you with your data today?";
    }
    if (q.includes('who are you') || q.includes('what are you')) {
        return "I'm Leo, a specialized AI built to manage your OB Pro business data. I can track your sales, expenses, inventory, and more!";
    }
    if (q.includes('thank')) {
        return "You're welcome! I'm always here to help you grow your empire.";
    }
    if (q.includes('how are you')) {
        return "I'm functioning at 100% efficiency, sir! Ready to analyze your business data.";
    }

    const confusedResponses = [
        "I'm not quite sure about that specific detail. Could you ask about sales, profit, or stock?",
        "I didn't catch that. Try asking 'What's my profit today?' or 'Show me low stock items'.",
        "I'm best at answering questions about your business numbers. What would you like to check?",
        "Hmm, I don't have a specific answer for that. Try asking for a 'business summary'!"
    ];
    return confusedResponses[Math.floor(Math.random() * confusedResponses.length)];
};
