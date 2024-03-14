const ProductModel = require("../models/Product");
const SizeModel = require("../models/Size");
const CategoryModel = require("../models/Category");
const jwt = require("jsonwebtoken");

class ProductController {
  async createProduct(req, res) {
    try {
      const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    // Kiểm tra xem token có đúng định dạng Bearer không
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid  token format" });
    }

    // Lấy phần token sau "Bearer "
    const tokenValue = token.slice(7);

    const secretKey = req.app.get("secretKey");

    const decodedToken = jwt.verify(tokenValue, secretKey);

    // Giờ đây bạn có thể sử dụng decodedToken để lấy thông tin từ payload
    const userId = decodedToken.userId;
      const { name, description, price, stockQuantity, sizes, categoryId } = req.body;

      const imagePaths = req.files ? req.files.map(file => ({ imagePath: file.path })) : [];
   

      const product = new ProductModel({
        name,
        description,
        price,
        stockQuantity,
        sizes,  
        category: categoryId,
        images: imagePaths,
      });

      await product.save();

      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await ProductModel.find()
        .populate({ path: "sizes", model: SizeModel })  // Populate sizes with the Size model
        .populate({ path: "category", model: CategoryModel });  // Populate category with the Category model

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getProductById(req, res) {
    try {
      const productId = req.params.id;

      const product = await ProductModel.findById(productId)
        .populate({ path: "sizes", model: SizeModel })  // Populate sizes with the Size model
        .populate({ path: "category", model: CategoryModel });  // Populate category with the Category model

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async updateProduct(req, res) {
    try {
      const productId = req.params.id;

      // Check if the product with the given ID exists
      const existingProduct = await ProductModel.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check for authorization, assuming you have a userId stored in the decoded token
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json({ error: "Token not provided" });
      }

      if (!token.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid token format" });
      }

      const tokenValue = token.slice(7);
      const secretKey = req.app.get("secretKey");

      const decodedToken = jwt.verify(tokenValue, secretKey);

      const userId = decodedToken.userId;

      // Check if the user is the owner of the product

      // Extract updated fields from the request body
      const { name, description, price, stockQuantity, sizes, categoryId } = req.body;

      // Update the existing product
      existingProduct.name = name || existingProduct.name;
      existingProduct.description = description || existingProduct.description;
      existingProduct.price = price || existingProduct.price;
      existingProduct.stockQuantity = stockQuantity || existingProduct.stockQuantity;
      existingProduct.sizes = sizes || existingProduct.sizes;
      existingProduct.category = categoryId || existingProduct.category;

      // Save the updated product
      await existingProduct.save();

      res.status(200).json({ message: "Product updated successfully", product: existingProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }


  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
  
      // Check if the product with the given ID exists
      const existingProduct = await ProductModel.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Check for authorization and role
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json({ error: "Token not provided" });
      }
  
      if (!token.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid token format" });
      }
  
      const tokenValue = token.slice(7);
      const secretKey = req.app.get("secretKey");
  
      const decodedToken = jwt.verify(tokenValue, secretKey);
  
      // Check if the user is an admin
      if (decodedToken.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized, only admins can delete products" });
      }
  
      // Delete the product
      await existingProduct.deleteOne();
  
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  
  
  
}



module.exports = new ProductController();
