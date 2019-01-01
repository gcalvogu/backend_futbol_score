var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Partido = require('../models/partido');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de colección
    var tiposValidos = ['partidos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida'}
        });
    }

    if (!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe de seleccionar una imagen'}
        });
    }

    //Obtener nombre del archivo
    var archivo= req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado [ nombreCortado.length - 1];


    //Solo estas extensiones aceptamos
    var extensionesValidas =  ['png','jpg','jpeg','svg'];

    if( extensionesValidas.indexOf( extensionArchivo ) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ')}
        });
    }

    //Nombre de archivo personalizado

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    //Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);

        

    })

    

});



function subirPorTipo(tipo, id, nombreArchivo, res) {

if ( tipo === 'usuarios'){

Usuario.findById( id, (err, usuario)=>{

    if (!usuario){
        return res.status(400).json({
            ok: true,
            mensaje: 'No existe usuario',
            errors: { message: 'Usuario no existe'}
            });
    }

    var pathViejo = './uploads/usuarios' + usuario.img;

    //Si existe, elimina la imagen anterior
    if (fs.existsSync(pathViejo)){
     fs.unlink( pathViejo );
 }
    usuario.img = nombreArchivo;

    usuario.save( (err, usuarioActualizado) =>{

        usuarioActualizado.password = ':-)';

        return res.status(200).json({
        ok: true,
        mensaje: 'Imagen de usuario actualizada',
        usuario: usuarioActualizado
        });
    })

});

}

if ( tipo === 'partidos'){
    Partido.findById( id, (err, partido)=>{

        if (!partido){
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe partido',
                errors: { message: 'Partido no existe'}
                });
        }
        var pathViejo = './uploads/partidos' + partido.img;
    
        //Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)){
         fs.unlink( pathViejo );
     }
        partido.img = nombreArchivo;
    
        partido.save( (err, partidoActualizado) =>{
    
            return res.status(200).json({
            ok: true,
            mensaje: 'Imagen del partido actualizada',
            partido: partidoActualizado
            });
        })
    
    });
}

}

module.exports = app;