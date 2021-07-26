# CI-Bot

## Setup
CI-Bot must be run in combination with a docker-compose setup.

### Env
  - DOCKER_COMPOSE_DIRECTORY=[Path to docker compose]

### Shared Files
If you are running this in a docker container you must share the docker socket. Additionally, you must share your top level docker compose file and mirror the path in your host in your vm. [Fixing this hacky requirement is at the top of the TODO list]
  - /var/run/docker.sock:/var/run/docker.sock
  - ./docker-compose.yml:/vol/services/docker-compose.yml

### docker-compose.yml
* To track services with CI-Bot, you must include an environment variable `BINGUS_TRACK=true`
* You must also build from a URL context in order for your service to be updated automatically. Specify your desired deploy branch with `#<branch_name>`, otherwise the hook will be bound to your default branch.
* Point your git update hooks to `/update-hook/:service_name` for each service. 
* The frontend relies on the `VIRTUAL_HOST` env variable to display apps against misc services.
## TODO
* Volumes have to be mounted in the correct directory mirror on the container to mount correctly, there must be a way to
  work around this
* Make different kinds of update hook endpoints (support github org hooks)
* Implement an option to nightly build instead of hook
* `/update-hook` is highly DDoS vulnerable, validate with signature
* Don't rely on `VIRTUAL_HOST` presence
