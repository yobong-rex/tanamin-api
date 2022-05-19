const Hapi = require('@hapi/hapi');
const con =require('./connection');
const routes = require('./route')

const init = async () => {

    const server = Hapi.server({
        port: 5000,
        host: 'localhost',
        routes: {
            cors: {
              origin: ['*'],
            },
          },
    });

    con.authenticate().then(()=>{
        console.log('connected db');
    }).catch(()=>{
        console.log('error connected db');
    })
    
    // const rotes = require('./route')(server,connection)
    server.route(routes);
    await server.start();


    console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();