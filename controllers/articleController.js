const Article = require("../models/Article");
const fs = require("fs");

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort("-createdAt");
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت مقالات" });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, authors, journal, year, doi, award, featured } = req.body;

    const newArticle = new Article({
      title,
      authors: JSON.parse(authors),
      journal,
      year,
      doi,
      award,
      featured: featured === "true",
      pdfPath: req.file.path,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "مقاله پیدا نشد" });

    let newPdfPath = article.pdfPath;
    if (req.file) {
      fs.unlinkSync(article.pdfPath);
      newPdfPath = req.file.path;
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        authors: JSON.parse(req.body.authors),
        featured: req.body.featured === "true",
        pdfPath: newPdfPath,
      },
      { new: true }
    );

    res.json(updatedArticle);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "مقاله پیدا نشد" });

    fs.unlinkSync(article.pdfPath);
    await Article.findByIdAndDelete(req.params.id);

    res.json({ message: "مقاله حذف شد" });
  } catch (error) {
    res.status(500).json({ message: "خطا در حذف مقاله" });
  }
};
