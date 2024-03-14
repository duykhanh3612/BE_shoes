const express = require("express");
const router = express.Router();
const productController = require("../App/controllers/Product");
const upload = require('../config/multer-config');

router.post("/create", upload.array("image", 5), productController.createProduct);


router.get("/products", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.delete("/delete/:id", productController.deleteProduct);
module.exports = router;
