var mongoose = require('mongoose');


var Schema = mongoose.Schema;



var partidoSchema = new Schema({

    equipo_local: { type: String, required: [true, 'El equipo local es necesario'] },
    equipo_visitante: { type: String, required: [true, 'El equipo visitante es necesario'] },
    img_local: { type: String, required: false },
    img_visitante: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref:'Usuario' }
 } ,{ collection: 'partidos'});


module.exports = mongoose.model('Partido', partidoSchema);