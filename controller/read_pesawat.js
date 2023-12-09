const Pesawat = require('../models/pesawat');

exports.getPesawat = async (req, res) => {
    const pesawat = await Pesawat.findAll({
        include: [
            {
                model: KelasPesawat,
                as: 'kelas'
            }
        ]
    });

    res.status(200).json({
        data: pesawat
    })
}