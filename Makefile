.PHONY: default
default: lint

.PHONY: lint
lint:
	gjslint --recurse . \
			--disable "220,225" \
			--exclude_directories "node_modules"
