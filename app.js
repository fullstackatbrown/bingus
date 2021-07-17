const express = require('express')
const bodyParser = require("body-parser")

const app = express()
const port = 80

// Add parsers
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const docker = require('./utils/docker')

const update = require('path')

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
	const containers = await docker.services()
	const apps = containers.filter(container => container.hostname)
	const services = containers.filter(container => !container.hostname)
	res.render('home', {apps, services})
})

app.post("/update-hook/github/:service", async (req, res) => {
	let info;
	if (req.is('application/json')) {
		info = req.body
	} else if (req.is('application/x-www-form-urlencoded')) {
		try {
			info = JSON.parse(req.body.payload)
		} catch {
			console.error(`Received invalid packet: ${info}`)
			return res.send()
		}
	}
	if (!info) return res.send() // Malformed packet
	const service = await docker.getService(req.params.service)
	if (!service) {
		console.error(`Service [${req.params.service}] does not exist`)
		return res.send()
	}
	const branch = service.context.split("#").slice(-1)[0]
	const targetBranch = info.ref.split('/').slice(-1)[0]
	if (branch && targetBranch === branch || !branch && targetBranch === info.repository.default_branch) {
		try {
			await docker.update(req.params.service)
			res.send()
		} catch (e) {
			console.error(e)
		}
	} else {
		console.error(`Did not update service [${req.params.service}]\nTarget Branch: ${branch}\nCommit Ref: ${info.ref}`)
	}
	res.send()
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
