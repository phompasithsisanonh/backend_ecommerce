const authOrder = require("../models/authOrder");
const products = require("../models/productModel"); // Import products model

const dashbord_admin = async (req, res) => {
  try {
    // Fetch paid orders
    const paidOrders = await authOrder.find({ payment_status: "ຈ່າຍແລ້ວ" });

    // Aggregate total sales per seller with date
    const total_sales = await authOrder.aggregate([
      {
        $match: {
          payment_status: "ຈ່າຍແລ້ວ", // ต้องเป็นออเดอร์ที่จ่ายแล้ว
        },
      },
      {
        $group: {
          _id: {
            sellerId: "$sellerId",
            date: { $dateToString: { format: "%d", date: "$createdAt" } }, // แปลงเป็น วันที่-เดือน-ปี
            month: { $dateToString: { format: "%m", date: "$createdAt" } }, // แปลงเป็น เดือน-ปี
            year: { $dateToString: { format: "%Y", date: "$createdAt" } }, // แปลงเป็น ปี
          },
          totalOrders: { $sum: 1 }, // นับจำนวนออเดอร์
          totalRevenue: { $sum: "$price" }, // รวมยอดขาย
        },
      },
      { $sort: { "_id.month": 1 } }, // เรียงตามวันที่
    ]);

    // Fetch all products
    const all_products = await products.find({});

    // Fetch pending orders
    const pendingOrders = await authOrder.find({ payment_status: "ລໍຖ້າ" });

    res.status(200).json({
      paid_orders: paidOrders,
      total_sales: total_sales, // ข้อมูลรวมออเดอร์ & ยอดขายแยกตามเดือน
      pending_orders: pendingOrders,
      all_products: all_products,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.dashbord_admin = dashbord_admin;
