import express from "express";
import { db } from "./db.js";

const app = express();
app.use(express.json());

// 1. GET todos los productos
app.get("/productos", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos");
    res.status(200).json(filas);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 2. GET producto por ID
app.get("/productos/:id", async (req, res) => {
  try {
    const [filas] = await db.query(
      "SELECT * FROM productos WHERE id = ?",
      [req.params.id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 3. POST crear un nuevo producto
app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const [resultado] = await db.query(
      "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
      [nombre, precio, stock ?? 0]
    );
    res.status(201).json({
      id: resultado.insertId,
      nombre,
      precio,
      stock: stock ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 4. PUT actualizar todo el producto
app.put("/productos/:id", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const [resultado] = await db.query(
      "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre, precio, stock, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json({ id: Number(req.params.id), nombre, precio, stock });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 5. PATCH actualizar parcialmente (ej. solo precio o stock)
app.patch("/productos/:id", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const [resultado] = await db.query(
      `UPDATE productos SET 
        nombre = COALESCE(?, nombre), 
        precio = COALESCE(?, precio), 
        stock = COALESCE(?, stock) 
        WHERE id = ?`,
      [nombre ?? null, precio ?? null, stock ?? null, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// 6. DELETE eliminar producto
app.delete("/productos/:id", async (req, res) => {
  try {
    const [resultado] = await db.query(
      "DELETE FROM productos WHERE id = ?",
      [req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }
    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});