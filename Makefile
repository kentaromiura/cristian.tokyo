all:
	mkdir -p cdn
	git submodule update --init --recursive
	yarn
	(cd blog; yarn)

run:
	PORT=3000 node index

