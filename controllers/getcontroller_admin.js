const seller = require("../models/sellerModel");

const get_seller_admin = async (req, res) => {
  try {
    const findI = await seller.find({});
    res.status(200).json({
      data: findI,
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports.get_seller_admin  = get_seller_admin ;
