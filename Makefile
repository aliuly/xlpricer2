PRICES_URL = https://aliuly.github.io/pipeline/prices-latest.json
PRICE_INCLUDES = public/includes/*
XLSX_ASSUMPTIONS = public/assumptions.csv
XLSX_COMPONENTS = public/preload.csv
XLSX_OUTPUT = pricing.xlsx
PIPELINE_OUTPUT = out.json


.PHONY: help install ci dev build preview test pipeline xlsx test


help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' Makefile | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2}'

node_modules: package.json
	npm install
	@touch $@

lint: node_modules ## run linting
	npm run lint

test: node_modules ## run tests
	: no tests currently available

install: node_modules ## Install npm dependencies

ci: package-lock.json ## Clean install npm dependencies (for CI/CD)
	npm ci
	@touch node_modules

dev: node_modules ## Start Vite dev server
	npm run dev

build: node_modules ## Build for production
	npm run build

preview: build ## Preview production build locally
	npm run preview

pipeline: node_modules ## Test pricing pipeline from CLI.  use PRICES_URL to change targets
	npx tsx src/prices/cli.ts $(PRICES_URL) -o $(PIPELINE_OUTPUT) --verbose $(PRICE_INCLUDES)

xlsx: node_modules ## Generate XLSX workbook from local data.  Override vars as needed
	npx tsx src/xlsx/cli.ts $(PRICES_URL) $(PRICE_INCLUDES) \
		-o $(XLSX_OUTPUT) \
		--assumptions $(XLSX_ASSUMPTIONS) \
		--components Components=$(XLSX_COMPONENTS) \
		--verbose


