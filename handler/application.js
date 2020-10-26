const axios = require('axios');
const md5 = require('md5');
const db = require('../db/dynamoDB');
const tablePlanet = process.env.TABLE_PLANET;
const tableAuth = process.env.TABLE_AUTH;

const { getResponse } = require('../common/response');

const resetTablePlanet = async _ => {
    const items = await db.findAll(tablePlanet);
    if (items.length) {
      for (let i=0; i<items.length; i++) {
        await db.deleteOne(tablePlanet, items[i].ID);
      }
    }
    const json = await axios.get('https://swapi.py4e.com/api/planets/?page=1')
    const newItems = json.data.results.map(item => {
      return {
        nombre: item.name,
        diametro: item.diameter,
        clima: item.climate,
        gravedad: item.gravity,
        terreno: item.terrain,
        superficieAgua: item.surface_water,
        poblacion: item.population,
        residentes: item.residents
      }
    })
    const data = await db.createMany(tablePlanet, newItems);

    return data
}

const resetTableUser = async _ => {
    const items = await db.findAll(tableAuth);
    if (items.length) {
      for (let i=0; i<items.length; i++) {
        await db.deleteOne(tableAuth, items[i].ID);
      }
    }
    const users = [
        { userName: 'mvargas', password: md5('mVARGAS@7')}
    ]
    const data = await db.createMany(tableAuth, users);

    return data
}

module.exports.resetApplication = async (event, context, callBack) => {
  const dataTablePlanet = await resetTablePlanet()
  const dataTableUser = await resetTableUser()
  const message = 'Success';
  const response = await getResponse(200, { message, data: { dataTablePlanet, dataTableUser } })

  return response
};
