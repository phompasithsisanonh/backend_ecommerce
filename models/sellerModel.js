const { Schema, model } = require("mongoose");
const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    seller_code:{
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "seller",
    },
    status: {
      type: String,
      default: "pending",
    },
    payment: {
      type: String,
      default: "inactive",
    },
    method: {
      type: String,
      required: true,
    },
    shopInfo: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);
sellerSchema.virtual("authorOrders", {
  ref: "authorOrders",
  localField: "_id",
  foreignField: "sellerId",
});

sellerSchema.virtual("transaction", {
  ref: "transaction",
  localField: "_id",
  foreignField: "sellerId",
});
sellerSchema.virtual("productsModel", {
  ref: "productsModel",
  localField: "_id",
  foreignField: "sellerId",
});
sellerSchema.virtual("adminWallets", {
  ref: "adminWallets",
  localField: "_id",
  foreignField: "sellerId",
});
module.exports = model("SellerModel", sellerSchema);
