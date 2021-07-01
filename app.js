var express = require('express');
var bodyParser = require('body-parser');
var server = express();
server.use(bodyParser.json());

//parte de modelos:
//model debe tener una propiedad `clientes` como objeto
//debe tener una propiedad `clientes` como objeto
//debe tener un método de reinicio para reiniciar el modelo
//debe ser una función
//debe restablecer los clientes a {}
var model = {  
    clients: {},
    reset: function(){
        this.clients = {};
    },
    // debe ser una funcion
    // debe añadir clientes como una propiedad
    // debe añadir clientes a un array
    //debe agregar varias citas en el orden a medida que se agregan, y debe manejar varios clientes
    //las citas deben tener un estado inicial y estar "pendientes"
    addAppointment: function(name, date){ 
        date.status = 'pending';
        this.clients[name] ? this.clients[name].push(date) : this.clients[name] = [date];
    },
    //????Las citas deben poder cambiar de estado utilizando los métodos de asistencia, caducidad y cancelación.
    //`asistir` debe recibir un nombre y una fecha, y cambiar el estado a` asistido`
    attend: function(name, date){
        if(this.clients.hasOwnProperty(name)){
            let findDate = this.clients[name].find(n => n.date === date);
            findDate.status = 'attended';
            return findDate;
        }else{
            return undefined;
        }
    },
    //Expirado debe recibir un nombre y una fecha y cambiar el estado a "expirado"
    expire: function(name, date){
        if(this.clients.hasOwnProperty(name)){
            let findDate = this.clients[name].find(n => n.date === date);
            findDate.status = 'expired';
            return findDate;
        }else{
            return undefined;
        }
    },
    //Cancelar debe recibir un nombre y una fecha y cambiar su estado a "cancelado"
    cancel: function(name, date){
        if(this.clients.hasOwnProperty(name)){
            let findDate = this.clients[name].find(n => n.date === date);
            findDate.status = 'cancelled';
            return findDate;
        }else{
            return undefined;
        }
    },
    //Crear un metodo "erase" para borrar las citas (appointments)
    // debe ser una funcion
    //???debe recibir un nombre y si recibe una fecha debe borrar la cita con esa fecha
    //???debe recibir un nombre y si recibe un estado debe borrar todas las citas con ese estado
    erase: function(name, arg = ''){
        let status = ['pending', 'attended', 'expired', 'cancelled'];
        let result;
        if(this.clients.hasOwnProperty(name)){
            if(arg === '')	return 'Ingrese la cita o el status';
            if( status.includes(arg)){
                result = this.clients[name].filter(d => d.status === arg);
                this.clients[name] = this.clients[name].filter(d => d.status !== arg);
                return result;
            }
            let dateToErase = this.clients[name].findIndex(d => d.date === arg);
            if(dateToErase === -1){
                return undefined;
            }else{
                result = this.clients[name].splice(dateToErase, 1);
                return result;
            }
        }else{ 
            return undefined;
        }
    },
    //Debe ser una funcion
    //Debe retornar un "array" con la cita del cliente
    // si se aprobó un estado, solo debe devolver las citas con ese estado
    getAppointments: function(name, status = ''){
        if (this.clients.hasOwnProperty(name)){
            if (status === '')	return this.clients[name];
            else return this.clients[name].filter(d => d.status === status);
        }
        return undefined;
    },
    //Debe ser un metodo
    // Debe retornar un array con los nombres de los clientes
    getClients: function(){
        return Object.keys(this.clients);
    }
}

//parte de rutas con express:
// Debe responder con el objeto clientes
server.get('/api', (req, res) => {
	const clients = model.clients;
	res.json(clients);
});
//responde con un estado 400 (solicitud incorrecta) y un mensaje "string", si el cliente no paso
//responde con un estado 400 (solicitud incorrecta) y un mensaje "string", si el cliente no era un "string"
//Añade una cita a un cliente
// Responde con la cita despues de añadirla
server.post('/api/Appointments', (req, res) => {
	const { client, appointment } = req.body;
	// let result;
	if(!client){
        return res.status(400).send('the body must have a client property');
    }
	if(typeof client !== 'string' || client === ''){
        return res.status(400).send('client must be a string');
    }
	if(!appointment){
        return res.status(400).send('the body must have an appointment property');
    }
	let result = model.addAppointment(client, appointment);
	return res.status(200).json(appointment);
});
//Responde con un estado 400 (solicitud incorrecta) y un mensaje "string", si el cliente no existe
//Responde con un estado 400 (solicitud incorrecta) y un mensaje "string", si el cliente no tiene una cita para esta fecha
//Responde con un estado 400 (solicitud incorrecta) y un mensaje "string", si la opción no es atender, vencer o cancelar
//Asistir a una cita si la opción aprobada por consulta es `asistir`
//expira una cita si la opción aprobada por consulta es "expirada"
//Cancelar una cita si la opción aprobada por consulta es `cancelar`
//Responde la cita modificada
server.get('/api/Appointments/clients', (req, res) => {
	const result = model.getClients();
	return res.status(200).send(result);
});
//Responde con un estado 400 y un mensaje "string" si el cliente no existe
// Borra una cita
// Borra todas las  de un cierto estado
//Responde con un array de citas borradas
server.get('/api/Appointments/:name/erase', (req, res) => {
	const { name } = req.params;
	const { date } = req.query;
	let client = model.getClients().includes(name),
	result;
	if(client === false){
        return res.status(400).send('the client does not exist');
    }
	result = model.erase(name, date);
	return res.status(200).json(result);
});
//??????No encuentro su test
server.get('/api/Appointments/:name', (req, res) => {
	const { name } = req.params,
	{ date, option } = req.query,
	status = ['attend', 'expire', 'cancel'],
	appointments = model.getAppointments(name);	
	let result;

	if(!appointments){
        return res.status(400).send('the client does not exist');
    }
	result = appointments.filter( a => a.date === date);
	if(result.length === 0){
        return res.status(400).send('the client does not have a appointment for that date');
    }
	if(!status.includes(option)){
        return res.status(400).send('the option must be attend, expire or cancel');
    }else{
		result = model[option](name,date);
		return res.status(200).json(result);
	}
});
//Responde con un array con el estado de las citas
server.get('/api/Appointments/getAppointments/:name', (req, res) => {
	const { name } = req.params,
	{ status } = req.query;
	let result;

	if(!model.getClients().includes(name)){
        return res.status(400).send('the client does not exist');
    }
	result = model.getAppointments(name, status);
	return res.status(200).json(result);

});

server.listen(3000);
module.exports = {model, server};
