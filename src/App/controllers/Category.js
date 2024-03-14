const CategoryModel = require("../models/Category");

class CategoryController {
  async createCategory(req, res) {
    try {
      const { name } = req.body;

      // Check if the category with the given name already exists
      const existingCategory = await CategoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ error: "Category with this name already exists" });
      }

      const newCategory = new CategoryModel({ name });
      await newCategory.save();

      res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllCategories(req, res) {
    try {
      const categories = await CategoryModel.find();
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCategoryById(req, res) {
    try {
      const categoryId = req.params.id;

      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const { name } = req.body;

      // Check if the category with the given ID exists
      const existingCategory = await CategoryModel.findById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Check if a category with the new name already exists
      if (name && name !== existingCategory.name) {
        const categoryWithNewName = await CategoryModel.findOne({ name });
        if (categoryWithNewName) {
          return res.status(400).json({ error: "Category with this name already exists" });
        }
      }

      // Update the category
      existingCategory.name = name || existingCategory.name;
      await existingCategory.save();

      res.status(200).json({ message: "Category updated successfully", category: existingCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCategory(req, res) {
    try {
      const categoryId = req.params.id;

      // Check if the category with the given ID exists
      const existingCategory = await CategoryModel.findById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Delete the category
      await existingCategory.remove();

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new CategoryController();
