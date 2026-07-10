# xlpricer v2

## TODO
* [x] Fix Inflation calculation
* [x] Volumes Pricing calculation
* [x] Overview
* [x] ESA
* [x] Fix multitab components
* Wizard:
  * Generate
    * ESA on/off
    * name
    * project
    * Components tabs?
  * Update prices tab.
  * Prep - removes "prices" and "volume" tabs.
* Save configuration
  * Export/import to JSON
  * Import from XLSX
* UX
  * Enter on Last row adds a new empty row
  * Add Component dialog/Button next to a component to select
  * Other preload templates.  Add a "bare.csv"
  * Modify includes
* Last-modifed timestamps seem to be lost somewhere.  How to keep
  track of changes to include files for the T tab.  Alternatives:
  * Add some metadata lines to the files (during build -> gh pages)?
  * Create a manifest.json during build.

***

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.



## Run everything from the brwoser

* Pre-requisites
  * ExcelJS testing
* price_api
  * query API **MVP1**
  * cache it **MVP2**
* calculation
  * includes
    * **MVP2** stubbed
    * pre-defined files on server
    * input tables UI
    * Import CSV
  * patching
  * normalize **MVP1**
  * preload
    * **MVP2** stubbed
    * pre-defined files on server
    * input tables UI
    * Import CSV
* wiz UI
* XLS generation
  * Support
    * xlfmt
    * xlu
  * xlprice **MVP1**
  * xlass **MVP2**
    * pre-defined files on server
    * input tables UI
  * xlbom **MVP2**
    * use preload data
  * xlesa **MVP5**
  * xlover **MVP4**
  * xlvol **MVP3**
  * ~~xlsrv~~
