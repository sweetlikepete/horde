test:
	./node_modules/.bin/mocha test/tests --recursive --reporter spec
	node test/lint/lint.js -v

 .PHONY: test
