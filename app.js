const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();
const port = 3000;



const upload = multer({dest: 'imagenes/'});

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456789',
    database: 'tiendamg'
});
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'html')));
app.use (express.static('html'));

app.post('/guardar_consulta',(req, res) => {
    const { nombre, apellido,rut, email,telefono,razon,descripcion,imagen} = req.body;
    const sql = 'INSERT INTO consultas ( nombre, apellido, rut,email,telefono,razon,descripcion,imagen) VALUES (?, ?, ?, ?, ?,?,?,?)';
    connection.query(sql, [ nombre, apellido, rut,email,telefono,razon,descripcion,imagen], (err, result) => {
        if (err) throw err;
        console.log('Contacto ingresado correctamente.');
        res.redirect('/index.html');
    });
});

app.post('/guardar_producto',(req, res) => {
    const { nombre, cantidad, precio } = req.body;
    const sql = 'INSERT INTO carrito (nombre, cantidad, precio) VALUES (?, ?, ?)';
    connection.query(sql, [nombre, cantidad, precio], (err, result) => {
        if (err) throw err;
        console.log('Producto insertado correctamente.');
        res.redirect('/');
    });
    
});

app.delete('/eliminar_producto/:idcarrito', (req, res) => {
    const idcarrito = req.params.idcarrito;
    const sql = 'DELETE FROM carrito WHERE idcarrito = ?';
    connection.query(sql, [idcarrito], (err, result) => {
        if (err) throw err;
        console.log('Producto eliminado correctamente.');
        res.sendStatus(200); 
    });
});

app.post('/modificar_datos', (req, res) => {
    const {id, nombre, apellido, alias, correo, password } = req.body;
    const sql = 'UPDATE registro SET nombre = ?, apellido = ?, alias = ?, email = ?, contraseña = ? WHERE id = ?';
    connection.query(sql, [nombre, apellido, alias, correo, password, id], (err, result) => {
        if (err) {
            console.error('Error al modificar los datos:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        console.log('Datos modificados correctamente.');
        res.redirect('/modificardatos.html');
    });
});

app.get('/registro', (req, res) => {
    connection.query('SELECT * FROM registro', (err, rows) => {
        if (err) throw err;
        res.send(rows);
    });
});



app.get('/carrito', (req, res) => {
    connection.query('SELECT * FROM carrito', (err, rows) => {
        if (err) throw err;
        res.send(rows);
    });
});

app.get('/consultas', (req, res) => {
    connection.query('SELECT * FROM consultas', (err, rows) => {
        if (err) throw err;
        res.send(rows);
    });
});

app.use(express.urlencoded({ extended: true }));
app.post('/login', (req, res) => {
    const { correo, password } = req.body;
    
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND contraseña = ?';
    connection.query(sql, [correo, password], (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            res.send('<h2>Ocurrió un error al iniciar sesión. Inténtalo de nuevo más tarde.</h2>');
            return;
        }

        if (results.length > 0) {
            res.redirect('/login.html');
        } else {
            res.send('<h2>No se puede acceder.</h2>');
        }
    });
});

// Ruta para manejar el registro de usuario
app.post('/registrar_usuario', (req, res) => {
    const { correo, contraseña, rol } = req.body;

    const query = 'INSERT INTO usuarios (correo, contraseña, rol) VALUES (?, ?, ?)';
    connection.query(query, [correo, contraseña, rol], (err, result) => {
        if (err) {
            console.error('Error al registrar el usuario:', err);
            res.send('Error al registrar el usuario');
        } else {
            console.log('Usuario registrado exitosamente:', result);
            res.send('Usuario registrado exitosamente');
            res.redirect('/iniciosesion.html');
        }
    });
});
// Nueva ruta para mostrar todos los usuarios
app.get('/usuarios', (req, res) => {
    const query = 'SELECT * FROM usuarios';

    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            res.send('Error al obtener los usuarios');
        } else {
            res.json(result);
        }
    });
});

// Nueva ruta para obtener los detalles de un usuario
app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM registro WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener los detalles del usuario:', err);
            res.status(500).send('Error al obtener los detalles del usuario');
        } else {
            res.json(result[0]);
        }
    });
});

// Nueva ruta para eliminar un usuario
app.delete('/eliminar_usuario/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM registro WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            res.status(500).send('Error al eliminar el usuario');
        } else {
            res.status(200).send('Usuario eliminado exitosamente');
        }
    });
});

// Ruta para manejar el inicio de sesión
app.post('/iniciar_sesion', (req, res) => { // Define una ruta POST para '/iniciar_sesion'
    const { correo, contraseña } = req.body; // Extrae 'correo' y 'contraseña' del cuerpo de la solicitud

    // Define la consulta SQL para obtener el rol del usuario que coincida con el correo y la contraseña
    const query = 'SELECT rol FROM usuarios WHERE correo = ? AND contraseña = ?';

    // Ejecuta la consulta SQL con los valores de 'correo' y 'contraseña'
    connection.query(query, [correo, contraseña], (err, results) => {
        if (err) { // Si hay un error en la consulta
            console.error('Error al iniciar sesión:', err); // Imprime el error en la consola
            res.send('Error al iniciar sesión'); // Envía una respuesta de error al cliente
        } else if (results.length > 0) { // Si la consulta devuelve al menos un resultado
            const rol = results[0].rol; // Obtiene el rol del usuario del primer resultado
            if (rol === 1) { // Si el rol es 1 (administrador)
                res.redirect('/administrador.html'); // Redirige a la página del administrador
            } else if (rol === 2) { // Si el rol es 2 (usuario normal)
                res.redirect('/login.html'); // Redirige a la página del usuario
            }
        } else { // Si no se encuentra ningún usuario con las credenciales proporcionadas
            res.send('Correo o clave incorrectos'); // Envía una respuesta indicando que las credenciales son incorrectas
        }
    });
});

// Middleware para parsear el cuerpo de la solicitud
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos de la carpeta 'imagenes'
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Ruta para servir el formulario HTML
app.use(express.static(path.join(__dirname, 'pagina_principal')));

// Ruta para manejar la subida de imágenes
app.post('/subir_imagenes', upload.single('imagen'), (req, res) => {
    // Extrae 'nombre' y 'descripcion' del cuerpo de la solicitud
    const { nombre, descripcion } = req.body;
    // Extrae el nombre del archivo subido desde la solicitud
    const imagen = req.file.filename;
    // Define la consulta SQL para insertar los datos en la tabla 'imagenes'
    const query = 'INSERT INTO imagenes (nombre, descripcion, imagen) VALUES (?, ?, ?)';
    // Ejecuta la consulta SQL con los valores extraídos
    connection.query(query, [nombre, descripcion, imagen], (err) => {
        // Si hay un error, lanza una excepción
        if (err) throw err;
        // Si la inserción es exitosa, redirige al usuario a la página principal
        res.redirect('/');
    });
});

// Ruta para obtener las imágenes
app.get('/imagenes', (req, res) => {
    const query = 'SELECT nombre, descripcion, imagen FROM imagenes';
    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos: ' + err.stack);
            res.status(500).send('Error al obtener los datos de la base de datos.');
            return;
        }
        res.json(result);
    });
});

app.listen(port, () =>
{
    console.log('Servidor iniciado en http://localhost:' + port);
})

