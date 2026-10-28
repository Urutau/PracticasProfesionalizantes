const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT, () => {console.log(`http://localhost:${PORT}`)
})

//Ruta: mensaje de bienvenida
app.get('/', (req, res) => {
    res.json({mensaje: 'Hola desde Node'});
});

//Ruta: Devolver los productos
app.get('/api/productos', (req, res) => {
    res.json(productos);
});

//Ruta: Buscar un producto por ID

app.get('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find(p => p.id == id);
    if (!producto){
        return res.status(404).json({error: 'Producto no encontrado'});
    }
    res.json(producto);
});


//Ruta: Crear un producto nuevo
app.post('/api/productos', (req, res) => {
    const { nombre, precio, categoria } = req.body || {};
    
    if (!nombre || precio < 0 || !categoria){
        return res.status(400)
        .json({error: 'Dato ausente o precio menor a 1'});
    }
    
    const nuevo = {id: productos.length + 1, nombre, precio, categoria};
    productos.push(nuevo);
    res.status(201).json(nuevo);
})

//Ruta: Eliminar un producto por ID

app.delete('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const [productoEliminado] = productos.splice(index, 1);
    res.json(productoEliminado); 
});

// Ruta: Actualizar un producto por ID
app.put('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { nombre, precio, categoria } = req.body || {};

    if (!nombre || typeof precio !== 'number' || precio < 0 || !categoria) {
        return res.status(400).json({ error: 'Datos ausentes o precio inválido' });
    }

    producto.nombre = nombre;
    producto.precio = precio;
    producto.categoria = categoria;

    res.json(producto);
});

app.use(express.json());

//Listado de productos:

const productos = [
 { id: 1, nombre: 'Café con leche', precio: 1800, categoria: 'bebida' },
 { id: 2, nombre: 'Medialuna', precio: 900, categoria: 'comida' },
 { id: 3, nombre: 'Tostado de jamón y queso', precio: 3500, categoria: 'comida' },
 { id: 4, nombre: 'Agua mineral', precio: 1200, categoria: 'bebida' }
];