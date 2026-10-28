//Parte 2 - Server:

const express = require('express');
const app = express();
const PORT = 3000;

//Parte 3 - Listar los productos

app.get('/api/productos', (req, res) => {
    res.json(productos);
});

app.listen(PORT, () => {console.log(`http://localhost:${PORT}`)
})

//Parte 4 - Buscar un producto por ID

app.get('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find(p => p.id == id);
    if (!producto){
        return res.status(404).json({error: 'Producto no encontrado'});
    }
    res.json(producto);
});

app.use(express.json());

app.post('/api/productos', (req, res) => {
    const { nombre, precio, categoria } = req.body || {};

    if (!nombre || precio < 0 || !categoria){
        return res.status(404)
        .json({error: 'Dato ausente o precio menor a 1'});
    }

    const nuevo = {id: productos.length + 1, nombre, precio, categoria};
    productos.push(nuevo);
    res.status(201).json(nuevo);
})

//Listado de productos:

const productos = [
 { id: 1, nombre: 'Café con leche', precio: 1800, categoria: 'bebida' },
 { id: 2, nombre: 'Medialuna', precio: 900, categoria: 'comida' },
 { id: 3, nombre: 'Tostado de jamón y queso', precio: 3500, categoria: 'comida' },
 { id: 4, nombre: 'Agua mineral', precio: 1200, categoria: 'bebida' }
];