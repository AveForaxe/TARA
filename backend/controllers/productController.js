const prisma = require("../prisma/client");
const { logActivity } = require("../utils/logger");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil produk.", error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, category, price, description, icon } = req.body;
    const product = await prisma.product.create({
      data: { title, category, price: parseInt(price), description, icon },
    });
    logActivity(req, "Tambah Produk", { title, category });
    res.status(201).json({ message: "Produk berhasil ditambahkan!", data: product });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan produk.", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, category, price, description, icon, isActive } = req.body;
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { title, category, price: price ? parseInt(price) : undefined, description, icon, isActive },
    });
    logActivity(req, "Update Produk", { id: req.params.id });
    res.json({ message: "Produk diperbarui!", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui produk.", error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    logActivity(req, "Hapus Produk", { id: req.params.id });
    res.json({ message: "Produk dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus produk.", error: err.message });
  }
};
