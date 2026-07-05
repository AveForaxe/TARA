const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

// Public: siapa saja bisa lihat produk
router.get("/", productController.getAllProducts);

// Admin only: CRUD produk
router.post("/", authGuard, roleCheck(["DEVELOPER", "ADMINISTRATOR", "KARANG TARUNA"]), productController.createProduct);
router.put("/:id", authGuard, roleCheck(["DEVELOPER", "ADMINISTRATOR", "KARANG TARUNA"]), productController.updateProduct);
router.delete("/:id", authGuard, roleCheck(["DEVELOPER", "ADMINISTRATOR"]), productController.deleteProduct);

module.exports = router;
