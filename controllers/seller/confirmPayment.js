const authOrderModel = require("../../models/authOrder");
const customerOrder = require("../../models/customerOrder");
const products = require("../../models/productModel");
const amount_seller = require("../../models/amount_seller_model");
const tranfer_seller = require("../../models/transaction");
const admin_wallet = require("../../models/adminWallet");
const confirmed = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status  } = req.body;

    if (payment_status === "ຈ່າຍແລ້ວ") {
      const findf = await authOrderModel.findById(id);
      const salesCount = {};
      // // // นับยอดขายของสินค้าแต่ละตัว

      findf.products.forEach((order) => {
        const { _id, quantity } = order;
        console.log(_id, quantity);
        if (salesCount[_id]) {
          salesCount[_id] += quantity;
        } else {
          salesCount[_id] = quantity;
        }
      });
      // // อัปเดตยอดขายใน productModel
      for (const productId in salesCount) {
        const quantitySold = salesCount[productId];
        await products.findByIdAndUpdate(
          productId,
          {
            $inc: { sale: quantitySold }, // เพิ่มยอดขายให้สินค้า
          },
          { new: true }
        );
      }
      /////ບັນທືກຈຳນວນເງິນ
      const findSellerId = await authOrderModel.findById(id);
      if (!findSellerId) {
        return res.status(404).json({ message: "Order not found" });
      }
      // ค้นหาข้อมูลยอดเงินของผู้ขาย

      const findAmount = await amount_seller.findOne({
        sellerId: findSellerId.sellerId,
      });
      const calute_price =
        findSellerId.price -
        Math.floor((findSellerId.price * findSellerId.commission) / 100);
      console.log(calute_price);
      await authOrderModel.findByIdAndUpdate(id, {
        total_real_money: calute_price,
        commission: 5,
      });
      if (findAmount) {
        // อัปเดตยอดขายรวมของผู้ขาย
        await amount_seller.findByIdAndUpdate(findAmount._id, {
          $inc: { totalSales: calute_price }, // ใช้ $inc เพื่อบวกค่าเข้าไป
        });
      } else {
        // ถ้าไม่มีข้อมูล ให้สร้างใหม่
        await amount_seller.create({
          sellerId: findSellerId.sellerId,
          totalSales: calute_price,
        });
      }
      await admin_wallet.create({
        sellerId: findSellerId.sellerId,
        amount: Math.floor((findSellerId.price * findSellerId.commission) / 100),
      });
    }
    if (payment_status) {
      const s = await authOrderModel.findByIdAndUpdate(id, {
        payment_status: payment_status,
      });
      await customerOrder.findByIdAndUpdate(s.orderId, {
        payment_status: payment_status,
      });

      res.status(200).json({
        message: "ອັບເດດສຳເລັດ",
        s,
      });
    }

    // If delivery_status is provided, update it after payment_status update
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const confirmed_delivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body;
    if (delivery_status) {
      const s = await authOrderModel.findByIdAndUpdate(id, {
        delivery_status: delivery_status,
      });
      await customerOrder.findByIdAndUpdate(s.orderId, {
        delivery_status: delivery_status,
      });
      res.status(200).json({
        message: "ອັບເດດສຳເລັດ",
        s,
      });
    }

    // If delivery_status is provided, update it after payment_status update
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const add_tranfer = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const {
      bank,
      seller_name_bank,
      amount,
      seller_account_bank_number,
    } = req.body;

    // Ensure all required fields are provided
    if (!bank || !seller_name_bank || !amount || !seller_account_bank_number) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const findAmount = await amount_seller.findOne({ sellerId: sellerId });
    if (findAmount.totalSales === 0) {
      res.status(404).json({ message: "ຈຳນວນເງິນບໍພໍພຽງ" });
    } else {
      // Create the transfer record
      const ran = Math.floor(100000 + Math.random() * 900000);
      const data = await tranfer_seller.create({
        sellerId,
        bank,
        seller_name_bank,
        amount,
        seller_account_bank_number,
        code_payments_seller: ran,
      });

      res.status(201).json({ message: "Transfer added successfully", data });
    }
  } catch (err) {
    console.error("Error adding transfer:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.confirmed_delivery = confirmed_delivery;
module.exports.confirmed = confirmed;
module.exports.add_tranfer = add_tranfer;
