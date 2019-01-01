var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Partido = require('../models/partido');

// ==========================================
// Obtener todos los partidos
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Partido.find({})
        .skip(desde) 
        .limit(5)   //paginas hasta máximo 5 registros por página
        .populate('usuario', 'nombre email')   //Esto es para saber qué usuario ha creado el partido
        .exec(
            (err, partidos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando partido',
                        errors: err
                    });
                }

                Partido.count({}, (err, conteo)=>{
                   
                    res.status(200).json({
                        ok: true,
                        partidos: partidos,
                        total: conteo
                    });
                })



            });
});


// ==========================================
// Actualizar partido
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Partido.findById(id, (err, partido) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar partido',
                errors: err
            });
        }

        if (!partido) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El partido con el id ' + id + ' no existe',
                errors: { message: 'No existe un partido con ese ID' }
            });
        }


        partido.equipo_local = body.equipo_local;
        partido.equipo_visitante = body.equipo_visitante;
        partido.usuario = req.usuario._id;

        partido.save((err, partidoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar partido',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                partido: partidoGuardado
            });

        });

    });

});



// ==========================================
// Crear un nuevo partido
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var partido = new Partido({
        equipo_local: body.equipo_local,
        equipo_visitante: body.equipo_visitante,
        usuario: req.usuario._id
    });

    partido.save((err, partidoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear partido',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            partido: partidoGuardado
        });


    });

});


// ============================================
//   Borrar un partido por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Partido.findByIdAndRemove(id, (err, partidoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el partido',
                errors: err
            });
        }

        if (!partidoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un partido con ese id',
                errors: { message: 'No existe un partido con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            partido: partidoBorrado
        });

    });

});


module.exports = app;