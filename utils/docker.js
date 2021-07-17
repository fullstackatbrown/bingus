const Docker = require('dockerode')
const docker = new Docker({socketPath: '/var/run/docker.sock'})
const compose = require('docker-compose')
const YAML = require('yaml')

exports.services = async () => {
	let containers = await docker.listContainers({all: true})
	const composeConfigData = await compose.config({cwd: process.env.DOCKER_COMPOSE_DIRECTORY || "./"})
	const composeConfig = YAML.parse(composeConfigData.out)
	containers = containers.map(container => {
		const service = container.Labels['com.docker.compose.service']
		const serviceCompose = composeConfig.services[service]
		const hostname = serviceCompose.environment ? serviceCompose.environment.VIRTUAL_HOST || null : null
		const tracked = serviceCompose.environment ? !!serviceCompose.environment.BINGUS_TRACK : false
		const context = serviceCompose.build ? serviceCompose.build.context || null : null
		return {
			name: container.Names[0],
			state: container.State,
			status: container.Status,
			tracked,
			hostname,
			context,
			service,
		}
	})
	return containers
}

exports.getService = async (service) => {
	const containers = await this.services()
	return containers.find(container => container.service === service)
}

exports.update = async (service) => {
	const container = await this.getService(service)
	if (!container) throw `Could not find service [${service}]`
	if (!container.tracked) throw `Service [${service}] is not tracked`
	await compose.buildOne(container.service, {cwd: process.env.DOCKER_COMPOSE_DIRECTORY || "./"})
	await compose.upOne(container.service, {cwd: process.env.DOCKER_COMPOSE_DIRECTORY || "./"})
	console.log(`Successfully updated service [${service}]`)
}

exports.updateAll = async () => {
	const containers = await this.services()
	for (const container of containers) {
		try {
			await this.update(container.service)
		} catch (e) {
			console.error("Build error:", e)
		}
	}
}
