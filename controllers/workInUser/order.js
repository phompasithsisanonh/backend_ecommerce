const customerOrder = require("../../models/customerOrder");
const cardModel = require("../../models/cardModel");
const authOrderModel = require("../../models/authOrder");
const moment = require("moment");
const Product = require("../../models/productModel");
const paymentCheck = async () => {
  try {
    const order = await customerOrder.findById(id);
    if (order.payment_status === "unpaid") {
      await customerOrder.findByIdAndUpdate(id, {
        delivery_status: "cancelled",
      });
      await authOrderModel.updateMany(
        {
          orderId: id,
        },
        {
          delivery_status: "cancelled",
        }
      );
    }
    return true;
  } catch (error) {
    console.log(error);
  }
};
const orderAdd = async (req, res) => {
  try {
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;
    const tempDate = moment().format("LLL");
    const findStock = products.flatMap((item) =>
      item.products.filter((i) => i.productInfo.stock === 1)
    );
    if (findStock.length > 0) {
      return res.status(404).json({
        message: "ສິນຄ້າບາງລາຍການໝົດສະຕ໋ອກ",
      });
    } else {
      let customerOrderProduct = [];
      let authorOrderData = [];
      let cardIds = [];
      const ran = Math.floor(100000 + Math.random() * 900000);
      const tw = ran;
      // Process each product
      products.forEach(({ products: proList, price: storePrice, sellerId }) => {
        let storeProducts = [];
        console.log(proList);
        proList.forEach(({ productInfo, quantity, _id }) => {
          const productData = { ...productInfo, quantity };
          customerOrderProduct.push(productData);
          storeProducts.push(productData);
          if (_id || productInfo._id)
            cardIds.push({ _id: _id, productInfo: productInfo._id });
        });

        // Store seller-specific order data
        authorOrderData.push({
          sellerId,
          orderId: null, // Temporary, will be updated later
          products: storeProducts,
          price: storePrice,
          payment_status: "unpaid",
          shippingInfo: "Easy Main Warehouse",
          delivery_status: "pending",
          date: tempDate,
          code_payment: tw,
        });
      });

      // // Create customer order
      const order = await customerOrder.create({
        customerId: userId,
        shippingInfo,
        products: customerOrderProduct,
        price: price + shipping_fee,
        payment_status: "ລໍຖ້າ",
        delivery_status: "pending",
        date: tempDate,
        code_payment: tw,
      });

      // // Update order ID in seller order data
      authorOrderData = authorOrderData.map((data) => ({
        ...data,
        orderId: order.id,
      }));

      // // Save seller order data
      await authOrderModel.insertMany(authorOrderData);
      // Remove products from cart cardModel.findByIdAndDelete(id)
      await Promise.all(
        cardIds.map(async (id) => {
          if (id._id) {
            await cardModel.findByIdAndDelete(id._id); // Await and use id._id
            console.log("one");
          } else if (id.productInfo) {
            console.log("two");
            await cardModel.findOneAndDelete({ productId: id.productInfo }); // Await here too
          }
        })
      );
      return res
        .status(200)
        .json({ message: "Order Placed Successfully", orderId: order.id });
    }

    // console.log(order.id)
    //   // Set a 30-minute timeout to delete the order if it hasn't been paid
    //   // setTimeout(async () => {
    //   //   const orderToCheck = await customerOrder.findById(order.id);
    //   //   if (orderToCheck && orderToCheck.payment_status === "unpaid") {
    //   //     await customerOrder.findByIdAndDelete(order.id);  // Delete the order
    //   //     console.log(`Order ${order.id} deleted due to timeout`);
    //   //   }
    //   // }, 2 * 60 * 1000); // 30 minutes in milliseconds
  } catch (error) {
    console.error("Order Placement Error:", error.message);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
const get_order = async (req, res) => {
  const { customerId, status } = req.params;

  try {
    let orders = [];
    if (status !== "all") {
      orders = await customerOrder.find({
        customerId: new ObjectId(customerId),
        delivery_status: status,
      });
    } else {
      orders = await customerOrder.find({
        customerId: new ObjectId(customerId),
      });
    }
    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const get_found_id = async (req, res) => {
  try {
    const { get_id } = req.body; // Array of IDs
    console.log(get_id);

    // Fetch products based on get_id
    const products = await Product.find({ _id: { $in: get_id } });

    // Filter products where stock === 1
    const outOfStockProducts = products.filter(
      (product) => product.stock === 1
    );

    // If any product is out of stock, return an error response
    if (outOfStockProducts.length > 0) {
      return res.status(404).json({
        message: "ສິນຄ້າບາງລາຍການໝົດສະຕ໋ອກ",
        outOfStockProducts,
      });
    }

    // If all products are in stock, return success
    res.status(200).json({
      message: "ສິນຄ້າມີພ້ອມ",
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const delete_customer_order = async (req, res) => {
  try {
    const { id } = req.params;
    await customerOrder.findByIdAndDelete(id);
    await authOrderModel.findOneAndDelete({orderId:id});
    res.status(200).json({
      message: "ລົບສຳເລັດ",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.orderAdd = orderAdd;
module.exports.get_order = get_order;
module.exports.get_found_id = get_found_id;
module.exports.delete_customer_order = delete_customer_order;
