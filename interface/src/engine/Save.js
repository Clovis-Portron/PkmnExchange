
let Pokemon = require("./Pokemon");

class Save 
{
    static TeamIndex = 0x286D; // 0x2865 + count(0x1) + species(0x6+0x1)

    constructor(stream)
    {
        this.stream = new DataView(stream);
    }

    getTeam()
    {
        return new Promise((resolve, reject) => {

            let team = [];
            let count = this.stream.getUint8(0x2865);

            let start = Save.TeamIndex; 
            let trainer_start = start + 6*48;
            let name_start = trainer_start + 6*11;

            let requests = [];
            for(let i = 0; i < count; i++)
            {
                let pkmn = new Pokemon(
                    this.stream.buffer.slice(start + i*48, start + i*48 + 48),
                    this.stream.buffer.slice(name_start + i*11, name_start+i*11+11),
                    this.stream.buffer.slice(trainer_start + i*11, trainer_start+i*11+11),
                );
                requests.push(pkmn.load());
                team.push(pkmn);
            }
            Promise.all(requests).then(() => {
                resolve(team);
            })
        })

    }

    replacePokemon(index, pkmn)
    {
        if(index > 5)
            throw new Error("Index must be <= 5");
        let trainer_start = Save.TeamIndex + 6*48;
        let name_start = trainer_start + 6*11;
        for(let i = 0; i < pkmn.stream.buffer.byteLength; i++)
        {
            this.stream.setUint8(Save.TeamIndex+index*48+i, pkmn.stream.getUint8(i));
        }
        for(let i = 0; i < pkmn.nickname.buffer.byteLength; i++)
        {
            this.stream.setUint8(name_start+index*11+i, pkmn.nickname.getUint8(i));
        }
        for(let i = 0; i < pkmn.trainername.buffer.byteLength; i++)
        {
            this.stream.setUint8(trainer_start+index*11+i, pkmn.trainername.getUint8(i));
        }
    }

    generate()
    {
        throw new Error("Not implemented");
    }

}

module.exports = Save;