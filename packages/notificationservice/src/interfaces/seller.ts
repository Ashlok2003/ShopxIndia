interface LowStockProduct {
    productName: string;
    quantity: number;
}

interface LowStockNotificationData {
    email: string;
    sellerName: string;
    lowStockProducts: LowStockProduct[];
    inventoryDashboardLink: string;
}


export { LowStockNotificationData, LowStockProduct };